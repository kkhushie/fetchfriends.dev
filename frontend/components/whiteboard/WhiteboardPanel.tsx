"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Trash2, Download } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { socketClient } from "@/lib/socket/client";

interface Point {
  x: number;
  y: number;
}

interface DrawData {
  points: Point[];
  color: string;
  lineWidth: number;
}

export function WhiteboardPanel() {
  const { currentSession, isInSession } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#007acc");
  const [lineWidth, setLineWidth] = useState(3);
  const [drawHistory, setDrawHistory] = useState<DrawData[]>([]);

  useEffect(() => {
    if (!isInSession || !currentSession) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Listen for whiteboard updates
    const handleWhiteboardDraw = (data: any) => {
      if (data.userId === currentSession.user?._id) return; // Ignore own drawings
      
      drawLine(ctx, data.points, data.color, data.lineWidth);
    };

    socketClient.getSocket()?.on("whiteboard:draw", handleWhiteboardDraw);

    socketClient.getSocket()?.on("whiteboard:clear", () => {
      clearCanvas(ctx);
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      socketClient.getSocket()?.off("whiteboard:draw", handleWhiteboardDraw);
    };
  }, [isInSession, currentSession]);

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ) => {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawHistory.forEach((draw) => {
      drawLine(ctx, draw.points, draw.color, draw.lineWidth);
    });
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInSession) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const newDraw: DrawData = {
      points: [point],
      color,
      lineWidth,
    };

    setDrawHistory([...drawHistory, newDraw]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isInSession) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lastDraw = drawHistory[drawHistory.length - 1];
    const updatedDraw = {
      ...lastDraw,
      points: [...lastDraw.points, point],
    };

    const newHistory = [...drawHistory];
    newHistory[newHistory.length - 1] = updatedDraw;
    setDrawHistory(newHistory);

    drawLine(ctx, [lastDraw.points[lastDraw.points.length - 1], point], color, lineWidth);

    // Emit to socket
    if (currentSession) {
      socketClient.getSocket()?.emit("whiteboard:draw", {
        sessionId: currentSession._id || currentSession.roomId,
        points: updatedDraw.points,
        color,
        lineWidth,
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx);

    if (currentSession) {
      socketClient.getSocket()?.emit("whiteboard:clear", {
        sessionId: currentSession._id || currentSession.roomId,
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    "#007acc", // VS Code blue
    "#ffffff", // White
    "#ff0000", // Red
    "#00ff00", // Green
    "#ffff00", // Yellow
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
  ];

  return (
    <div className="h-full flex flex-col bg-vscode-editor">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c] bg-[#2d2d30]">
        <span className="text-sm text-vscode-text font-mono">WHITEBOARD</span>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded border-2 ${
                  color === c ? "border-vscode-blue" : "border-[#3c3c3c]"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-1 bg-[#1e1e1e] hover:bg-[#3c3c3c] rounded text-vscode-text text-sm font-mono flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-[#1e1e1e] hover:bg-[#3c3c3c] rounded text-vscode-text text-sm font-mono flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ backgroundColor: "#1e1e1e" }}
        />
      </div>
    </div>
  );
}

