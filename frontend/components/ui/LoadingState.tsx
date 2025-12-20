"use client";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="h-full flex items-center justify-center bg-vscode-editor">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-vscode-blue border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <p className="font-mono text-sm text-vscode-text-secondary mb-2">
          [Fetching...]
        </p>
        <div className="w-64 h-1 bg-[#2d2d30] rounded-full overflow-hidden">
          <div className="h-full bg-vscode-blue animate-pulse" style={{ width: "70%" }} />
        </div>
        <p className="font-mono text-xs text-vscode-text-secondary mt-4">
          {message}
        </p>
      </div>
    </div>
  );
}

