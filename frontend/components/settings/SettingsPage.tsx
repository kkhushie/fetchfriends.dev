"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor for settings JSON
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);

const defaultSettings = `{
  "fetchfriends.theme": "vs-code-dark",
  "fetchfriends.video": {
    "quality": "720p",
    "autoMute": false,
    "preferredCamera": "face"
  },
  "fetchfriends.matching": {
    "primaryLanguage": "javascript",
    "experienceLevel": "intermediate",
    "autoAccept": true,
    "sessionLength": 25
  },
  "fetchfriends.editor": {
    "fontFamily": "Cascadia Code",
    "fontSize": 14,
    "theme": "Dark+",
    "formatOnSave": true
  },
  "fetchfriends.privacy": {
    "recordSessions": false,
    "showGitHubStats": true,
    "appearAnonymous": false
  }
}`;

export function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isValid, setIsValid] = useState(true);

  const validateJSON = (json: string) => {
    try {
      JSON.parse(json);
      setIsValid(true);
      return true;
    } catch {
      setIsValid(false);
      return false;
    }
  };

  const handleSave = () => {
    if (validateJSON(settings)) {
      // Save settings logic here
      alert("Settings saved!");
    }
  };

  return (
    <div className="h-full flex flex-col bg-vscode-editor">
      <div className="h-10 flex items-center justify-between px-4 border-b border-[#3c3c3c] bg-[#2d2d30]">
        <span className="text-sm font-mono text-vscode-text">
          FETCHFRIENDS SETTINGS (settings.json)
        </span>
        <div className="flex gap-2">
          {!isValid && (
            <span className="text-xs text-vscode-red font-mono">
              Invalid JSON
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-3 py-1 bg-vscode-blue hover:bg-[#005a9e] disabled:bg-[#3c3c3c] disabled:text-vscode-text-secondary rounded text-sm font-mono text-white"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={settings}
          onChange={(value) => {
            setSettings(value || "");
            validateJSON(value || "");
          }}
          options={{
            fontSize: 13,
            minimap: { enabled: true },
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: "Cascadia Code, Fira Code, Consolas, monospace",
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}

