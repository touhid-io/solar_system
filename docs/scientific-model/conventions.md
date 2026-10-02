# Scientific Data Contract v1

Status: frozen for P1; runtime/JSON Schema validation is in `packages/catalog`.

## Identities and relationships

Internal IDs are stable lowercase slugs, never array positions or names. Renaming a display name does not change an ID. NAIF codes are nullable decimal strings, distinct from internal IDs; a planet body center and its system barycenter are not interchangeable. Names need not be globally unique. Identity records cite an `identitySourceId`. The starter binds Sun, eight planets, Moon and nine barycenters to selected official NAIF mappings.

`parentId` describes catalog ancestry (Moon → Earth, planets → Sun). `systemBarycenterId` is membership, not ancestry. `orbit.centerId` independently identifies the coordinate origin for orbital data; it may be a barycenter. Parent and center graphs must be acyclic. Barycenters have no surface radius, mass, GM or rotation in this model. Their identifiers do not imply position samples are available.

## Units and coordinates

| Quantity | Stored unit/convention |
|---|---|
| Distance and physical mean radius | km |
| Mass | kg |
| Gravitational parameter | km^3/s^2 |
| Velocity | km/s |
| Duration | s |
| Angles | rad |
| Eccentricity | dimensionless `1`, elliptic models only (0 ≤ e < 1) |
| Rotation rate | signed rad/s |
| Dynamical epoch | Julian Date tagged `TDB` |
| User-facing date input | UTC, explicit `Z` calendar timestamp |
| Coordinates | Right-handed; frame and origin explicitly tagged |

Supported inertial frame labels: `ICRF` and `ECLIPJ2000`. They are distinct; mixing without an explicit conversion is forbidden. Renderer coordinates are a separate transform, not a new scientific reference frame. No browser date value is assumed to be a TDB epoch.

P2 must implement/document its time adapter; P6 must validate precision conversions against a versioned provider and declare leap-second/validity policy. P1 provides contracts only, not UTC→TDB conversion or an ephemeris solver.

## Dynamics and orientation

Elliptic Kepler metadata contains positive semi-major axis, eccentricity, inclination, ascending node longitude, argument of periapsis and mean anomaly. Inclination is [0, π]; other angular elements are normalized to [0, 2π). Epoch and validity use TDB; epoch must be within an ordered interval. Validity bounds are inclusive. This orbit always declares approximate accuracy.

An ephemeris record declares a known asset, source, frame, coordinate center, validity interval, km/km/s units and geometric (`NONE`) aberration. Source-ephemeris is a provider classification, not an application accuracy guarantee. Actual sample formats, interpolation, tolerances and provider verification belong to P6.

The initial rotation contract is a constant-pole approximate model: ICRF pole right ascension/declination, prime meridian at a TDB epoch and signed angular rate. Model orientation uses pole basis and prime meridian together; do not simultaneously invert pole and rate to implement retrograde motion. Periods from source tables are not enough to populate this orientation model. IAU time-dependent models require an explicit future schema extension.

## Missing values and uncertainty

Required but unavailable physical/dynamical fields are `null`; never zero, guessed, omitted or substituted with visual dimensions. Each known physical/rotational/orbital scalar carries unit, source ID, table locator, transcription/conversion method, note and absolute uncertainty. Unknown uncertainty is `null` plus `not-reported`. Source-reported uncertainty is nonnegative plus `source-reported`; do not infer a confidence level from a ± symbol.

The starter stores eight planetary volume-equivalent mean radii and masses from the JPL physical parameters table. Mass values AND uncertainties are multiplied by 10^24 to convert its table units to kg. No GM is derived from rounded masses, no equatorial radius substituted, and no rotational or orbital values invented.

## Versioning and coverage

`schemaVersion` is integer 1. Dataset versions use X.Y.Z and are reviewed independently. Breaking field/unit/frame changes require a schema revision; new data snapshots require a dataset version and refreshed source evidence/integrity manifest. Catalog coverage is partial until a named source release has been audited. A full moon census is P4, not P1.

Sources record publisher, URL, UTC retrieval time, nullable upstream version, local transcription snapshot version, evidence path and usage review state. Transcriptions are selected records, not raw HTML snapshots. Checksums detect subsequent byte changes, not independent source authenticity. An updated source page never silently changes a checked-in catalog.

Visual scale, color and artistic geometry belong exclusively to preview/render contracts. Approved distributable assets require source usage review, license identifier, terms URL, attribution, SHA-256, byte length and appearance classification. P1 ships no textures or ephemeris binary assets.
