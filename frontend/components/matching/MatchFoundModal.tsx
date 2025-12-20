"use client";

import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchFoundModalProps {
  onAccept: () => void;
  onDecline: () => void;
  onRemindLater: () => void;
}

export function MatchFoundModal({
  onAccept,
  onDecline,
  onRemindLater,
}: MatchFoundModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-vscode-green rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-mono text-vscode-text">
                Match Found!
              </h3>
              <p className="text-sm text-vscode-text-secondary font-mono">
                Notification
              </p>
            </div>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-vscode-blue rounded-full flex items-center justify-center">
                <span className="text-white font-mono">M</span>
              </div>
              <div>
                <p className="text-vscode-text font-mono font-semibold">
                  Nandini (React Expert)
                </p>
                <p className="text-vscode-text-secondary font-mono text-xs">
                  wants to pair program
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#3c3c3c]">
              <div className="flex items-center gap-4 text-xs text-vscode-text-secondary font-mono">
                <span>⭐ 4.8 (42 reviews)</span>
                <span>•</span>
                <span>⚡ Online</span>
                <span>•</span>
                <span>💻 JavaScript, React</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-vscode-green hover:bg-[#3da88a] rounded text-white font-mono text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded text-vscode-text font-mono text-sm flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
            <button
              onClick={onRemindLater}
              className="px-4 py-2 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded text-vscode-text font-mono text-sm flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

