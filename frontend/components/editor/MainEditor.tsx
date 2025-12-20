"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { VideoCallPanel } from "@/components/video/VideoCallPanel";
import { CodeEditorPanel } from "@/components/editor/CodeEditorPanel";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  component: ReactNode;
};

export function MainEditor() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "video",
      label: "video-chat.tsx",
      component: <VideoCallPanel />,
    },
  ]);
  const [activeTab, setActiveTab] = useState("video");

  const addTab = (tab: Tab) => {
    if (!tabs.find((t: Tab) => t.id === tab.id)) {
      setTabs([...tabs, tab]);
    }
    setActiveTab(tab.id);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((t: Tab) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  const activeTabContent = tabs.find((t) => t.id === activeTab)?.component;

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-vscode-editor">
      <div className="flex items-center bg-[#2d2d30] border-b border-[#3c3c3c]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-r border-[#3c3c3c] cursor-pointer",
              "hover:bg-[#2a2d2e]",
              activeTab === tab.id && "bg-vscode-editor border-b-2 border-vscode-blue"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-sm text-vscode-text">{tab.label}</span>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="text-vscode-text-secondary hover:text-vscode-text"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => {
            addTab({
              id: "code",
              label: "shared-terminal.sh",
              component: <CodeEditorPanel />,
            });
          }}
          className="px-4 py-2 text-vscode-text-secondary hover:text-vscode-text text-sm"
        >
          + New Tab
        </button>
      </div>
      <div className="flex-1 overflow-hidden">{activeTabContent}</div>
    </div>
  );
}

