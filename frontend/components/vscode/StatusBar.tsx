"use client";

import { Zap, Battery, Code } from "lucide-react";

export function StatusBar() {
  return (
    <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>Online</span>
        </div>
        <div className="flex items-center gap-1">
          <Code className="w-3 h-3" />
          <span>JavaScript</span>
        </div>
        <span>Looking: Pair programming</span>
      </div>
      <div className="flex items-center gap-4">
        <span>GitHub: 24 repos</span>
        <div className="flex items-center gap-1">
          <Battery className="w-3 h-3" />
          <span>Session: 22:45/25:00</span>
        </div>
        <span>🐛 No bugs reported</span>
      </div>
    </div>
  );
}

