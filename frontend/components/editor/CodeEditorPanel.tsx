"use client";

import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);

export function CodeEditorPanel() {
  return (
    <div className="h-full bg-vscode-editor">
      <MonacoEditor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        defaultValue={`// Welcome to FetchFriends Code Editor
// This is a shared Monaco Editor (VS Code in browser)

import { Webcam, Peer } from 'fetchfriends-sdk';

// ====== LIVE VIDEO FEEDS ======
const connection = new Peer({
  localVideo: document.getElementById('you'),
  remoteVideo: document.getElementById('partner')
});

// Your feed (draggable panel)
const YourFeed = () => {
  return (
    <div className="video-panel">
      <h2>👨‍💻 YOU</h2>
      <video id="you" autoPlay muted />
    </div>
  );
};

// Partner's feed (draggable panel)
const PartnerFeed = () => {
  return (
    <div className="video-panel">
      <h2>👩‍💻 Nandini</h2>
      <video id="partner" autoPlay />
      <p>✅ CONNECTED</p>
    </div>
  );
};

// Start coding together!
`}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontFamily: "Cascadia Code, Fira Code, Consolas, monospace",
        }}
      />
    </div>
  );
}

