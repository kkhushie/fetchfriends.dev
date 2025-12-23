"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Link, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";
import { socketClient } from "@/lib/socket/client";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string | number;
  sender: string;
  senderId?: string;
  text: string;
  time: string;
  type?: 'text' | 'code' | 'link' | 'file';
}

export function ChatPanel() {
  const { currentSession, isInSession } = useSession();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "System", text: "Chat connected. Start typing to collaborate!", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInSession || !currentSession) return;

    // Join session room for chat
    socketClient.joinSession(currentSession._id || currentSession.roomId);

    // Listen for incoming messages
    const handleMessage = (data: any) => {
      const newMessage: Message = {
        id: Date.now(),
        sender: data.userId === user?._id ? "You" : data.userName || "Partner",
        senderId: data.userId,
        text: data.message,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: data.type || 'text',
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socketClient.onChatMessage(handleMessage);

    return () => {
      socketClient.off('chat:message', handleMessage);
    };
  }, [isInSession, currentSession, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && currentSession) {
      const sessionId = currentSession._id || currentSession.roomId;
      socketClient.emitChatMessage(sessionId, input.trim(), 'text');
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "You",
          text: input.trim(),
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setInput("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-vscode-editor">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#3c3c3c] bg-[#2d2d30]">
        <span className="text-sm text-vscode-text font-mono">CHAT</span>
        <span className="text-xs text-vscode-text-secondary">WHITEBOARD</span>
        <span className="text-xs text-vscode-text-secondary">RESOURCES</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "p-2 rounded",
              msg.sender === "You"
                ? "bg-vscode-blue/20 ml-auto max-w-[70%]"
                : "bg-[#2d2d30] mr-auto max-w-[70%]"
            )}
          >
            <div className="text-xs text-vscode-text-secondary mb-1">
              [{msg.time}] {msg.sender}:
            </div>
            <div className="text-sm text-vscode-text font-mono">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#3c3c3c] bg-[#2d2d30]">
        <div className="flex gap-2 mb-2">
          <button className="p-2 hover:bg-[#3c3c3c] rounded text-vscode-text-secondary hover:text-vscode-text">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[#3c3c3c] rounded text-vscode-text-secondary hover:text-vscode-text">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[#3c3c3c] rounded text-vscode-text-secondary hover:text-vscode-text">
            <Link className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Type here... [Ctrl+Enter to send]"
            className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-vscode-text text-sm focus:outline-none focus:border-vscode-blue font-mono"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-vscode-blue hover:bg-[#005a9e] rounded text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

