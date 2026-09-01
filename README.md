# DrawWhiteboard

A real-time, multi-user collaborative whiteboard. Open it in two browser tabs and draw in one, it appears in the other instantly. Built specifically to demonstrate real-time, stateful communication (SignalR/WebSockets), and to demonstrate an automated, versioned, multi-platform release pipeline via GitHub Actions.

**Live demo:** https://whiteboard-iota-liard.vercel.app/
**Desktop app:** Windows, macOS, and Linux installers are published automatically to the [Releases](../../releases) page on every merge to `main` that includes a releasable change.

> **Windows SmartScreen note:** the desktop build isn't code-signed (a paid certificate wasn't justified for a personal project), so Windows may show an "unrecognized app" warning on first launch. Click "More info" → "Run anyway" to proceed — the full source is public above if you'd like to verify what's actually being installed before running it.

## Features

- **Live collaborative drawing** — strokes stream to every connected client point-by-point as they're drawn, not just once a stroke is finished
- **No authentication** — deliberately scoped out; the point of this project is the real-time layer, not re-proving auth already demonstrated elsewhere
- **History replay for new joiners** — anyone connecting mid-session sees everything already drawn, not a blank canvas
- **Color, thickness, and eraser controls**, with a live cursor preview showing exactly what the next stroke will look like
- **Native desktop app** (Tauri) — a thin native shell around the same frontend, connecting to the same live backend, rather than a separate offline app — collaboration works identically whether someone joins from the browser or the desktop build
- **Fully automated releases** — semantic versioning derived from Conventional Commits, cross-platform builds, and GitHub Releases, with zero manual version bumping

## Tech stack

- **Backend:** ASP.NET Core, SignalR (`Hub`), in-memory state via a DI-registered singleton service
- **Frontend:** React + TypeScript (Vite), `@microsoft/signalr` client, HTML `<canvas>` (2D context) with CSS Modules
- **Desktop:** Tauri (Rust + the OS's native webview, rather than a bundled Chromium runtime like Electron — chosen specifically to keep installer size small and avoid shipping an entire browser for a simple app)
- **CI/CD:** GitHub Actions, `semantic-release`, `tauri-action`

## Architecture notes

### Message flow
Each point drawn is sent individually rather than batching a whole stroke and sending it at the end — this is what makes the collaboration feel live rather than like a delayed slideshow. The trade-off: local drawing is unthrottled (every raw mouse-move renders immediately), while what's *broadcast* to others is throttled — so very fast strokes look slightly more segmented to remote viewers than to the person drawing. This was a deliberate bandwidth/smoothness trade-off, not an oversight.

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

### Multi-origin CORS (web + desktop)
The desktop build and the web app are two different origins hitting the same backend: the browser sends `Origin: https://whiteboard-iota-liard.vercel.app`, while the Tauri app sends a distinct webview-internal origin (confirmed via the packaged app's own dev tools, not assumed — this differs by Tauri version/platform and is worth verifying directly rather than guessing). The backend's CORS policy allows an explicit array of origins (`Cors:AllowedOrigins`) rather than a single value, covering both.

## CI/CD and release automation

Every push to `main` triggers a GitHub Actions pipeline with two stages:

1. **Versioning** — `semantic-release` inspects Conventional Commits since the last release, decides the next semantic version automatically, and — if the changes warrant a release — creates a git tag, a changelog, and a GitHub Release entry. No manual version bumping anywhere in the project.
2. **Cross-platform desktop build** — if a new version was published, a matrix job builds the Tauri app on `windows-latest`, `macos-latest`, and `ubuntu-latest` in parallel, injects the correct backend URL and version number into the build via environment secrets, and uploads the resulting installers to that same GitHub Release.

A couple of real issues hit and fixed while building this pipeline, worth noting since they're the kind of thing that fails silently if you're not specifically checking for them:
- A referenced GitHub Actions secret that doesn't exist resolves to an **empty string**, not an error — a missing `VITE_API_URL` secret silently shipped a build with no backend URL at all, connecting nowhere, with no build failure to flag it. Fixed by adding an explicit pipeline step that fails the build if the value is empty, rather than trusting its presence silently.
- `tauri.conf.json`'s version field is static and version-controlled — nothing updates it automatically just because a new release tag exists elsewhere. The pipeline now patches this file at build time to match the version `semantic-release` computed, so the installed app's reported version always matches its actual release.

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

### Desktop (Tauri)
Requires the Rust toolchain ([rustup.rs](https://rustup.rs)) in addition to the frontend setup above.
```bash
cd Frontend
npm run tauri dev
```

## Known limitations / possible future improvements

- No persistence across server restarts — stroke history is in-memory only
- No undo/redo
- Eraser is implemented as a white-colored brush rather than true stroke deletion — simpler, and sufficient for a single shared canvas, but means erased content still exists in the underlying stroke history
- Fast strokes appear slightly more segmented to remote viewers than locally, due to network throttling (see [Architecture notes](#architecture-notes))
- No rooms — everyone connected shares a single global board
- Desktop builds are unsigned (see SmartScreen note above) — code signing was deliberately scoped out as disproportionate cost for a personal project
