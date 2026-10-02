import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateScientificBundle } from '../../packages/catalog/src/validation';
import { assetSchema, catalogSchema, sourceSchema } from '../../packages/catalog/src/schema';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const refresh=process.argv.includes('--refresh');
const json=(path:string):unknown=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const bundle=validateScientificBundle(json('data/catalog/solar-system.v1.json'),json('data/manifests/sources.v1.json'),json('data/manifests/assets.v1.json'));
const serialize=(value:unknown)=>JSON.stringify(value,null,2)+'\n';
const schemas:Record<string,unknown>={'data/schemas/catalog.v1.schema.json':catalogSchema,'data/schemas/sources.v1.schema.json':sourceSchema,'data/schemas/assets.v1.schema.json':assetSchema};
for(const [path,schema] of Object.entries(schemas)){
 if(refresh)writeFileSync(resolve(root,path),serialize(schema));
 else if(readFileSync(resolve(root,path),'utf8')!==serialize(schema))throw new Error(`Stale schema: ${path}. Regenerate and review.`);
}
// Independent source-column transcription is checked against normalized data to catch conversion errors.
const evidence=json('data/sources/jpl-planet-physical.transcription.json') as {rows:{id:string;meanRadiusKm:number;radiusUncertaintyKm:number;mass1e24Kg:number;massUncertainty1e24Kg:number}[];snapshotVersion:string;sourceUrl:string};
if(!Array.isArray(evidence.rows)||evidence.rows.length!==8||new Set(evidence.rows.map(row=>row.id)).size!==8)throw new Error('Expected eight unique planetary source rows');
const physicalSource=bundle.sources.sources.find(source=>source.id==='jpl-planet-physical');
if(physicalSource?.snapshotVersion!==evidence.snapshotVersion||physicalSource.url!==evidence.sourceUrl)throw new Error('Source evidence metadata mismatch');
for(const row of evidence.rows){
 const body=bundle.catalog.bodies.find(body=>body.id===row.id),radius=body?.physical.meanRadius,mass=body?.physical.mass;
 if(body?.kind!=='planet'||radius?.value!==row.meanRadiusKm||radius.uncertainty!==row.radiusUncertaintyKm||mass?.value!==row.mass1e24Kg*1e24||mass.uncertainty!==row.massUncertainty1e24Kg*1e24||radius.provenance.sourceId!==physicalSource.id||mass.provenance.sourceId!==physicalSource.id)throw new Error(`Source transcription/conversion mismatch: ${row.id}`);
}
const identities=json('data/sources/naif-identities.transcription.json') as {rows:{id:string;name:string;naifId:string}[]};
if(identities.rows.length!==bundle.catalog.bodies.length||new Set(identities.rows.map(row=>row.id)).size!==identities.rows.length)throw new Error('Identity coverage mismatch');
for(const row of identities.rows){const body=bundle.catalog.bodies.find(body=>body.id===row.id);if(body?.naifId!==row.naifId||body.name!==row.name||body.identitySourceId!=='naif-body-identities')throw new Error(`NAIF identity mismatch: ${row.id}`);}
const paths=[...new Set(['data/catalog/solar-system.v1.json','data/manifests/sources.v1.json','data/manifests/assets.v1.json',...Object.keys(schemas),...bundle.sources.sources.flatMap(source=>source.evidencePath===null?[]:[source.evidencePath])])].sort();
function fingerprint(path:string){
 if(isAbsolute(path)||path.includes('\\')||path.split('/').some(part=>part==='..'||part==='.'||part===''))throw new Error(`Unsafe manifest path: ${path}`);
 const absolute=realpathSync(resolve(root,path)),rel=relative(root,absolute);
 if(rel.startsWith('..')||isAbsolute(rel))throw new Error(`Manifest escapes repository: ${path}`);
 const bytes=readFileSync(absolute);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteLength:bytes.byteLength};
}
const expected={schemaVersion:1,datasetVersion:bundle.catalog.datasetVersion,algorithm:'sha256',files:paths.map(fingerprint)};
const manifestPath=resolve(root,'data/manifests/integrity.v1.json');
if(refresh)writeFileSync(manifestPath,serialize(expected));
else if(serialize(json('data/manifests/integrity.v1.json'))!==serialize(expected))throw new Error('Integrity manifest mismatch. Review input changes before data:refresh.');
console.log(JSON.stringify({datasetVersion:bundle.catalog.datasetVersion,bodies:bundle.catalog.bodies.length,sources:bundle.sources.sources.length,assets:bundle.assets.assets.length,checksummedFiles:paths.length,coverage:bundle.catalog.coverage.status,status:'passed'},null,2));
