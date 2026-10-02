# Solar System Observatory

A modular Solar System Explorer and future cinematic production studio.

**Current milestone: P0 — Engineering Foundation.** The app contains an English-only illustrative Sun/Earth/Moon preview. It does not yet provide scientific orbital data, a complete planetary catalog, an AI director or video export. No NASA affiliation or certification is claimed.

## Run locally

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Drag to orbit, scroll/pinch to zoom, pause the preview or reset the view. WebGL is required. Dependencies are installed locally; the running app does not fetch CDN scripts or remote textures.

```sh
npm run check
npm run build
```

Production files are written to `dist/explorer`. Serve that directory using any static web server. Deployment is not configured in P0.

## Layout

- `apps/explorer`: React UI and application lifecycle.
- `packages/shared`: renderer-independent contracts.
- `packages/catalog`: explicitly illustrative body fixtures; scientific catalog follows in P1.
- `packages/simulation`: deterministic preview clock and body state.
- `packages/renderer`: Three.js scene and resource lifecycle.
- `packages/cinematic`: future sequence contract, without runtime functionality.
- `tools`: future data ingestion and offline rendering boundaries.
- `data`: future versioned manifests and scientific validation fixtures.
- `docs`: architecture, scientific requirements and release evidence.
- `references`: unchanged original prototype, for comparison only.

See [architecture](docs/architecture/overview.md), [scientific conventions](docs/scientific-model/conventions.md), [roadmap](docs/roadmap.md) and [P0 release notes](docs/releases/P0.md).

Large textures, ephemeris bundles and rendered videos must use versioned external storage with checksums. Never commit credentials. The original prototype is not imported by the application.
