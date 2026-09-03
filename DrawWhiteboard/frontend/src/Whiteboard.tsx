import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import styles from "./Whiteboard.module.css";
import {useDelayedFlag} from "./hooks/useDelayedFlag.ts";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

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

  const strokeHistory = useRef<Map<string, RemoteStroke>>(new Map());
  const [lastOwnStrokeId, setLastOwnStrokeId] = useState<string | null>(null);

  const showColdStartMessage = useDelayedFlag(connectionStatus === "connecting", 3000);
  const connectionRef = useRef<HubConnection | null>(null);
  const currentStrokeId = useRef<string | null>(null);
  const pointIdCounter = useRef(0);
  const lastSentTime = useRef(0);
  const lastPointByStroke = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "e" || e.key === "E") {
        setIsErasing((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastOwnStrokeId]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/whiteboardhub`)
        .withAutomaticReconnect()
        .build();

    connectionRef.current = connection;

    connection.on("ReceivePoint", (point: RemotePoint) => {
      let stroke = strokeHistory.current.get(point.strokeId);
      if (!stroke) {
        stroke = { strokeId: point.strokeId, color: point.color, thickness: point.thickness, points: [] };
        strokeHistory.current.set(point.strokeId, stroke);
      }
      stroke.points.push(point);

      const lastForStroke = lastPointByStroke.current.get(point.strokeId);
      if (lastForStroke) {
        drawSegment(lastForStroke, { x: point.x, y: point.y }, point.color, point.thickness);
      }
      lastPointByStroke.current.set(point.strokeId, { x: point.x, y: point.y });
    });

    connection.on("StrokeRemoved", (strokeId: string) => {
      strokeHistory.current.delete(strokeId);
      redrawAll();
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
            strokeHistory.current.set(stroke.strokeId, stroke);
          }
          redrawAll();
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

  function getMousePos(e: React.PointerEvent<HTMLCanvasElement>) {
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

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (connectionStatus !== "connected") return;
    const canvas = canvasRef.current;
    canvas?.setPointerCapture(e.pointerId);

    setIsDrawing(true);
    const { canvasPos } = getMousePos(e);
    lastPoint.current = canvasPos;
    currentStrokeId.current = crypto.randomUUID();
    setLastOwnStrokeId(currentStrokeId.current);
    pointIdCounter.current = 0;

    strokeHistory.current.set(currentStrokeId.current, {
      strokeId: currentStrokeId.current,
      color: activeColor,
      thickness: activeThickness,
      points: [],
    });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const { canvasPos, displayPos } = getMousePos(e);
    setCursorPos(displayPos);

    if (!isDrawing || !lastPoint.current) return;

    const ctx = getContext();
    if (!ctx) return;

    drawSegment(lastPoint.current, canvasPos, activeColor, activeThickness);

    const stroke = strokeHistory.current.get(currentStrokeId.current!);
    stroke?.points.push({
      pointId: pointIdCounter.current,
      x: canvasPos.x,
      y: canvasPos.y,
      strokeId: currentStrokeId.current!,
      color: activeColor,
      thickness: activeThickness,
    });

    lastPoint.current = canvasPos;

    const now = Date.now();
    if (now - lastSentTime.current >= 20) {
      lastSentTime.current = now;
      sendPointToServer(canvasPos);
    }
  }

  function handlePointerUp() {
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

  async function handleExport() {
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

    const filename = `whiteboard-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
    const dataUrl = exportCanvas.toDataURL("image/png");

    const isTauri = "__TAURI_INTERNALS__" in window;

    if (isTauri) {
      const base64 = dataUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const path = await save({
        defaultPath: filename,
        filters: [{ name: "PNG Image", extensions: ["png"] }],
      });

      if (path) {
        await writeFile(path, bytes);
      }
    } else {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    }
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

  function redrawAll() {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokeHistory.current.values()) {
      let prev: { x: number; y: number } | null = null;
      for (const point of stroke.points) {
        const current = { x: point.x, y: point.y };
        if (prev) drawSegment(prev, current, stroke.color, stroke.thickness);
        prev = current;
      }
    }
  }

  function handleUndo() {
    const connection = connectionRef.current;
    if (!connection || !lastOwnStrokeId) return;

    connection.invoke("UndoLastStroke", lastOwnStrokeId).catch((err) => console.error("Undo failed:", err));
    setLastOwnStrokeId(null);
  }

  return (
      <div className={styles.rootContainer}>
        <div className={styles.toolbar}>
          <div className={styles.toolButtonGroup}>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isErasing}
                className={styles.colorPicker} />
            <span className={styles.keybindHint}>&nbsp;</span>
          </div>

          <div className={styles.toolButtonGroup}>
            <input
                type="range"
                min={1}
                max={30}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className={styles.thicknessSlider} />
            <span className={styles.keybindHint}>{thickness}px</span>
          </div>

          <div className={styles.toolButtonGroup}>
            <button
                onClick={() => setIsErasing((prev) => !prev)}
                className={isErasing ? styles.eraserActive : styles.eraserButton}>
              Eraser
            </button>
            <span className={styles.keybindHint}>E</span>
          </div>
          <div className={styles.toolButtonGroup}>
            <button onClick={handleUndo} disabled={!lastOwnStrokeId} className={styles.undoButton}>
              Undo
            </button>
            <span className={styles.keybindHint}>Ctrl+Z</span>
          </div>
          <div className={styles.toolButtonGroup}>
            <button onClick={handleExport} className={styles.exportButton}>
              Download PNG
            </button>
            <span className={styles.keybindHint}>&nbsp;</span>
          </div>
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
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => {
                  handlePointerUp();
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