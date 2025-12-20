"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface NotificationProps {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose: () => void;
  autoClose?: number;
}

export function Notification({
  type = "info",
  title,
  message,
  onClose,
  autoClose = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-vscode-green" />,
    error: <AlertCircle className="w-5 h-5 text-vscode-red" />,
    warning: <AlertTriangle className="w-5 h-5 text-vscode-yellow" />,
    info: <Info className="w-5 h-5 text-vscode-blue" />,
  };

  const bgColors = {
    success: "bg-vscode-green/10 border-vscode-green/30",
    error: "bg-vscode-red/10 border-vscode-red/30",
    warning: "bg-vscode-yellow/10 border-vscode-yellow/30",
    info: "bg-vscode-blue/10 border-vscode-blue/30",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-80 bg-[#252526] border rounded-lg shadow-2xl z-50 p-4",
        bgColors[type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <h4 className="font-mono text-sm text-vscode-text font-semibold mb-1">
            {title}
          </h4>
          {message && (
            <p className="font-mono text-xs text-vscode-text-secondary">
              {message}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-vscode-text-secondary hover:text-vscode-text"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

