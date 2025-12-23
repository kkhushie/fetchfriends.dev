"use client";

import { useState, useEffect } from "react";
import { Square, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";

export function SearchConsole() {
  const { isSearching, queueStatus, startSearch, stopSearch } = useSession();
  const [progress, setProgress] = useState(65);
  const [queuePosition, setQueuePosition] = useState(0);

  useEffect(() => {
    if (queueStatus) {
      setQueuePosition(queueStatus.position || 0);
      const estimatedWait = queueStatus.estimatedWait || 0;
      setProgress(Math.min(100, (estimatedWait / 180) * 100));
    } else {
      setProgress(0);
      setQueuePosition(0);
    }
  }, [queueStatus]);

  const handleStartSearch = async () => {
    try {
      await startSearch('random', {
        languages: ['JavaScript', 'Python'],
        experience: 'intermediate',
        goals: ['pair-programming'],
        maxWaitTime: 180,
      });
    } catch (error) {
      console.error('Error starting search:', error);
    }
  };

  return (
    <div className="h-full bg-vscode-editor p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-mono text-vscode-text mb-2">CONSOLE</h2>
          <div className="bg-[#1e1e1e] p-4 rounded font-mono text-sm text-vscode-text-secondary">
            <div className="mb-2">
              <span className="text-vscode-blue">&gt;</span>{" "}
              <span className="text-vscode-yellow">fetch</span>
              <span className="text-vscode-text">(</span>
              <span className="text-vscode-green">
                'https://api.fetchfriends.dev/match'
              </span>
              <span className="text-vscode-text">)</span>
            </div>
            <div>
              <span className="text-vscode-text">  .</span>
              <span className="text-vscode-yellow">then</span>
              <span className="text-vscode-text">(</span>
              <span className="text-vscode-purple">dev</span>{" "}
              <span className="text-vscode-text">=&gt;</span>{" "}
              <span className="text-vscode-yellow">connect</span>
              <span className="text-vscode-text">(</span>
              <span className="text-vscode-purple">dev</span>
              <span className="text-vscode-text">))</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vscode-green font-mono text-sm">
              [status: {isSearching ? '202 ACCEPTED' : 'READY'}]
            </span>
          </div>
          <p className="text-vscode-text-secondary font-mono text-sm mb-4">
            {isSearching ? 'Searching for compatible developer...' : 'Ready to search'}
          </p>
          {isSearching && (
            <>
              <div className="w-full bg-[#1e1e1e] rounded-full h-2 mb-2">
                <div
                  className="bg-vscode-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-vscode-text-secondary font-mono text-xs">
                {Math.round(progress)}%
              </div>
            </>
          )}
        </div>

        <div className="mb-6 bg-[#1e1e1e] p-4 rounded">
          <p className="text-vscode-text-secondary font-mono text-sm mb-3">
            Parameters:
          </p>
          <ul className="space-y-1 text-vscode-text font-mono text-sm ml-4">
            <li>
              <span className="text-vscode-text-secondary">-</span> Language:{" "}
              <span className="text-vscode-blue">JavaScript, Python</span>
            </li>
            <li>
              <span className="text-vscode-text-secondary">-</span> Looking
              for: <span className="text-vscode-blue">Pair programming</span>
            </li>
            <li>
              <span className="text-vscode-text-secondary">-</span>{" "}
              Experience: <span className="text-vscode-blue">Intermediate</span>
            </li>
          </ul>
        </div>

        {isSearching && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-vscode-text-secondary font-mono text-sm">
                Queue position:
              </span>
              <span className="text-vscode-text font-mono text-sm">
                #{queuePosition}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-vscode-text-secondary font-mono text-sm">
                Estimated time:
              </span>
              <span className="text-vscode-text font-mono text-sm">1:30</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={isSearching ? stopSearch : handleStartSearch}
            className={cn(
              "px-4 py-2 rounded font-mono text-sm flex items-center gap-2",
              isSearching
                ? "bg-vscode-red text-white hover:bg-[#d32f2f]"
                : "bg-vscode-green text-white hover:bg-[#3da88a]"
            )}
          >
            <Square className="w-4 h-4" />
            {isSearching ? "Stop Search" : "Start Search"}
          </button>
          <button className="px-4 py-2 rounded bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c] font-mono text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Edit Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
