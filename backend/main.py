
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
import numpy as np
import time
import json
from rocketcea.cea_obj import CEA_Obj
import CoolProp.CoolProp as CP

app = FastAPI(title="Hybrid Rocket Simulation API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Initialize RocketCEA for N2O/Paraffin hybrid
cea_obj = CEA_Obj(oxName="N2O", fuelName="Paraffin")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Hybrid Rocket Simulation API is running"}

@app.post("/simulate")
def run_simulation(parameters: RocketParameters):
    try:
        # Convert chamber pressure from MPa to psia for CEA
        pc_psia = parameters.chamberPressure * 145.038  # MPa to psia
        
        # Get CEA data for the N2O/Paraffin combination at given mixture ratio
        cea_data = cea_obj.get_full_cea_output(
            pc=pc_psia,
            of=parameters.mixtureRatio,
            frozen=0,  # Equilibrium
            short_output=0
        )
        
        # Extract key parameters from CEA
        isp_vac = cea_obj.get_Isp(pc=pc_psia, er=parameters.nozzleExpansionRatio, of=parameters.mixtureRatio)
        cstar = cea_obj.get_Cstar(pc=pc_psia, of=parameters.mixtureRatio)
        gamma = cea_obj.get_Gamma(pc=pc_psia, of=parameters.mixtureRatio)
        t_chamber = cea_obj.get_Tcomb(pc=pc_psia, of=parameters.mixtureRatio)
        mw = cea_obj.get_MolWt_g(pc=pc_psia, of=parameters.mixtureRatio)
        
        # N2O properties using CoolProp
        n2o_density = CP.PropsSI('D', 'T', parameters.propellantTemp, 'P', 5000000, 'NitrousOxide')  # kg/m³
        
        # Paraffin density and regression parameters
        paraffin_density = 920  # kg/m³
        
        # Empirical regression rate parameters for paraffin
        a = 0.0001155  # Regression rate coefficient (SI units)
        n = 0.62       # Regression rate exponent for paraffin
        
        # Convert dimensions
        throat_area = np.pi * (parameters.nozzle.throat_diameter_mm / 2000) ** 2  # m²
        exit_area = np.pi * (parameters.nozzle.exit_diameter_mm / 2000) ** 2  # m²
        expansion_ratio = exit_area / throat_area
        
        grain_length = parameters.grain.length_mm / 1000  # m
        port_diameter = parameters.grain.initial_port_diameter_mm / 1000  # m
        port_area = np.pi * (port_diameter / 2) ** 2  # m²
        grain_burn_area = np.pi * port_diameter * grain_length  # m²
        
        # Chamber pressure in Pa
        chamber_pressure = parameters.chamberPressure * 1000000  # MPa to Pa
        
        # Calculate oxidizer mass flux
        estimated_ox_mass_flux = np.sqrt(chamber_pressure * 2 / port_area)  # kg/m²s
        
        # Calculate regression rate
        regression_rate = a * (estimated_ox_mass_flux ** n)  # m/s
        
        # Calculate fuel mass flow rate
        fuel_mass_flow_rate = regression_rate * grain_burn_area * paraffin_density  # kg/s
        
        # Calculate oxidizer mass flow rate based on mixture ratio
        oxid_mass_flow_rate = fuel_mass_flow_rate * parameters.mixtureRatio  # kg/s
        
        # Total mass flow rate
        mass_flow_rate = fuel_mass_flow_rate + oxid_mass_flow_rate  # kg/s
        
        # Recalculate oxidizer mass flux
        ox_mass_flux = oxid_mass_flow_rate / port_area  # kg/m²s
        
        # Calculate thrust coefficient using nozzle efficiency
        nozzle_efficiency = 0.98 if parameters.nozzle.contour_type == 'bell' else 0.95
        gamma_term = gamma * ((2/(gamma+1))**((gamma+1)/(gamma-1)))
        cf_ideal = np.sqrt(gamma_term) + expansion_ratio * (0 - 1/parameters.chamberPressure)
        cf = cf_ideal * nozzle_efficiency
        
        # Calculate thrust
        thrust = cf * chamber_pressure * throat_area  # N
        thrust_kn = thrust / 1000  # kN
        
        # Standard gravity
        g0 = 9.81  # m/s²
        
        # Calculate specific impulse
        isp = (thrust) / (mass_flow_rate * g0)  # s
        
        # Generate profiles along the engine
        engine_length = (parameters.combustionChamber.length_mm + parameters.nozzle.length_mm) / 1000
        throat_position = parameters.combustionChamber.length_mm / 1000
        
        # Generate detailed flow profiles
        num_points = 50
        x_positions = np.linspace(0, engine_length, num_points)
        
        pressure_data = []
        temperature_data = []
        velocity_data = []
        
        for x in x_positions:
            if x < throat_position:
                # Chamber section
                chamber_ratio = x / throat_position
                # More realistic pressure drop profile
                pressure_loss = 0.15 * (1 - np.power(1 - chamber_ratio, 2))
                pressure = chamber_pressure * (1 - pressure_loss) / 1000000  # Convert to MPa
                
                # Temperature profile in chamber
                temperature = t_chamber * (0.9 + 0.1 * np.power(1 - chamber_ratio, 0.5))
                
                # Velocity increases gradually in chamber
                velocity = cstar * 0.3048 * np.sqrt(chamber_ratio) * 0.4  # Convert ft/s to m/s and adjust
                
            else:
                # Nozzle section
                nozzle_ratio = (x - throat_position) / (engine_length - throat_position)
                
                # Calculate area ratio at this point
                if parameters.nozzle.contour_type == "bell":
                    # Bell nozzle has faster initial expansion
                    local_area_ratio = 1 + np.power(nozzle_ratio, 0.8) * (expansion_ratio - 1)
                else:
                    # Conical nozzle
                    local_area_ratio = 1 + nozzle_ratio * (expansion_ratio - 1)
                
                # Calculate local pressure based on area ratio
                pressure = chamber_pressure * np.power(1 / local_area_ratio, gamma / (gamma - 1)) / 1000000  # MPa
                
                # Calculate local temperature
                temperature = t_chamber * np.power(pressure * 1000000 / chamber_pressure, (gamma - 1) / gamma)
                
                # Calculate local velocity
                r_gas = 8314.4621 / mw  # Gas constant J/kg·K
                velocity = np.sqrt(2 * gamma * r_gas * t_chamber / (gamma - 1) * 
                          (1 - np.power(pressure * 1000000 / chamber_pressure, (gamma - 1) / gamma)))
            
            pressure_data.append({"x": float(x), "y": float(pressure)})
            temperature_data.append({"x": float(x), "y": float(temperature)})
            velocity_data.append({"x": float(x), "y": float(velocity)})
        
        # Return the simulation results
        result = {
            "id": f"sim_{int(time.time())}",
            "timestamp": int(time.time() * 1000),
            "parameters": parameters.dict(),
            "thrust": float(thrust_kn),
            "specificImpulse": float(isp),
            "chamberTemperature": float(t_chamber),
            "exitPressure": float(pressure_data[-1]["y"] * 1000),  # kPa
            "massFlowRate": float(mass_flow_rate),
            "thrustCoefficient": float(cf),
            "pressureData": pressure_data,
            "temperatureData": temperature_data,
            "velocityData": velocity_data,
            "cea_data": {
                "isp_vac": float(isp_vac),
                "cstar": float(cstar * 0.3048),  # Convert from ft/s to m/s
                "gamma": float(gamma),
                "chamber_temperature": float(t_chamber),
                "molecular_weight": float(mw)
            }
        }
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
