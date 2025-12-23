"use client";

import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  sessionId: string;
  partnerName: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export function FeedbackForm({
  sessionId,
  partnerName,
  onClose,
  onSubmit,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [wouldConnectAgain, setWouldConnectAgain] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Communication",
    "Problem Solving",
    "Code Review",
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.submitFeedback(sessionId, {
        rating,
        comments,
        skillsEndorsed: skills,
        wouldConnectAgain,
      });
      onSubmit?.();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-mono text-vscode-text">
              Rate Your Session
            </h2>
            <button
              onClick={onClose}
              className="text-vscode-text-secondary hover:text-vscode-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-vscode-text-secondary font-mono mb-4">
              How was your session with <span className="text-vscode-text">{partnerName}</span>?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "text-vscode-yellow fill-vscode-yellow"
                        : "text-vscode-text-secondary"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-vscode-text-secondary font-mono mb-2">
              Endorse Skills:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-mono transition-colors",
                    skills.includes(skill)
                      ? "bg-vscode-blue text-white"
                      : "bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c]"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-vscode-text-secondary font-mono mb-2">
              Comments (optional):
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts about the session..."
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-vscode-text text-sm font-mono focus:outline-none focus:border-vscode-blue resize-none"
              rows={4}
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldConnectAgain}
                onChange={(e) => setWouldConnectAgain(e.target.checked)}
                className="w-4 h-4 text-vscode-blue bg-[#1e1e1e] border-[#3c3c3c] rounded focus:ring-vscode-blue"
              />
              <span className="text-sm text-vscode-text font-mono">
                Would connect again
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-2 bg-vscode-green hover:bg-[#3da88a] disabled:bg-[#3c3c3c] disabled:text-vscode-text-secondary rounded text-white font-mono text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded text-vscode-text font-mono text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

