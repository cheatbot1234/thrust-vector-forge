
# Hybrid Rocket Simulation Backend

This is a FastAPI backend for hybrid rocket engine simulation using advanced libraries:

- RocketCEA for combustion analysis
- CoolProp for propellant properties
- OpenMDAO for optimization (future)
- RocketPy for trajectory analysis (future)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Endpoints

- GET `/`: Status check
- POST `/simulate`: Run simulation with provided parameters

## Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
