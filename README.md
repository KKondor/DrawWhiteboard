# DrawWhiteboard

A real-time, multi-user collaborative whiteboard. Open it in two browser tabs and draw in one, it appears in the other instantly. Built specifically to demonstrate real-time, stateful communication (SignalR/WebSockets).

**Live demo:** https://whiteboard-iota-liard.vercel.app/

## Features

- **Live collaborative drawing** — strokes stream to every connected client point-by-point as they're drawn, not just once a stroke is finished
- **No authentication** — deliberately scoped out; the point of this project is the real-time layer, not re-proving auth already demonstrated elsewhere
- **History replay for new joiners** — anyone connecting mid-session sees everything already drawn, not a blank canvas
- **Color, thickness, and eraser controls**, with a live cursor preview showing exactly what the next stroke will look like

## Tech stack

- **Backend:** ASP.NET Core, SignalR (`Hub`), in-memory state via a DI-registered singleton service
- **Frontend:** React + TypeScript (Vite), `@microsoft/signalr` client, HTML `<canvas>` (2D context) with CSS Modules

## Architecture notes

### Message flow
Each point drawn is sent individually (throttled to ~25/sec) rather than batching a whole stroke and sending it at the end — this is what makes the collaboration feel live rather than like a delayed slideshow. The trade-off: local drawing is unthrottled (every raw mouse-move renders immediately), while what's *broadcast* to others is throttled — so very fast strokes look slightly more segmented to remote viewers than to the person drawing. This was a deliberate bandwidth/smoothness trade-off, not an oversight.

### Ordering
SignalR does not guarantee in-order message delivery. Each point carries a client-assigned `strokeId` (a GUID, generated on `mousedown`) and a per-stroke incrementing `pointId`. The server re-sorts each stroke's points by `pointId` before storing them, so the authoritative history — the one new joiners receive — is always correctly ordered even if individual points arrive out of sequence over the network.

### State management: DI singleton, not a hand-rolled singleton pattern
An early version of the stroke store was written as a classic hand-coded singleton (`Lazy<T>`-backed static instance). This was deliberately reworked into a plain class registered via `builder.Services.AddSingleton<StrokeStore>()` and injected into the `Hub`'s constructor instead. Reasoning: ASP.NET Core's DI container already manages singleton lifetime correctly, and a hand-written static singleton is harder to test in isolation (shared global state with no way to get a clean instance per test) for no actual benefit over the built-in mechanism.

### Canvas coordinate spaces
Three distinct coordinate spaces are in play, and conflating them causes real, easy-to-miss bugs:
1. **Canvas-internal resolution** (e.g. 1200×800) — what drawing methods (`moveTo`/`lineTo`) and network payloads use, since this is resolution-independent and consistent regardless of any individual viewer's screen size or browser zoom
2. **CSS display size** — how large the canvas is actually rendered on screen, which differs from its internal resolution under responsive CSS or browser zoom
3. **Page/display coordinates** — used only for the floating cursor-preview element, which is a plain positioned `<div>`, not something drawn on the canvas itself

Two real bugs surfaced from mixing these up during development: browser zoom throwing off draw position (fixed by scaling mouse coordinates by the ratio of internal resolution to rendered CSS size), and the cursor-preview indicator being misaligned due to wrapper padding/border shifting its positioning origin relative to the canvas's own bounding box (fixed by ensuring the preview's positioned ancestor has zero padding/border, so its coordinate origin exactly coincides with the canvas's).

## Running locally

### Backend
```bash
cd Backend
dotnet run
```

### Frontend
```bash
cd Frontend
npm install
```
Create a `.env`:
```
VITE_API_URL=https://localhost:XXXX
```
```bash
npm run dev
```

## Known limitations / possible future improvements

- No persistence across server restarts — stroke history is in-memory only
- No undo/redo
- Eraser is implemented as a white-colored brush rather than true stroke deletion — simpler, and sufficient for a single shared canvas, but means erased content still exists in the underlying stroke history
- Fast strokes appear slightly more segmented to remote viewers than locally, due to network throttling (see [Architecture notes](#architecture-notes))
- No rooms — everyone connected shares a single global board
