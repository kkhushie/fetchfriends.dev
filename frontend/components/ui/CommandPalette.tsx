"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onClose: () => void;
}

const commands = [
  { id: "new-session", label: "Start new session", icon: "▶" },
  { id: "random-dev", label: "Join random developer", icon: "🎲" },
  { id: "search-tech", label: "Search by tech stack", icon: "🔍" },
  { id: "share-screen", label: "Share screen", icon: "🖥" },
  { id: "start-recording", label: "Start recording", icon: "🔴" },
  { id: "whiteboard", label: "Open whiteboard", icon: "📝" },
  { id: "invite-github", label: "Invite to GitHub repo", icon: "🔗" },
  { id: "report", label: "Report user", icon: "⚠" },
  { id: "end-session", label: "End session", icon: "⏹" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Handle command execution
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands.length, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50">
      <div className="w-[600px] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3c3c3c]">
          <Search className="w-4 h-4 text-vscode-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="FetchFriends Command Palette"
            className="flex-1 bg-transparent text-vscode-text outline-none font-mono"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-vscode-text-secondary hover:text-vscode-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-vscode-text-secondary">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={onClose}
                className={cn(
                  "w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#2a2d2e]",
                  index === selectedIndex && "bg-[#2a2d2e]"
                )}
              >
                <span className="text-lg">{cmd.icon}</span>
                <span className="text-vscode-text font-mono text-sm">
                  {cmd.label}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-[#3c3c3c] text-xs text-vscode-text-secondary">
          Press Enter to execute, Esc to close
        </div>
      </div>
    </div>
  );
}

