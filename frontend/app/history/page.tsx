"use client";

import { useEffect, useState } from "react";
import { Clock, User, Code, Star, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { LoadingState } from "@/components/ui/LoadingState";

export default function MatchHistory() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      const response = await apiClient.getMatchHistory();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-vscode-dark flex items-center justify-center">
        <div className="text-vscode-text">Please log in to view your history</div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Loading match history..." />;
  }

  return (
    <div className="min-h-screen bg-vscode-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono text-vscode-text mb-2">
            Match History
          </h1>
          <p className="text-vscode-text-secondary font-mono">
            Your past coding sessions and collaborations
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-8 text-center">
            <p className="text-vscode-text-secondary font-mono mb-4">
              No sessions yet. Start matching to see your history here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 hover:border-vscode-blue transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-mono text-vscode-text mb-2">
                      Session #{session.roomId?.slice(0, 8)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-vscode-text-secondary font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration || 0} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        {session.language || 'Mixed'}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#1e1e1e] rounded text-xs font-mono text-vscode-text-secondary">
                    {session.status}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-vscode-text-secondary font-mono mb-2">
                    Participants:
                  </p>
                  <div className="flex gap-2">
                    {session.participants?.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] rounded"
                      >
                        <User className="w-4 h-4 text-vscode-blue" />
                        <span className="text-sm text-vscode-text font-mono">
                          {p.user?.profile?.name || 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {session.feedback && session.feedback.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#3c3c3c]">
                    <p className="text-sm text-vscode-text-secondary font-mono mb-2">
                      Feedback:
                    </p>
                    {session.feedback.map((fb: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-vscode-yellow fill-vscode-yellow" />
                        <span className="text-sm text-vscode-text font-mono">
                          {fb.rating}/5
                        </span>
                        {fb.comments && (
                          <span className="text-xs text-vscode-text-secondary font-mono">
                            - {fb.comments}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

