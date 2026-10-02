import type { BodyId } from '@solar/shared';
export interface PreviewBody { id: BodyId; name: string; displayRadius: number; color: number }
/** P0 visual fixtures. Values are display units, never scientific parameters. */
export const previewBodies: readonly PreviewBody[] = [
 {id:'sun',name:'Sun',displayRadius:5,color:0xffbf63},
 {id:'earth',name:'Earth',displayRadius:1.5,color:0x438edb},
 {id:'moon',name:'Moon',displayRadius:0.45,color:0xaab5c5}
];

export * from './contracts';
export * from './validation';
export { loadStarterScientificBundle } from './scientific';
