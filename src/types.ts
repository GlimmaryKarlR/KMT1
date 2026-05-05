export interface ReactionData {
  t: number;
  x: number;
  y: number;
  z: number;
  R: number;
  G: number;
  B: number;
  Nx: number;
  Ny: number;
  Nz: number;
  d: number;
  th: number;
}

export interface NeighborhoodStats {
  globalMeanD: number;
  densityScale: string;
  chemicalCliffThreshold: number;
}

export interface PhysicsReport {
  manifoldDistance: number;
  transformationVector: [number, number, number];
  angularDeviation: number;
  tortuosity: number;
}
