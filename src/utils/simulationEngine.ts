
import { RocketParameters, SimulationResult } from '@/types/simulation';

/**
 * Simplified rocket engine simulation using basic thermodynamic principles
 * In a real application, this would be implemented in Python and called via API
 */
export const runLiteSimulation = async (parameters: RocketParameters): Promise<SimulationResult> => {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Constants for simulation
  const R = 8314; // Universal gas constant (J/kmol-K)
  const g0 = 9.81; // Standard gravity (m/s^2)
  const gamma = 1.2; // Specific heat ratio for typical rocket exhaust
  const M = 20; // Molecular weight of exhaust gases (kg/kmol)
  const ambientPressure = 101.325; // Sea level pressure (kPa)
  
  // Convert input units
  const chamberPressure = parameters.chamberPressure * 1000; // MPa to kPa
  const throatArea = Math.PI * Math.pow(parameters.nozzle.throat_diameter_mm / 2000, 2); // mm² to m²
  const exitArea = Math.PI * Math.pow(parameters.nozzle.exit_diameter_mm / 2000, 2); // mm² to m²
  const expansionRatio = exitArea / throatArea;
  
  // Hybrid specific calculations
  const portArea = Math.PI * Math.pow(parameters.grain.initial_port_diameter_mm / 2000, 2); // mm² to m²
  const grainOuterArea = Math.PI * Math.pow(parameters.grain.outer_diameter_mm / 2000, 2); // mm² to m²
  const grainBurnArea = 2 * Math.PI * (parameters.grain.initial_port_diameter_mm / 2000) * (parameters.grain.length_mm / 1000);
  
  // Calculate chamber temperature based on mixture ratio and chamber pressure
  // This is a simplified model for N2O/Paraffin - in reality this would use CEA or other simulation
  const chamberTemperature = 1300 + 
    (parameters.chamberPressure * 150) + 
    (parameters.mixtureRatio * 400) - 
    (Math.pow(parameters.mixtureRatio - 2.5, 2) * 500);
  
  // Calculate characteristic velocity (c*)
  const cStar = Math.sqrt((gamma * R * chamberTemperature) / ((gamma + 1) / 2) ** ((gamma + 1) / (gamma - 1)) / M);
  
  // Calculate exit pressure
  const exitPressure = chamberPressure * (1 / expansionRatio) ** (gamma / (gamma - 1));
  
  // Calculate thrust coefficient
  const pressureRatio = exitPressure / chamberPressure;
  const thrustCoefficient = Math.sqrt(((2 * gamma ** 2) / (gamma - 1)) * ((2 / (gamma + 1)) ** ((gamma + 1) / (gamma - 1))) * 
    (1 - pressureRatio ** ((gamma - 1) / gamma))) + expansionRatio * (exitPressure - ambientPressure) / chamberPressure;
  
  // Calculate mass flow rate (adjusted for hybrid engine)
  const regressionRate = 0.0002 * Math.pow(chamberPressure, 0.5); // Simplified regression rate law for paraffin
  const fuelMassFlowRate = regressionRate * grainBurnArea * 920; // 920 kg/m³ is approx density of paraffin
  const oxidMassFlowRate = fuelMassFlowRate * parameters.mixtureRatio;
  const massFlowRate = fuelMassFlowRate + oxidMassFlowRate;
  
  // Calculate thrust
  const thrust = thrustCoefficient * chamberPressure * throatArea / 1000; // kN
  
  // Calculate specific impulse
  const exitVelocity = Math.sqrt((2 * gamma * R * chamberTemperature) / ((gamma - 1) * M) * 
    (1 - (exitPressure / chamberPressure) ** ((gamma - 1) / gamma)));
  const specificImpulse = exitVelocity / g0;
  
  // Generate data for charts
  const engineLength = (parameters.combustionChamber.length_mm + parameters.nozzle.length_mm) / 1000; // m
  const numPoints = 50;
  
  const pressureData: Array<{x: number, y: number}> = [];
  const temperatureData: Array<{x: number, y: number}> = [];
  const velocityData: Array<{x: number, y: number}> = [];
  
  const throatPosition = parameters.combustionChamber.length_mm / 1000;
  
  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * engineLength;
    let pressure, temperature, velocity;
    
    if (x < throatPosition) {
      // Chamber section
      const chamberRatio = x / throatPosition;
      pressure = chamberPressure * (0.9 + 0.1 * (1 - chamberRatio)) / 1000; // Convert to MPa
      temperature = chamberTemperature * (0.95 + 0.05 * (1 - chamberRatio));
      velocity = cStar * chamberRatio * 0.3;
    } else {
      // Nozzle section
      const nozzleRatio = (x - throatPosition) / (engineLength - throatPosition);
      const effectiveExpansion = 1 + nozzleRatio * (expansionRatio - 1);
      pressure = chamberPressure * Math.pow(1 / effectiveExpansion, gamma / (gamma - 1)) / 1000; // Convert to MPa
      temperature = chamberTemperature * Math.pow(pressure * 1000 / chamberPressure, (gamma - 1) / gamma);
      velocity = Math.sqrt((2 * gamma * R * chamberTemperature) / ((gamma - 1) * M) * 
        (1 - Math.pow(pressure * 1000 / chamberPressure, (gamma - 1) / gamma)));
    }
    
    pressureData.push({ x, y: pressure });
    temperatureData.push({ x, y: temperature });
    velocityData.push({ x, y: velocity });
  }
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    parameters: { ...parameters },
    thrust,
    specificImpulse,
    chamberTemperature,
    exitPressure,
    massFlowRate,
    thrustCoefficient,
    pressureData,
    temperatureData,
    velocityData
  };
};
