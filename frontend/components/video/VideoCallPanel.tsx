"use client";

import { Mic, Video, Monitor, Square, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function VideoCallPanel() {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [recording, setRecording] = useState(false);

  return (
    <div className="h-full flex flex-col bg-vscode-editor p-4">
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Your Video Feed */}
        <div className="relative bg-[#2d2d30] rounded-lg overflow-hidden border-2 border-vscode-blue">
          <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
            <User className="w-4 h-4 text-vscode-blue" />
            <span className="text-sm text-vscode-text font-mono">YOU</span>
            {muted && (
              <span className="text-xs text-vscode-red bg-vscode-red/20 px-2 py-1 rounded">
                [muted]
              </span>
            )}
            {recording && (
              <span className="text-xs text-vscode-red bg-vscode-red/20 px-2 py-1 rounded flex items-center gap-1">
                <span className="w-2 h-2 bg-vscode-red rounded-full animate-pulse" />
                rec
              </span>
            )}
          </div>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-24 h-24 text-vscode-text-secondary mx-auto mb-2" />
              <p className="text-vscode-text-secondary font-mono text-sm">
                Your video feed
              </p>
            </div>
          </div>
        </div>

        {/* Partner Video Feed */}
        <div className="relative bg-[#2d2d30] rounded-lg overflow-hidden border-2 border-vscode-green">
          <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
            <User className="w-4 h-4 text-vscode-green" />
            <span className="text-sm text-vscode-text font-mono">Nandini</span>
            <span className="text-xs text-vscode-green bg-vscode-green/20 px-2 py-1 rounded">
              ✅ CONNECTED
            </span>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-[#2d2d30]/80 px-2 py-1 rounded text-xs text-vscode-text">
              <p>React Expert</p>
              <p className="text-vscode-yellow">4.8⭐ (42 reviews)</p>
            </div>
          </div>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-24 h-24 text-vscode-green mx-auto mb-2" />
              <p className="text-vscode-text-secondary font-mono text-sm">
                Partner video feed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setMuted(!muted)}
          className={cn(
            "px-4 py-2 rounded flex items-center gap-2 text-sm font-mono",
            muted
              ? "bg-vscode-red text-white"
              : "bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c]"
          )}
        >
          <Mic className="w-4 h-4" />
          Mute
        </button>
        <button
          onClick={() => setVideoOff(!videoOff)}
          className={cn(
            "px-4 py-2 rounded flex items-center gap-2 text-sm font-mono",
            videoOff
              ? "bg-vscode-red text-white"
              : "bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c]"
          )}
        >
          <Video className="w-4 h-4" />
          Stop Video
        </button>
        <button className="px-4 py-2 rounded bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c] flex items-center gap-2 text-sm font-mono">
          <Monitor className="w-4 h-4" />
          Share Screen
        </button>
        <button
          onClick={() => setRecording(!recording)}
          className={cn(
            "px-4 py-2 rounded flex items-center gap-2 text-sm font-mono",
            recording
              ? "bg-vscode-red text-white"
              : "bg-[#2d2d30] text-vscode-text hover:bg-[#3c3c3c]"
          )}
        >
          <Square className="w-4 h-4" />
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
        <button className="px-4 py-2 rounded bg-vscode-red text-white hover:bg-[#d32f2f] flex items-center gap-2 text-sm font-mono">
          <Square className="w-4 h-4" />
          End
        </button>
      </div>
    </div>
  );
}

