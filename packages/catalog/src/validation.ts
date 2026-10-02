import { assetSchema, catalogSchema, sourceSchema, type Schema } from './schema';
import type { AssetManifest, ScientificCatalog, SourceManifest } from './contracts';
export interface ValidationIssue { path: string; message: string }
/** Validates only the keyword vocabulary used by the exported schemas, not arbitrary external schemas. */
function check(value:unknown,schema:Schema,path:string,issues:ValidationIssue[]):void {
 const fail=(message:string)=>issues.push({path,message});
 if(schema.anyOf){
  const branches=schema.anyOf.map(branch=>{const errors:ValidationIssue[]=[];check(value,branch,path,errors);return errors;});
  if(!branches.some(errors=>errors.length===0)){fail('Does not match any allowed shape');issues.push(...branches.flat().filter(issue=>value===null||issue.message!=='Expected null')); }
  return;
 }
 if('const' in schema && value!==schema.const)fail(`Expected constant ${JSON.stringify(schema.const)}`);
 if(schema.enum && !schema.enum.includes(value))fail('Value is outside the allowed enumeration');
 const type=schema.type;
 if(type){
  const matches=(t:string)=>t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):t==='integer'?typeof value==='number'&&Number.isFinite(value)&&Number.isInteger(value):t==='number'?typeof value==='number'&&Number.isFinite(value):typeof value===t;
  if(!(Array.isArray(type)?type.some(matches):matches(type))){fail(`Expected ${type}`);return;}
 }
 if(typeof value==='number'){
  if(!Number.isFinite(value)){fail('Number must be finite');return;}
  if(schema.minimum!==undefined&&value<schema.minimum)fail('Below minimum');
  if(schema.maximum!==undefined&&value>schema.maximum)fail('Above maximum');
  if(schema.exclusiveMinimum!==undefined&&value<=schema.exclusiveMinimum)fail('At or below exclusive minimum');
  if(schema.exclusiveMaximum!==undefined&&value>=schema.exclusiveMaximum)fail('At or above exclusive maximum');
 }
 if(typeof value==='string'){
  if(schema.minLength!==undefined&&value.length<schema.minLength)fail('Empty string');
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))fail('String does not match required format');
 }
 if(Array.isArray(value)){
  if(schema.minItems!==undefined&&value.length<schema.minItems)fail('Too few items');
  if(schema.items)value.forEach((item,i)=>check(item,schema.items!,`${path}[${i}]`,issues));
 }
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){
  const record=value as Record<string,unknown>;
  schema.required?.forEach(key=>{if(!Object.hasOwn(record,key))issues.push({path:`${path}.${key}`,message:'Required field is missing'});});
  for(const [key,field] of Object.entries(record)){
   if(schema.properties && Object.hasOwn(schema.properties,key))check(field,schema.properties[key],`${path}.${key}`,issues);
   else if(schema.additionalProperties===false)issues.push({path:`${path}.${key}`,message:'Unknown field'});
  }
 }
}
export class ContractError extends Error {
 constructor(public readonly issues:readonly ValidationIssue[]){super(issues.map(i=>`${i.path}: ${i.message}`).join('\n'));this.name='ContractError';}
}
function parse<T>(value:unknown,schema:Schema):T {const issues:ValidationIssue[]=[];check(value,schema,'$',issues);if(issues.length)throw new ContractError(issues);return structuredClone(value) as T;}
export const parseSourceManifest=(value:unknown):SourceManifest=>parse(value,sourceSchema);
export const parseAssetManifest=(value:unknown):AssetManifest=>parse(value,assetSchema);
export const parseScientificCatalog=(value:unknown):ScientificCatalog=>parse(value,catalogSchema);
/** Structural parsing precedes all cross-record checks, so malformed input never leaks to consumers. */
export function validateScientificBundle(catalogInput:unknown,sourceInput:unknown,assetInput:unknown={schemaVersion:1,assets:[]}):{catalog:ScientificCatalog;sources:SourceManifest;assets:AssetManifest}{
 const catalog=parseScientificCatalog(catalogInput),sources=parseSourceManifest(sourceInput),assets=parseAssetManifest(assetInput);
 const issues:ValidationIssue[]=[];
 const fail=(path:string,message:string)=>issues.push({path,message});
 const index=<T extends {id:string}>(items:T[],path:string):Map<string,T>=>{
  const result=new Map<string,T>();items.forEach((item,i)=>{if(result.has(item.id))fail(`${path}[${i}].id`,'Duplicate ID');result.set(item.id,item);});return result;
 };
 const bodies=index(catalog.bodies,'$.bodies'),sourceMap=index(sources.sources,'$.sources'),assetMap=index(assets.assets,'$.assets');
 const naifs=new Set<string>();
 const source=(id:string,path:string)=>{if(!sourceMap.has(id))fail(path,'Unknown source ID');};
 const utc=(text:string,path:string)=>{
  const time=new Date(text);if(!Number.isFinite(time.getTime()) || time.toISOString().replace('.000Z','Z')!==text.replace('.000Z','Z'))fail(path,'Invalid UTC calendar timestamp');
 };
 utc(catalog.releasedAtUTC,'$.releasedAtUTC');sources.sources.forEach((s,i)=>utc(s.retrievedAtUTC,`$.sources[${i}].retrievedAtUTC`));
 if(catalog.coverage.status==='complete-for-source-release'&&!catalog.coverage.sourceRelease)fail('$.coverage.sourceRelease','Complete coverage requires a named source release');
 function references(value:unknown,path:string):void {
  if(value===null||typeof value!=='object')return;
  const record=value as Record<string,unknown>;
  if(typeof record.sourceId==='string')source(record.sourceId,`${path}.sourceId`);
  if('uncertaintyKind' in record){
   if((record.uncertaintyKind==='source-reported')!==(record.uncertainty!==null))fail(`${path}.uncertainty`,'Uncertainty kind and value disagree');
  }
  for(const [key,child] of Object.entries(record))references(child,`${path}.${key}`);
 }
 references(catalog,'$');
 catalog.bodies.forEach((body,i)=>{
  const path=`$.bodies[${i}]`;
  source(body.identitySourceId,`${path}.identitySourceId`);
  if(body.naifId!==null){if(naifs.has(body.naifId))fail(`${path}.naifId`,'Duplicate external body ID');naifs.add(body.naifId);}
  if(body.parentId!==null&&!bodies.has(body.parentId))fail(`${path}.parentId`,'Unknown parent ID');
  if(body.parentId===body.id)fail(`${path}.parentId`,'Body cannot parent itself');
  if(body.kind==='moon'&&body.parentId===null)fail(`${path}.parentId`,'Moon requires a parent');
  if(body.kind==='moon'&&body.parentId!==null){const parent=bodies.get(body.parentId);if(parent&&!['planet','dwarf-planet','asteroid'].includes(parent.kind))fail(`${path}.parentId`,'Moon parent must be a physical primary');}
  if(body.systemBarycenterId!==null){const b=bodies.get(body.systemBarycenterId);if(!b||b.kind!=='barycenter'||b.id===body.id)fail(`${path}.systemBarycenterId`,'Expected a distinct cataloged barycenter');}
  for(const [field,model] of [['orbit',body.orbit],['rotation',body.rotation]] as const){
   if(!model)continue;
   const {start,end}=model.validity;if(start.jd>=end.jd)fail(`${path}.${field}.validity`,'Validity start must precede end');
   if('epoch' in model&&(model.epoch.jd<start.jd||model.epoch.jd>end.jd))fail(`${path}.${field}.epoch`,'Epoch outside validity');
  }
  if(body.orbit){
   if(!bodies.has(body.orbit.centerId)||body.orbit.centerId===body.id)fail(`${path}.orbit.centerId`,'Expected a distinct cataloged center');
   if(body.orbit.model==='ephemeris'){const asset=assetMap.get(body.orbit.assetId);if(!asset||asset.kind!=='ephemeris'||asset.bodyId!==body.id||asset.sourceId!==body.orbit.sourceId)fail(`${path}.orbit.assetId`,'Ephemeris asset must match body, kind and source');}
  }
  if(body.kind==='barycenter'&&(Object.values(body.physical).some(v=>v!==null)||body.rotation!==null))fail(path,'Barycenters have no physical surface or rotation');
 });
 // Parent and orbit-center graphs must each be acyclic; barycenter membership is not a parent edge.
 for(const graph of ['parent','orbit'] as const){
  const done=new Set<string>(),active=new Set<string>();
  const visit=(id:string)=>{if(active.has(id)){fail('$.bodies',`${graph} reference cycle at ${id}`);return;}if(done.has(id))return;active.add(id);const body=bodies.get(id);const next=graph==='parent'?body?.parentId:body?.orbit?.centerId;if(next&&bodies.has(next))visit(next);active.delete(id);done.add(id);};
  bodies.forEach((_,id)=>visit(id));
 }
 assets.assets.forEach((asset,i)=>{
  const path=`$.assets[${i}]`;source(asset.sourceId,`${path}.sourceId`);
  if(asset.bodyId!==null&&!bodies.has(asset.bodyId))fail(`${path}.bodyId`,'Unknown asset body');
  if(sourceMap.get(asset.sourceId)?.usage.status!=='approved')fail(`${path}.sourceId`,'Asset distribution requires reviewed source usage');
  if((asset.kind==='ephemeris')!==(asset.appearance==='not-applicable'))fail(`${path}.appearance`,'Ephemeris must use not-applicable; visual assets must declare appearance');
 });
 if(issues.length)throw new ContractError(issues);
 return {catalog,sources,assets};
}
