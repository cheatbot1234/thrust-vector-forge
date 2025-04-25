
import { RocketParameters, SimulationResult } from "@/types/simulation";

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000';

/**
 * Run a simulation using the Python backend with RocketCEA and CoolProp
 */
export const runAdvancedSimulation = async (parameters: RocketParameters): Promise<SimulationResult> => {
  try {
    const response = await fetch(`${API_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Simulation failed');
    }

    const data = await response.json();
    return data as SimulationResult;
  } catch (error) {
    console.error('Simulation API error:', error);
    throw error;
  }
};

/**
 * Check if the backend service is available
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend connection error:', error);
    return false;
  }
};
