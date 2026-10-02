# Solar System Observatory

A modular Solar System Explorer and future cinematic production studio.

**Current milestone: P1 — Scientific Data Contract.** The app contains an English-only illustrative Sun/Earth/Moon preview. P1 adds a validated, versioned partial scientific catalog: nineteen NAIF identities, eight planet mean radii/masses, two source records and SHA-256 manifests. It does not yet provide scientific orbital motion, a complete satellite catalog, an AI director or video export. No NASA affiliation or certification is claimed.

## Developer validation (no end-user setup required)

End users will open the hosted browser app after Vercel deployment; local commands below are for developers and CI. Hosting will be configured after project completion.

### Development commands

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
- `packages/catalog`: isolated illustrative fixtures plus validated scientific contracts and starter data.
- `packages/simulation`: deterministic preview clock and body state.
- `packages/renderer`: Three.js scene and resource lifecycle.
- `packages/cinematic`: future sequence contract, without runtime functionality.
- `tools`: offline catalog validation plus a future offline rendering boundary.
- `data`: versioned catalog, source transcriptions, JSON Schemas and integrity manifests.
- `docs`: architecture, scientific requirements and release evidence.
- `references`: unchanged original prototype, for comparison only.

See [architecture](docs/architecture/overview.md), [scientific conventions](docs/scientific-model/conventions.md), [roadmap](docs/roadmap.md) and [P0 release notes](docs/releases/P0.md) and [P1 release notes](docs/releases/P1.md).

Large textures, ephemeris bundles and rendered videos must use versioned external storage with checksums. Never commit credentials. The original prototype is not imported by the application.

Data validation: `npm run data:validate`. Reviewed source updates: `npm run data:refresh`. Unknown values remain null; preview visuals never substitute for physical measurements.
