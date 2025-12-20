"use client";

import { FileQuestion, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "connections" | "chat" | "general";
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  type,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "connections":
        return {
          icon: <Users className="w-12 h-12 text-vscode-text-secondary" />,
          title: "No connections yet",
          defaultMessage: (
            <div className="font-mono text-sm text-vscode-text-secondary">
              <p className="mb-2">📁 connections/</p>
              <p className="ml-4">└── (empty)</p>
              <p className="mt-4">Tip: Click the search icon to find developers!</p>
            </div>
          ),
        };
      case "chat":
        return {
          icon: <MessageSquare className="w-12 h-12 text-vscode-text-secondary" />,
          title: "No messages yet",
          defaultMessage: (
            <div className="font-mono text-sm text-vscode-text-secondary">
              <p className="mb-2">// No messages yet</p>
              <p>console.log("Start the conversation!");</p>
              <p className="mt-2">// Type your first message below...</p>
            </div>
          ),
        };
      default:
        return {
          icon: <FileQuestion className="w-12 h-12 text-vscode-text-secondary" />,
          title: "Empty",
          defaultMessage: (
            <p className="font-mono text-sm text-vscode-text-secondary">
              {message || "Nothing here yet"}
            </p>
          ),
        };
    }
  };

  const content = getContent();

  return (
    <div className="h-full flex items-center justify-center bg-vscode-editor">
      <div className="text-center">
        <div className="mb-4 flex justify-center">{content.icon}</div>
        <h3 className="text-lg font-mono text-vscode-text mb-2">
          {content.title}
        </h3>
        <div className="mb-4">{content.defaultMessage}</div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-vscode-blue hover:bg-[#005a9e] rounded text-white font-mono text-sm"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

