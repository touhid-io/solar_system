# Architecture / ADR 0001

Status: accepted for P0.

Use an npm workspace with TypeScript, React, Vite and Three.js. Keep the simulation independent of React, Three.js, browser APIs and wall-clock reads. The application owns requestAnimationFrame and passes explicit elapsed seconds to the simulation. The renderer consumes snapshots; it must never determine orbital state. Physical coordinates and display transforms will be separate in P2.

Dependency direction: shared contracts → catalog/simulation/cinematic → renderer → explorer. Cinematic execution and offline export are future consumers of the same simulation API. Placeholder tools have no running backend.

Rendering uses a direct WebGL canvas. A ResizeObserver updates dimensions. Effect cleanup cancels animation, disconnects observation, disposes controls, geometries, materials and the renderer. DPR is capped at 2. A WebGL initialization failure presents a visible error. Long frame gaps are clamped in this preview so resuming a background tab does not cause a large jump; this is preview behavior, not a precision clock.

## Delivery

Commit a lockfile. CI runs type checks, meaningful simulation clock tests and the production build. Each later phase is a reviewable PR with its completion evidence. Branch protection and deployment settings are not provisioned by this repository.

## ADR 0002: data and assets

No network ephemeris calls occur in a render loop. P1 defines dataset schemas, source attribution, checksums and missing-data policy. P6 adds sampled/cached ephemeris providers and error-bounded interpolation. Large binary assets live outside Git; manifest updates are reviewable. Asset licenses must be captured before distribution.

## ADR 0003: fidelity claims

Every mode must expose whether geometry, positions or scale are approximate. NASA-grade is an engineering aspiration, not a certification. P0 is deliberately an illustrative fixture; no scientific correctness is inferred from its appearance.
