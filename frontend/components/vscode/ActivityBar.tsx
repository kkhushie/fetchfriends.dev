"use client";

import {
  FolderOpen,
  Search,
  GitBranch,
  Bug,
  Puzzle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
}

const activities = [
  { id: "explorer", icon: FolderOpen, label: "Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "git", icon: GitBranch, label: "Git" },
  { id: "debug", icon: Bug, label: "Debug" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
  { id: "account", icon: User, label: "Account" },
];

export function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  return (
    <div className="w-12 bg-vscode-sidebar flex flex-col items-center py-2 border-r border-vscode-sidebar">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const isActive = activePanel === activity.id;
        return (
          <button
            key={activity.id}
            onClick={() => onPanelChange(isActive ? null : activity.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center mb-1 rounded transition-colors",
              "hover:bg-[#2a2d2e]",
              isActive && "bg-[#2a2d2e] border-l-2 border-vscode-blue"
            )}
            title={activity.label}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                isActive ? "text-vscode-blue" : "text-vscode-text-secondary"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

