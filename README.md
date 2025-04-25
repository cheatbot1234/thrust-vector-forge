
# Hybrid Rocket Engine Simulator

An advanced hybrid rocket engine simulation tool with RocketCEA, CoolProp, and RocketPy integration.

## Features

- Web-based interface for configuring and simulating hybrid rocket engines
- Realistic N2O/Paraffin hybrid engine simulation
- Advanced mode using RocketCEA, CoolProp, and other Python libraries
- Visualization of engine performance and flow parameters
- Parameter optimization capabilities

## Setup

### Frontend (React)

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend (Python FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## Using the Simulator

1. Configure your hybrid rocket engine parameters
2. Run the simulation
3. View the results in the visualization panel
4. Compare multiple simulation runs

## Technologies Used

- Frontend: React, TypeScript, TailwindCSS, Recharts
- Backend: FastAPI, RocketCEA, CoolProp, OpenMDAO, RocketPy
