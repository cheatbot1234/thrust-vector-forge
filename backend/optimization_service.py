
import optuna
import numpy as np
import time
from typing import Dict, List, Any, Optional, Tuple, Callable
import json
import os
from datetime import datetime

from models import OptimizationConfig, OptimizationTrial, OptimizationResult, RocketParameters, GrainParameters, CombustionChamberParameters, InjectorParameters, NozzleParameters

# Make sure this directory exists
STUDIES_DIR = "optimization_studies"
os.makedirs(STUDIES_DIR, exist_ok=True)

class OptimizationService:
    def __init__(self, simulation_function):
        self.simulation_function = simulation_function
        self.active_studies = {}
        
    def _build_rocket_parameters(self, trial, config: OptimizationConfig) -> RocketParameters:
        """Build RocketParameters from trial suggestions based on config ranges."""
        # Create default parameters that will be overridden by optimization
        grain = GrainParameters(
            length_mm=300,
            outer_diameter_mm=75,
            initial_port_diameter_mm=25,
            port_wall_thickness_mm=15,
            port_axial_profile="cylindrical",
            port_profile_taper_angle_deg=2
        )
        
        combustion_chamber = CombustionChamberParameters(
            length_mm=350,
            inner_diameter_mm=80,
            wall_thickness_mm=5,
            chamber_volume_cc=1200
        )
        
        injector = InjectorParameters(
            inj_plate_thickness=8
        )
        
        nozzle = NozzleParameters(
            throat_diameter_mm=50,
            exit_diameter_mm=200,
            length_mm=150,
            divergence_angle_deg=15,
            contour_type="conical"
        )
        
        # Default top-level parameters
        params = {
            "chamberPressure": 10.0,
            "mixtureRatio": 2.1,
            "throatDiameter": 50.0,
            "chamberLength": 300.0,
            "nozzleExpansionRatio": 16.0,
            "propellantTemp": 298.0
        }
        
        # Process parameters from flat structure
        for param_name, param_range in config.parameter_ranges.items():
            if param_range.fixed:
                # Use fixed value if parameter is set as fixed
                value = param_range.value
            else:
                # Otherwise suggest value from trial
                value = trial.suggest_float(
                    param_name, 
                    param_range.min, 
                    param_range.max,
                    step=param_range.step
                )
            
            # Determine where this parameter belongs
            if "." in param_name:
                # Handle nested parameters like "grain.length_mm"
                section, attr = param_name.split(".", 1)
                if section == "grain":
                    setattr(grain, attr, value)
                elif section == "combustionChamber":
                    setattr(combustion_chamber, attr, value)
                elif section == "nozzle":
                    if attr == "contour_type" and isinstance(value, (int, float)):
                        # Handle special case for enum types
                        setattr(nozzle, attr, "bell" if value > 0.5 else "conical")
                    else:
                        setattr(nozzle, attr, value)
                elif section == "injector":
                    setattr(injector, attr, value)
            else:
                # Handle top-level parameters
                params[param_name] = value
        
        # Create and return the RocketParameters
        return RocketParameters(
            chamberPressure=params["chamberPressure"],
            mixtureRatio=params["mixtureRatio"],
            throatDiameter=params.get("throatDiameter", 50),
            chamberLength=params.get("chamberLength", 300),
            nozzleExpansionRatio=params["nozzleExpansionRatio"],
            propellantTemp=params.get("propellantTemp", 298),
            grain=grain,
            combustionChamber=combustion_chamber,
            injector=injector,
            nozzle=nozzle
        )
    
    def _objective_function(self, trial, config: OptimizationConfig) -> float:
        """
        Objective function for Optuna optimization.
        Returns a value to be minimized (negative for maximization objectives).
        """
        try:
            # Build rocket parameters from trial suggestions
            rocket_params = self._build_rocket_parameters(trial, config)
            
            # Run simulation
            result = self.simulation_function(rocket_params)
            
            # Extract metrics based on objectives
            metrics = {}
            for objective in config.objectives:
                metric_name = objective.name
                if metric_name == "thrust":
                    metrics["thrust"] = result.thrust
                elif metric_name == "specificImpulse":
                    metrics["specificImpulse"] = result.specificImpulse
                elif metric_name == "massFlowRate":
                    metrics["massFlowRate"] = result.massFlowRate
                
                # Store metrics as trial user attributes
                trial.set_user_attr(metric_name, metrics[metric_name])
            
            # Multi-objective optimization
            if len(config.objectives) > 1:
                # Scalarize multiple objectives
                score = 0
                for objective in config.objectives:
                    metric_value = metrics[objective.name]
                    
                    # Normalize by typical values to keep ranges comparable
                    if objective.name == "thrust":
                        normalized_value = metric_value / 100.0  # typical thrust in kN
                    elif objective.name == "specificImpulse":
                        normalized_value = metric_value / 300.0  # typical Isp in seconds
                    elif objective.name == "massFlowRate":
                        normalized_value = metric_value / 10.0  # typical mass flow rate in kg/s
                    else:
                        normalized_value = metric_value
                    
                    # Add to score based on direction (minimize or maximize)
                    if objective.minimize:
                        score += normalized_value
                    else:
                        score -= normalized_value  # Negative for maximization
                        
                return score
            else:
                # Single objective optimization
                objective = config.objectives[0]
                metric_value = metrics[objective.name]
                
                if objective.minimize:
                    return metric_value
                else:
                    return -metric_value  # Negative for maximization
                
        except Exception as e:
            print(f"Error in optimization trial: {str(e)}")
            # Return a penalty value
            return 1e10  # Large value for minimization
    
    def create_study(self, config: OptimizationConfig) -> str:
        """Create a new optimization study."""
        # Generate a unique study ID
        study_id = f"study_{int(time.time())}"
        
        # Create the Optuna study
        study = optuna.create_study(
            study_name=study_id,
            direction=optuna.study.StudyDirection.MINIMIZE
        )
        
        # Store study with its configuration
        self.active_studies[study_id] = {
            "study": study,
            "config": config,
            "start_time": time.time(),
            "trial_history": []
        }
        
        # Return the study ID
        return study_id
    
    # ... keep existing code for run_optimization, continue_optimization, get_optimization_results methods

    def list_studies(self) -> List[str]:
        """List all available studies."""
        # List active studies
        studies = list(self.active_studies.keys())
        
        # Also check for studies on disk
        for file_name in os.listdir(STUDIES_DIR):
            if file_name.endswith(".json"):
                study_id = file_name[:-5]
                if study_id not in studies:
                    studies.append(study_id)
        
        return studies
        
    def run_optimization(self, study_id: str, async_mode: bool = False) -> OptimizationResult:
        """Run an optimization study."""
        if study_id not in self.active_studies:
            raise ValueError(f"Study {study_id} not found")
        
        study_data = self.active_studies[study_id]
        study = study_data["study"]
        config = study_data["config"]
        
        # Create callback to track trial history
        def callback(study, trial):
            # Extract parameters and values
            params = trial.params
            values = {attr: trial.user_attrs[attr] for attr in trial.user_attrs}
            
            # Create trial record
            trial_record = OptimizationTrial(
                trial_id=trial.number,
                params=params,
                values=values,
                timestamp=int(time.time())
            )
            
            # Store in history
            study_data["trial_history"].append(trial_record)
            
            # Save to disk periodically
            if trial.number % 10 == 0:
                self._save_study(study_id)
        
        # If async mode, just start the first trial and return
        if async_mode:
            study.optimize(
                lambda trial: self._objective_function(trial, config),
                n_trials=1,
                callbacks=[callback]
            )
            return self.get_optimization_results(study_id)
        
        # Otherwise, run the full optimization
        study.optimize(
            lambda trial: self._objective_function(trial, config),
            n_trials=config.n_trials,
            timeout=config.timeout,
            callbacks=[callback]
        )
        
        # Save the completed study
        self._save_study(study_id)
        
        # Return results
        return self.get_optimization_results(study_id)
    
    def continue_optimization(self, study_id: str, n_trials: int) -> OptimizationResult:
        """Continue an existing optimization study for additional trials."""
        if study_id not in self.active_studies:
            raise ValueError(f"Study {study_id} not found")
        
        study_data = self.active_studies[study_id]
        study = study_data["study"]
        config = study_data["config"]
        
        # Create callback to track trial history
        def callback(study, trial):
            params = trial.params
            values = {attr: trial.user_attrs[attr] for attr in trial.user_attrs}
            
            trial_record = OptimizationTrial(
                trial_id=trial.number,
                params=params,
                values=values,
                timestamp=int(time.time())
            )
            
            study_data["trial_history"].append(trial_record)
            
            if trial.number % 10 == 0:
                self._save_study(study_id)
        
        # Run additional trials
        study.optimize(
            lambda trial: self._objective_function(trial, config),
            n_trials=n_trials,
            callbacks=[callback]
        )
        
        # Save the updated study
        self._save_study(study_id)
        
        # Return results
        return self.get_optimization_results(study_id)
    
    def get_optimization_results(self, study_id: str) -> OptimizationResult:
        """Get current results of an optimization study."""
        if study_id not in self.active_studies:
            raise ValueError(f"Study {study_id} not found")
        
        study_data = self.active_studies[study_id]
        study = study_data["study"]
        config = study_data["config"]
        trials_history = study_data["trial_history"]
        
        # Get best trials
        best_trials = []
        if study.trials:
            # Sort trials by objective value
            sorted_trials = sorted(study.trials, key=lambda t: t.value if t.value is not None else float('inf'))
            top_trials = sorted_trials[:5]  # Get top 5 trials
            
            for trial in top_trials:
                if trial.value is not None:
                    params = trial.params
                    values = {attr: trial.user_attrs[attr] for attr in trial.user_attrs}
                    
                    trial_record = OptimizationTrial(
                        trial_id=trial.number,
                        params=params,
                        values=values,
                        timestamp=int(time.time())
                    )
                    best_trials.append(trial_record)
        
        # Calculate parameter importance if enough trials
        param_importance = {}
        if len(study.trials) >= 10:
            try:
                importance = optuna.importance.get_param_importances(study)
                param_importance = {k: float(v) for k, v in importance.items()}
            except Exception as e:
                print(f"Error calculating parameter importance: {str(e)}")
        
        # Return optimization results
        return OptimizationResult(
            study_id=study_id,
            config=config,
            best_trials=best_trials,
            trials_history=trials_history,
            parameter_importance=param_importance
        )
    
    def _save_study(self, study_id: str) -> None:
        """Save study data to disk."""
        if study_id not in self.active_studies:
            raise ValueError(f"Study {study_id} not found")
        
        study_data = self.active_studies[study_id]
        config = study_data["config"]
        trials_history = study_data["trial_history"]
        
        # Prepare data for saving
        save_data = {
            "study_id": study_id,
            "config": config.dict(),
            "trials_history": [trial.dict() for trial in trials_history],
            "timestamp": int(time.time())
        }
        
        # Save to file
        file_path = os.path.join(STUDIES_DIR, f"{study_id}.json")
        with open(file_path, "w") as f:
            json.dump(save_data, f, indent=2)
    
    def load_study(self, study_id: str) -> bool:
        """Load a study from disk."""
        file_path = os.path.join(STUDIES_DIR, f"{study_id}.json")
        
        if not os.path.exists(file_path):
            return False
        
        try:
            with open(file_path, "r") as f:
                save_data = json.load(f)
            
            # Recreate study
            config = OptimizationConfig(**save_data["config"])
            trials_history = [OptimizationTrial(**trial) for trial in save_data["trials_history"]]
            
            # Create a new study
            study = optuna.create_study(
                study_name=study_id,
                direction=optuna.study.StudyDirection.MINIMIZE
            )
            
            # Store in active studies
            self.active_studies[study_id] = {
                "study": study,
                "config": config,
                "start_time": time.time(),
                "trial_history": trials_history
            }
            
            return True
            
        except Exception as e:
            print(f"Error loading study {study_id}: {str(e)}")
            return False
