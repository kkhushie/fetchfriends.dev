"use client";

import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  code?: string;
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }>;
}

export function ErrorState({
  code = "404",
  title,
  message,
  actions,
}: ErrorStateProps) {
  return (
    <div className="h-full flex items-center justify-center bg-vscode-editor">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vscode-red/20 rounded-full mb-2">
            <AlertCircle className="w-8 h-8 text-vscode-red" />
          </div>
          <div className="font-mono text-2xl text-vscode-red mb-2">
            [{code}]
          </div>
        </div>
        <h3 className="text-lg font-mono text-vscode-text mb-2">{title}</h3>
        <p className="font-mono text-sm text-vscode-text-secondary mb-6">
          {message}
        </p>
        {actions && actions.length > 0 && (
          <div className="flex gap-2 justify-center">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  "px-4 py-2 rounded font-mono text-sm",
                  action.variant === "primary"
                    ? "bg-vscode-blue hover:bg-[#005a9e] text-white"
                    : "bg-[#2d2d30] hover:bg-[#3c3c3c] text-vscode-text"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

