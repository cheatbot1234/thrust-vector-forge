
export interface RocketParameters {
  chamberPressure: number;    // MPa
  mixtureRatio: number;       // O/F Ratio
  throatDiameter: number;     // mm
  chamberLength: number;      // mm
  nozzleExpansionRatio: number; // Ae/At
  propellantTemp: number;     // K
}

export interface SimulationResult {
  id: string;
  timestamp: number;
  parameters: RocketParameters;
  thrust: number;             // kN
  specificImpulse: number;    // s
  chamberTemperature: number; // K
  exitPressure: number;       // kPa
  massFlowRate: number;       // kg/s
  thrustCoefficient: number;  // Dimensionless
  pressureData: {x: number, y: number}[]; // Pressure along nozzle
  temperatureData: {x: number, y: number}[]; // Temperature along nozzle
  velocityData: {x: number, y: number}[]; // Velocity along nozzle
}

export type SimulationMethod = 'lite' | 'cfd' | 'fem' | 'ansys';

export interface SimulationOptions {
  method: SimulationMethod;
  iterations?: number;
  convergenceCriteria?: number;
  meshDensity?: number;
}
