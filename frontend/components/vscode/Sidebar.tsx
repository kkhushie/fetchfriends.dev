"use client";

import { X, FileText, Code, Folder, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context"; // Add this import

interface SidebarProps {
  activePanel: string | null;
  onClose: () => void;
}

export function Sidebar({ activePanel, onClose }: SidebarProps) {

  const { isAuthenticated, logout } = useAuth(); // Get auth state

  const renderPanel = () => {
    switch (activePanel) {
      case "explorer":
        return <ProfileExplorer />;
      case "search":
        return <SearchPanel />;
      case "git":
        return <GitPanel />;
      case "debug":
        return <DebugPanel />;
      case "extensions":
        return <ExtensionsPanel />;
      case "account":
        return <AccountPanel onSignOut={logout} isAuthenticated={isAuthenticated} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-vscode-sidebar flex flex-col border-r border-vscode-sidebar">
      <div className="h-10 flex items-center justify-between px-4 border-b border-vscode-sidebar">
        <span className="text-sm font-medium text-vscode-text uppercase">
          {activePanel === "explorer" && "Explorer"}
          {activePanel === "search" && "Search"}
          {activePanel === "git" && "Source Control"}
          {activePanel === "debug" && "Run and Debug"}
          {activePanel === "extensions" && "Extensions"}
          {activePanel === "account" && "Account"}
        </span>
        <button
          onClick={onClose}
          className="text-vscode-text-secondary hover:text-vscode-text"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{renderPanel()}</div>
    </div>
  );
}

function ProfileExplorer() {
  return (
    <div className="p-2 font-mono text-xs">
      <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
        <User className="w-4 h-4 text-vscode-blue" />
        <span className="text-vscode-text">YourName.js</span>
      </div>
      <div className="ml-4 mt-1">
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
          <FileText className="w-3 h-3 text-vscode-yellow" />
          <span className="text-vscode-text-secondary">package.json</span>
        </div>
        <div className="ml-4">
          <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
            <Folder className="w-3 h-3 text-vscode-blue" />
            <span className="text-vscode-text-secondary">src/</span>
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
              <Code className="w-3 h-3 text-vscode-green" />
              <span className="text-vscode-text-secondary">experience.js</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
              <Code className="w-3 h-3 text-vscode-green" />
              <span className="text-vscode-text-secondary">languages.ts</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
              <Folder className="w-3 h-3 text-vscode-blue" />
              <span className="text-vscode-text-secondary">projects/</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
          <FileText className="w-3 h-3 text-vscode-yellow" />
          <span className="text-vscode-text-secondary">README.md</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer">
          <Settings className="w-3 h-3 text-vscode-text-secondary" />
          <span className="text-vscode-text-secondary">.env</span>
        </div>
      </div>
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search developers..."
        className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-vscode-text text-sm focus:outline-none focus:border-vscode-blue"
      />
      <div className="mt-4 text-vscode-text-secondary text-xs">
        <p>Search by:</p>
        <ul className="mt-2 space-y-1 ml-4">
          <li>• Tech stack</li>
          <li>• Experience level</li>
          <li>• Availability</li>
          <li>• Goals</li>
        </ul>
      </div>
    </div>
  );
}

function GitPanel() {
  return (
    <div className="p-4">
      <div className="text-vscode-text-secondary text-sm">
        <p>GitHub Integration</p>
        <div className="mt-4 space-y-2">
          <button className="w-full px-3 py-2 bg-vscode-blue hover:bg-[#005a9e] rounded text-sm text-white">
            Connect GitHub
          </button>
          <div className="text-xs mt-4">
            <p>Connected repos: 0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DebugPanel() {
  return (
    <div className="p-4">
      <div className="text-vscode-text-secondary text-sm">
        <p>Debug Sessions</p>
        <div className="mt-4 text-xs">
          <p>No active debug sessions</p>
        </div>
      </div>
    </div>
  );
}

function ExtensionsPanel() {
  return (
    <div className="p-4">
      <div className="text-vscode-text-secondary text-sm">
        <p>Features & Plugins</p>
        <div className="mt-4 space-y-2 text-xs">
          <div className="p-2 bg-[#2a2d2e] rounded">
            <p className="text-vscode-text">Video Chat</p>
            <p className="text-vscode-text-secondary">Enabled</p>
          </div>
          <div className="p-2 bg-[#2a2d2e] rounded">
            <p className="text-vscode-text">Code Editor</p>
            <p className="text-vscode-text-secondary">Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
interface AccountPanelProps {
  onSignOut: () => void;
  isAuthenticated: boolean;
}

function AccountPanel({ onSignOut, isAuthenticated }: AccountPanelProps) {
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      onSignOut();
      window.location.href = "/"; // Redirect to home after logout
    }
  };

  return (
    <div className="p-4">
      <div className="text-vscode-text-secondary text-sm">
        <p>Profile & Settings</p>
        <div className="mt-4 space-y-2">
          {isAuthenticated ? (
            <>
              <button className="w-full px-3 py-2 bg-[#2a2d2e] hover:bg-[#3c3c3c] rounded text-sm text-vscode-text text-left">
                Edit Profile
              </button>
              <button className="w-full px-3 py-2 bg-[#2a2d2e] hover:bg-[#3c3c3c] rounded text-sm text-vscode-text text-left">
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 rounded text-sm text-red-400 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-vscode-text-secondary mb-3">Not signed in</p>
              <a
                href="/login"
                className="inline-block px-4 py-2 bg-vscode-blue hover:bg-[#005a9e] rounded text-sm text-white"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
