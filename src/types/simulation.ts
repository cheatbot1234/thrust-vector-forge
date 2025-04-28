
export interface GrainParameters {
  length_mm: number;
  outer_diameter_mm: number;
  initial_port_diameter_mm: number;
  port_wall_thickness_mm: number;
  port_axial_profile: 'cylindrical' | 'tapered';
  port_profile_taper_angle_deg: number;
}

export interface CombustionChamberParameters {
  length_mm: number;
  inner_diameter_mm: number;
  wall_thickness_mm: number;
  chamber_volume_cc: number;
}

export interface InjectorParameters {
  inj_plate_thickness: number;
  // Additional injector parameters can be added here
}

export interface NozzleParameters {
  throat_diameter_mm: number;
  exit_diameter_mm: number;
  length_mm: number;
  divergence_angle_deg: number;
  contour_type: 'conical' | 'bell';
}

export interface RocketParameters {
  chamberPressure: number;    // MPa
  mixtureRatio: number;       // O/F Ratio
  throatDiameter: number;     // mm
  chamberLength: number;      // mm
  nozzleExpansionRatio: number; // Ae/At
  propellantTemp: number;     // K
  
  // Hybrid rocket specific parameters
  grain: GrainParameters;
  combustionChamber: CombustionChamberParameters;
  injector: InjectorParameters;
  nozzle: NozzleParameters;
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

// New interfaces for optimization

export interface ParameterRange {
  min: number;
  max: number;
  step?: number;
  fixed: boolean;
  value?: number;
}

export interface OptimizationObjective {
  metric: 'thrust' | 'specificImpulse' | 'massFlowRate';
  direction: 'maximize' | 'minimize';
  weight?: number;
}

export interface OptimizationConfig {
  parameter_ranges: {
    [category: string]: { 
      [parameter: string]: ParameterRange 
    };
  };
  objectives: OptimizationObjective[];
  n_trials: number;
  timeout?: number;
  early_stopping_trials?: number;
}

export interface OptimizationTrial {
  trial_id: number;
  params: Record<string, any>;
  values: Record<string, number>;
  timestamp: number;
}

export interface OptimizationResult {
  study_id: string;
  config: OptimizationConfig;
  best_trials: OptimizationTrial[];
  trials_history: OptimizationTrial[];
  parameter_importance: Record<string, number>;
}
