# Versioned manifests

- `sources.v1.json`: primary-source attribution, retrieval and local evidence versions.
- `assets.v1.json`: reviewed binary resources; empty in P1.
- `integrity.v1.json`: byte lengths and SHA-256 hashes of the catalog, schema files and source evidence.

Catalog: `data/catalog/solar-system.v1.json` (dataset 0.1.0, partial coverage).

Unknown science fields remain explicit null. Eight planetary mean radii and masses are transcribed/converted; Sun and Moon physical parameters are not yet ingested. All nineteen identities have NAIF bindings. No barycenter is a physical surface. Large binaries stay outside Git and require reviewed licenses before being entered in the asset manifest.
