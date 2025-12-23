"use client";

import { Github, Linkedin, GitBranch } from "lucide-react";

export function WelcomeScreen() {
  const handleGitHubAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/github`;
  };

  const handleLinkedInAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/linkedin`;
  };

  return (
    <div className="h-screen w-screen bg-vscode-dark flex items-center justify-center">
      <div className="max-w-md w-full bg-[#252526] border border-[#3c3c3c] rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vscode-blue font-mono mb-2">
            FETCHFRIENDS
          </h1>
          <p className="text-vscode-text-secondary font-mono text-sm">
            _fetch(your next coding companion)
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={handleGitHubAuth}
            className="w-full px-4 py-3 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded flex items-center justify-center gap-3 text-vscode-text font-mono border border-[#3c3c3c] transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
          <button
            onClick={handleLinkedInAuth}
            className="w-full px-4 py-3 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded flex items-center justify-center gap-3 text-vscode-text font-mono border border-[#3c3c3c] transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span>Continue with LinkedIn</span>
          </button>
          <button className="w-full px-4 py-3 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded flex items-center justify-center gap-3 text-vscode-text font-mono border border-[#3c3c3c] transition-colors">
            <GitBranch className="w-5 h-5" />
            <span>Continue with GitLab</span>
          </button>
        </div>

        <div className="border-t border-[#3c3c3c] pt-6">
          <p className="text-vscode-text-secondary text-sm font-mono mb-3">
            Recent Connections:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d30] rounded hover:bg-[#3c3c3c] cursor-pointer">
              <span className="text-vscode-text font-mono text-sm">
                Ajinkya.js
              </span>
              <span className="text-vscode-text-secondary text-xs">
                last: 2 hours ago
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d30] rounded hover:bg-[#3c3c3c] cursor-pointer">
              <span className="text-vscode-text font-mono text-sm">
                KhushiePal.ts
              </span>
              <span className="text-vscode-text-secondary text-xs">
                last: 1 day ago
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-vscode-text-secondary text-xs font-mono">
            Tip: fetch() is loading developers near you...
          </p>
        </div>
      </div>
    </div>
  );
}
