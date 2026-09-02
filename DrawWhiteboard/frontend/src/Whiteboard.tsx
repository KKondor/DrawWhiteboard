import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import styles from "./Whiteboard.module.css";
import {useDelayedFlag} from "./hooks/useDelayedFlag.ts";

interface RemotePoint {
  pointId: number;
  x: number;
  y: number;
  strokeId: string;
  color: string;
  thickness: number;
}

interface RemoteStroke {
  strokeId: string;
  color: string;
  thickness: number;
  points: RemotePoint[];
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [thickness, setThickness] = useState(3);
  const [isErasing, setIsErasing] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "failed">("connecting");
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const activeColor = isErasing ? "#ffffff" : color;
  const activeThickness = thickness;

  const showColdStartMessage = useDelayedFlag(connectionStatus === "connecting", 3000);
  const connectionRef = useRef<HubConnection | null>(null);
  const currentStrokeId = useRef<string | null>(null);
  const pointIdCounter = useRef(0);
  const lastSentTime = useRef(0);
  const lastPointByStroke = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/whiteboardhub`)
        .withAutomaticReconnect()
        .build();

    connectionRef.current = connection;

    connection.on("ReceivePoint", (point: RemotePoint) => {
      const lastForStroke = lastPointByStroke.current.get(point.strokeId);
      if (lastForStroke) {
        drawSegment(lastForStroke, { x: point.x, y: point.y }, point.color, point.thickness);
      }
      lastPointByStroke.current.set(point.strokeId, { x: point.x, y: point.y });
    });

    connection.onreconnecting(() => setConnectionStatus("connecting"));
    connection.onreconnected(() => setConnectionStatus("connected"));
    connection.onclose(() => setConnectionStatus("failed"));

    connection.start()
        .then(() => {
          setConnectionStatus("connected");
          return connection.invoke("GetStrokeHistory");
        })
        .then((strokes: RemoteStroke[]) => {
          for (const stroke of strokes) {
            let prev: { x: number; y: number } | null = null;
            for (const point of stroke.points) {
              const current = { x: point.x, y: point.y };
              if (prev) {
                drawSegment(prev, current, stroke.color, stroke.thickness);
              }
              prev = current;
            }
          }
        })
        .catch((err) => {
          console.error("SignalR setup failed:", err);
          setConnectionStatus("failed");
        });

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

    const displayPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const canvasPos = {
      x: displayPos.x * scaleX,
      y: displayPos.y * scaleY,
    };

    return { canvasPos, displayPos };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (connectionStatus !== "connected") return;
    setIsDrawing(true);
    const { canvasPos } = getMousePos(e);
    lastPoint.current = canvasPos;
    currentStrokeId.current = crypto.randomUUID();
    pointIdCounter.current = 0;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { canvasPos, displayPos } = getMousePos(e);
    setCursorPos(displayPos);

    if (!isDrawing || !lastPoint.current) return;

    const ctx = getContext();
    if (!ctx) return;

    drawSegment(lastPoint.current, canvasPos, activeColor, activeThickness);

    lastPoint.current = canvasPos;

    const now = Date.now();
    if (now - lastSentTime.current >= 20) {
      lastSentTime.current = now;
      sendPointToServer(canvasPos);
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
      color: activeColor,
      thickness: activeThickness,
    };

    connection.invoke("SendPoint", payload).catch((err) => console.error("Send failed:", err));
  }

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    exportCtx.fillStyle = "white";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0);

    const dataUrl = exportCanvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `whiteboard-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
    link.click();
  }

  function drawSegment(from: { x: number; y: number }, to: { x: number; y: number }, color: string, thickness: number) {
    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  return (
      <div className={styles.rootContainer}>
        <div className={styles.toolbar}>
          <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isErasing}
              className={styles.colorPicker}/>
          <input
              type="range"
              min={1}
              max={30}
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className={styles.thicknessSlider}/>
          <span className={styles.thicknessLabel}>{thickness}px</span>
          <button
              onClick={() => setIsErasing((prev) => !prev)}
              className={isErasing ? styles.eraserActive : styles.eraserButton}
          >
            Eraser
          </button>
          <button onClick={handleExport} className={styles.exportButton}>
            Download PNG
          </button>
        </div>
        <div className={styles.canvasOuter}>
          <div className={styles.canvasWrapper}>
            {connectionStatus !== "connected" && (
                <div className={styles.connectionOverlay}>
                  {connectionStatus === "connecting" && (
                      <div className={styles.spinner} />
                  )}

                  <p>
                    {connectionStatus === "failed"
                        ? "Couldn't connect to the server."
                        : "Connecting..."}
                  </p>

                  {showColdStartMessage && connectionStatus === "connecting" && (
                      <p className={styles.coldStartMessage}>
                        The server may be waking up from sleep, this can take up to a minute.
                      </p>
                  )}
                </div>
            )}
            <canvas
                className={styles.canvas}
                ref={canvasRef}
                width={1200}
                height={800}
                style={{ touchAction: "none" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  handleMouseUp();
                  setCursorPos(null);
                }}
            />
          {cursorPos && (
              <div
                  className={styles.cursorPreview}
                  style={{
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: activeThickness,
                    height: activeThickness,
                    backgroundColor: isErasing ? "transparent" : activeColor,
                    borderColor: isErasing ? "gray" : "white",
                  }}
              />
              )}
        </div>
        </div>
      </div>
  );
}