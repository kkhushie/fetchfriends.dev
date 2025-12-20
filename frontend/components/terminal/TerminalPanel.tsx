"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc",
        cursor: "#007acc",
      },
      fontSize: 13,
      fontFamily: "Cascadia Code, Fira Code, Consolas, monospace",
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Initial welcome message
    terminal.writeln("$ fetchfriends-session --user maria-js-expert");
    terminal.writeln("Connected to session #a3f5b2");
    terminal.writeln("Session: Pair programming React optimization");
    terminal.writeln("Time: 22:45/25:00 remaining");
    terminal.writeln("");
    terminal.writeln("user@fetchfriends:~$ ");

    xtermRef.current = terminal;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
    };
  }, []);

  return (
    <div className="h-full bg-vscode-editor p-4">
      <div className="h-full bg-[#1e1e1e] rounded border border-[#3c3c3c]">
        <div ref={terminalRef} className="h-full" />
      </div>
      <div className="mt-2 text-xs text-vscode-text-secondary font-mono">
        # Read-only terminal - safe execution
      </div>
    </div>
  );
}

