import type { SimulationSnapshot } from '@solar/shared';
/** Independent of rendering and wall clock. Not an orbital physics solver. */
export class PreviewSimulation {
 private elapsed = 0;
 advance(realDeltaSeconds: number, timeScale = 1): SimulationSnapshot {
  if (!Number.isFinite(realDeltaSeconds) || realDeltaSeconds < 0 || !Number.isFinite(timeScale)) throw new RangeError('Invalid simulation step');
  this.elapsed += realDeltaSeconds * timeScale;
  return this.snapshot();
 }
 reset(): SimulationSnapshot { this.elapsed = 0; return this.snapshot(); }
 snapshot(): SimulationSnapshot {
  const a = this.elapsed * 0.08;
  const x = Math.cos(a)*22, z = Math.sin(a)*22;
  const m = this.elapsed * 0.35;
  return {elapsedSeconds:this.elapsed,bodies:[
   {id:'sun',position:[0,0,0],spin:this.elapsed*0.05},
   {id:'earth',position:[x,0,z],spin:this.elapsed*0.3},
   {id:'moon',position:[x+Math.cos(m)*4,0,z+Math.sin(m)*4],spin:m}
  ]};
 }
}
