
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal

class GrainParameters(BaseModel):
    length_mm: float
    outer_diameter_mm: float
    initial_port_diameter_mm: float
    port_wall_thickness_mm: float
    port_axial_profile: Literal["cylindrical", "tapered"]
    port_profile_taper_angle_deg: float

class CombustionChamberParameters(BaseModel):
    length_mm: float
    inner_diameter_mm: float
    wall_thickness_mm: float
    chamber_volume_cc: float

class InjectorParameters(BaseModel):
    inj_plate_thickness: float

class NozzleParameters(BaseModel):
    throat_diameter_mm: float
    exit_diameter_mm: float
    length_mm: float
    divergence_angle_deg: float
    contour_type: Literal["conical", "bell"]

class RocketParameters(BaseModel):
    chamberPressure: float  # MPa
    mixtureRatio: float     # O/F Ratio
    throatDiameter: float   # mm
    chamberLength: float    # mm
    nozzleExpansionRatio: float  # Ae/At
    propellantTemp: float   # K
    
    # Hybrid rocket specific parameters
    grain: GrainParameters
    combustionChamber: CombustionChamberParameters
    injector: InjectorParameters
    nozzle: NozzleParameters

class ParameterRange(BaseModel):
    min: float
    max: float
    step: Optional[float] = None
    fixed: bool = False
    value: Optional[float] = None

# Updated ObjectiveConfig model to match the new format
class ObjectiveConfig(BaseModel):
    name: str  # 'thrust', 'specificImpulse', 'massFlowRate', etc.
    minimize: bool  # True for minimization, False for maximization

# Updated OptimizationConfig to use flat parameter_ranges structure
class OptimizationConfig(BaseModel):
    parameter_ranges: Dict[str, ParameterRange]
    objectives: List[ObjectiveConfig]
    n_trials: int = 100
    timeout: Optional[int] = None
    early_stopping_trials: Optional[int] = None

class OptimizationTrial(BaseModel):
    trial_id: int
    params: Dict[str, Any]
    values: Dict[str, float]
    timestamp: int

class OptimizationResult(BaseModel):
    study_id: str
    config: OptimizationConfig
    best_trials: List[OptimizationTrial]
    trials_history: List[OptimizationTrial]
    parameter_importance: Dict[str, float]
