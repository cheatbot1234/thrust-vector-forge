
import { RocketParameters, SimulationResult, OptimizationConfig, OptimizationResult } from "@/types/simulation";

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

/**
 * Create a new optimization study
 */
export const createOptimizationStudy = async (config: OptimizationConfig): Promise<{study_id: string}> => {
  try {
    const response = await fetch(`${API_URL}/optimize/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create optimization study');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization API error:', error);
    throw error;
  }
};

/**
 * Run an optimization study
 */
export const runOptimization = async (
  study_id: string, 
  asyncMode: boolean = false
): Promise<OptimizationResult> => {
  try {
    const response = await fetch(`${API_URL}/optimize/run/${study_id}?async_mode=${asyncMode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Optimization failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization API error:', error);
    throw error;
  }
};

/**
 * Continue an existing optimization study
 */
export const continueOptimization = async (
  study_id: string, 
  n_trials: number = 10
): Promise<OptimizationResult> => {
  try {
    const response = await fetch(`${API_URL}/optimize/continue/${study_id}?n_trials=${n_trials}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to continue optimization');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization API error:', error);
    throw error;
  }
};

/**
 * Get results of an optimization study
 */
export const getOptimizationResults = async (study_id: string): Promise<OptimizationResult> => {
  try {
    const response = await fetch(`${API_URL}/optimize/results/${study_id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get optimization results');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization API error:', error);
    throw error;
  }
};

/**
 * List all available optimization studies
 */
export const listOptimizationStudies = async (): Promise<{studies: string[]}> => {
  try {
    const response = await fetch(`${API_URL}/optimize/studies`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to list optimization studies');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization API error:', error);
    throw error;
  }
};
