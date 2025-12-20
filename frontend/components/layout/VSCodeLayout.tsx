"use client";

import { useState, useEffect } from "react";
import { ActivityBar } from "@/components/vscode/ActivityBar";
import { Sidebar } from "@/components/vscode/Sidebar";
import { StatusBar } from "@/components/vscode/StatusBar";
import { MainEditor } from "@/components/editor/MainEditor";
import { CommandPalette } from "@/components/ui/CommandPalette";

export function VSCodeLayout() {
  const [activePanel, setActivePanel] = useState<string | null>("explorer");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P for command palette
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Ctrl+B to toggle sidebar
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarVisible]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vscode-dark">
      <ActivityBar
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />
      {sidebarVisible && (
        <Sidebar
          activePanel={activePanel}
          onClose={() => setSidebarVisible(false)}
        />
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        <MainEditor />
        <StatusBar />
      </div>
      {commandPaletteOpen && (
        <CommandPalette onClose={() => setCommandPaletteOpen(false)} />
      )}
    </div>
  );
}

