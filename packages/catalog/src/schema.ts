/** A documented JSON Schema subset; exported schemas are also consumed by runtime validation. */
export interface Schema {
 $schema?: string; $id?: string; title?: string;
 type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'null' | ('string' | 'null')[];
 const?: unknown; enum?: readonly unknown[]; anyOf?: Schema[];
 properties?: Record<string, Schema>; required?: string[]; additionalProperties?: false;
 items?: Schema; minItems?: number; minLength?: number; pattern?: string;
 minimum?: number; exclusiveMinimum?: number; maximum?: number; exclusiveMaximum?: number;
}
const text: Schema={type:'string',minLength:1};
const id: Schema={...text,pattern:'^[a-z][a-z0-9-]*$'};
const nullable=(schema:Schema):Schema=>({anyOf:[schema,{type:'null'}]});
const obj=(properties:Record<string,Schema>):Schema=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=(items:Schema,minItems=0):Schema=>({type:'array',items,minItems});
const en=(...values:string[]):Schema=>({type:'string',enum:values});
const constant=(value:unknown):Schema=>({const:value});
const finite:Schema={type:'number'};
const utc:Schema={...text,pattern:'^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?Z$'};
const https:Schema={...text,pattern:'^https://[^\\s]+$'};
const provenance=obj({sourceId:id,locator:text,method:en('transcribed','converted','derived'),note:{type:'string'}});
const measurement=(unit:string,limits:Partial<Schema>={}):Schema=>obj({value:{...finite,...limits},unit:constant(unit),uncertainty:nullable({...finite,minimum:0}),uncertaintyKind:en('source-reported','not-reported'),provenance});
const epoch=obj({jd:{...finite,minimum:0},timeScale:constant('TDB')});
const validity=obj({start:epoch,end:epoch});
const orbitCommon={centerId:id,frame:en('ICRF','ECLIPJ2000'),validity,sourceId:id};
const orbit=nullable({anyOf:[
 obj({...orbitCommon,model:constant('keplerian'),epoch,accuracy:constant('approximate'),
 semiMajorAxis:measurement('km',{exclusiveMinimum:0}),eccentricity:measurement('1',{minimum:0,exclusiveMaximum:1}),
 inclination:measurement('rad',{minimum:0,maximum:Math.PI}),longitudeAscendingNode:measurement('rad',{minimum:0,exclusiveMaximum:2*Math.PI}),
 argumentPeriapsis:measurement('rad',{minimum:0,exclusiveMaximum:2*Math.PI}),meanAnomaly:measurement('rad',{minimum:0,exclusiveMaximum:2*Math.PI})}),
 obj({...orbitCommon,model:constant('ephemeris'),accuracy:constant('source-ephemeris'),assetId:id,aberration:constant('NONE'),distanceUnit:constant('km'),velocityUnit:constant('km/s')})
]});
const rotation=nullable(obj({model:constant('constant-pole'),frame:constant('ICRF'),epoch,validity,accuracy:constant('approximate'),
 poleRightAscension:measurement('rad',{minimum:0,exclusiveMaximum:2*Math.PI}),poleDeclination:measurement('rad',{minimum:-Math.PI/2,maximum:Math.PI/2}),
 primeMeridian:measurement('rad',{minimum:0,exclusiveMaximum:2*Math.PI}),rate:measurement('rad/s')}));
const body=obj({id,name:text,identitySourceId:id,kind:en('star','planet','moon','dwarf-planet','asteroid','comet','barycenter'),naifId:nullable({...text,pattern:'^-?[0-9]+$'}),parentId:nullable(id),systemBarycenterId:nullable(id),
 physical:obj({meanRadius:nullable(measurement('km',{exclusiveMinimum:0})),mass:nullable(measurement('kg',{exclusiveMinimum:0})),gm:nullable(measurement('km^3/s^2',{exclusiveMinimum:0}))}),rotation,orbit,notes:{type:'string'}});
const root=(name:string,schema:Schema):Schema=>({...schema,$schema:'https://json-schema.org/draft/2020-12/schema',$id:`https://solar-system.invalid/schemas/v1/${name}.json`,title:name});
export const catalogSchema=root('catalog',obj({schemaVersion:constant(1),datasetVersion:{...text,pattern:'^[0-9]+\\.[0-9]+\\.[0-9]+$'},releasedAtUTC:utc,
 coverage:obj({status:en('partial','complete-for-source-release'),description:text,sourceRelease:nullable(text)}),
 conventions:obj({distance:constant('km'),mass:constant('kg'),angle:constant('rad'),duration:constant('s'),velocity:constant('km/s'),dynamicalTime:constant('TDB'),epochRepresentation:constant('JD'),inputTime:constant('UTC'),handedness:constant('right'),missingValue:constant('null')}),bodies:array(body,1)}));
export const sourceSchema=root('sources',obj({schemaVersion:constant(1),sources:array(obj({id,publisher:text,title:text,url:https,retrievedAtUTC:utc,upstreamVersion:nullable(text),snapshotVersion:text,evidencePath:nullable(text),usage:obj({status:en('review-required','approved'),termsUrl:https,note:text})}),1)}));
export const assetSchema=root('assets',obj({schemaVersion:constant(1),assets:array(obj({id,bodyId:nullable(id),kind:en('texture','shape','ephemeris'),uri:https,sha256:{...text,pattern:'^[a-f0-9]{64}$'},byteLength:{type:'integer',minimum:1},sourceId:id,appearance:en('observational','illustrative','not-applicable'),license:obj({status:constant('approved'),identifier:text,termsUrl:https,attribution:text})}))}));
