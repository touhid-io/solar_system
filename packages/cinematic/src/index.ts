/** Contract reserved for P8; no automatic director is claimed in P0. */
export interface CameraKeyframe { timeSeconds: number; position: readonly [number,number,number]; target: readonly [number,number,number] }
export interface CinematicSequence { version: 1; name: string; durationSeconds: number; keyframes: readonly CameraKeyframe[] }
