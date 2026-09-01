import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);
  const currentStrokeId = useRef<string | null>(null);
  const pointIdCounter = useRef(0);
  const lastSentTime = useRef(0);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/whiteboardhub`)
        .withAutomaticReconnect()
        .build();

    connectionRef.current = connection;

    connection.start().catch((err) => console.error("SignalR connection failed:", err));

    return () => {
      connection.stop();
    };
  }, []);
  function getContext(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function getMousePos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    lastPoint.current = getMousePos(e);
    currentStrokeId.current = crypto.randomUUID();
    pointIdCounter.current = 0;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !lastPoint.current) return;

    const ctx = getContext();
    if (!ctx) return;

    const currentPoint = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    lastPoint.current = currentPoint;

    const now = Date.now();
    if (now - lastSentTime.current >= 40) { // ~25 times/second
      lastSentTime.current = now;
      sendPointToServer(currentPoint);
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
    lastPoint.current = null;
  }

  function sendPointToServer(point: { x: number; y: number }) {
    const connection = connectionRef.current;
    if (!connection || connection.state !== "Connected") return;

    const payload = {
      pointId: pointIdCounter.current++,
      x: point.x,
      y: point.y,
      strokeId: currentStrokeId.current,
      color: "black",
      thickness: 3,
    };

    connection.invoke("SendPoint", payload).catch((err) => console.error("Send failed:", err));
  }

  return (
      <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: "1px solid black", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
      />
  );
}