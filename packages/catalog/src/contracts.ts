/** Physical contracts contain no display scale, color or mesh fields. */
export type ScientificBodyId = string;
export type BodyKind = 'star' | 'planet' | 'moon' | 'dwarf-planet' | 'asteroid' | 'comet' | 'barycenter';
export type ReferenceFrame = 'ICRF' | 'ECLIPJ2000';
export interface Provenance { sourceId: string; locator: string; method: 'transcribed' | 'converted' | 'derived'; note: string }
export interface Measurement<U extends string> {
 value: number; unit: U; uncertainty: number | null;
 uncertaintyKind: 'source-reported' | 'not-reported'; provenance: Provenance;
}
export interface Epoch { jd: number; timeScale: 'TDB' }
export interface Validity { start: Epoch; end: Epoch }
export interface KeplerianOrbit {
 model: 'keplerian'; centerId: ScientificBodyId; frame: ReferenceFrame;
 epoch: Epoch; validity: Validity; accuracy: 'approximate'; sourceId: string;
 semiMajorAxis: Measurement<'km'>; eccentricity: Measurement<'1'>;
 inclination: Measurement<'rad'>; longitudeAscendingNode: Measurement<'rad'>;
 argumentPeriapsis: Measurement<'rad'>; meanAnomaly: Measurement<'rad'>;
}
export interface EphemerisOrbit {
 model: 'ephemeris'; centerId: ScientificBodyId; frame: ReferenceFrame;
 validity: Validity; accuracy: 'source-ephemeris'; sourceId: string; assetId: string;
 aberration: 'NONE'; distanceUnit: 'km'; velocityUnit: 'km/s';
}
export interface RotationModel {
 model: 'constant-pole'; frame: 'ICRF'; epoch: Epoch; validity: Validity; accuracy: 'approximate';
 poleRightAscension: Measurement<'rad'>; poleDeclination: Measurement<'rad'>;
 primeMeridian: Measurement<'rad'>; rate: Measurement<'rad/s'>;
}
export interface ScientificBody {
 id: ScientificBodyId; name: string; kind: BodyKind; identitySourceId: string; naifId: string | null;
 parentId: ScientificBodyId | null; systemBarycenterId: ScientificBodyId | null;
 physical: { meanRadius: Measurement<'km'> | null; mass: Measurement<'kg'> | null; gm: Measurement<'km^3/s^2'> | null };
 rotation: RotationModel | null; orbit: KeplerianOrbit | EphemerisOrbit | null;
 notes: string;
}
export interface SourceRecord {
 id: string; publisher: string; title: string; url: string; retrievedAtUTC: string;
 upstreamVersion: string | null; snapshotVersion: string; evidencePath: string | null;
 usage: { status: 'review-required' | 'approved'; termsUrl: string; note: string };
}
export interface SourceManifest { schemaVersion: 1; sources: SourceRecord[] }
export interface ScientificCatalog {
 schemaVersion: 1; datasetVersion: string; releasedAtUTC: string;
 coverage: { status: 'partial' | 'complete-for-source-release'; description: string; sourceRelease: string | null };
 conventions: { distance: 'km'; mass: 'kg'; angle: 'rad'; duration: 's'; velocity: 'km/s';
  dynamicalTime: 'TDB'; epochRepresentation: 'JD'; inputTime: 'UTC'; handedness: 'right'; missingValue: 'null' };
 bodies: ScientificBody[];
}
export interface AssetRecord {
 id: string; bodyId: string | null; kind: 'texture' | 'shape' | 'ephemeris';
 uri: string; sha256: string; byteLength: number; sourceId: string;
 appearance: 'observational' | 'illustrative' | 'not-applicable';
 license: { status: 'approved'; identifier: string; termsUrl: string; attribution: string };
}
export interface AssetManifest { schemaVersion: 1; assets: AssetRecord[] }
