export type BodyId = 'sun' | 'earth' | 'moon';
export type Vector3 = readonly [number, number, number];
export interface BodyState { id: BodyId; position: Vector3; spin: number }
export interface SimulationSnapshot { elapsedSeconds: number; bodies: readonly BodyState[] }
