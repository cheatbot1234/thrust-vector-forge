
import { RocketParameters } from '@/types/simulation';

interface RocketEngineProps {
  parameters: RocketParameters;
}

export const RocketEngine = ({ parameters }: RocketEngineProps) => {
  // Calculate dimensions based on parameters
  const throatDiameter = parameters.nozzle.throat_diameter_mm;
  const exitDiameter = parameters.nozzle.exit_diameter_mm;
  const chamberDiameter = parameters.combustionChamber.inner_diameter_mm;
  const chamberLength = parameters.combustionChamber.length_mm;
  const nozzleLength = parameters.nozzle.length_mm;
  const grainLength = parameters.grain.length_mm;
  const grainOuterDiameter = parameters.grain.outer_diameter_mm;
  const grainInnerDiameter = parameters.grain.initial_port_diameter_mm;
  
  // Calculate SVG dimensions and scaling
  const maxDiameter = Math.max(chamberDiameter, exitDiameter);
  const totalLength = chamberLength + nozzleLength;
  const padding = 20;
  const width = 300;
  const height = 180;
  
  // Scale everything to fit in our SVG viewport
  const scale = Math.min(
    (width - padding * 2) / totalLength,
    (height - padding * 2) / maxDiameter
  );
  
  // Calculate positions
  const chamberX = padding;
  const centerY = height / 2;
  const throatX = chamberX + chamberLength * scale;
  const nozzleExitX = throatX + nozzleLength * scale;

  // Convert dimensions to scaled pixel values
  const scaledChamberDiameter = chamberDiameter * scale;
  const scaledThroatDiameter = throatDiameter * scale;
  const scaledExitDiameter = exitDiameter * scale;
  const scaledChamberLength = chamberLength * scale;
  const scaledGrainLength = grainLength * scale;
  const scaledGrainOuterDiameter = grainOuterDiameter * scale;
  const scaledGrainInnerDiameter = grainInnerDiameter * scale;
  
  // Calculate the start position for the grain within the chamber
  const grainStartX = chamberX + 20 * scale; // Small offset from injector face
  
  return (
    <div className="bg-rocket-darkBlue rounded-md p-4 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-rocket-orange mb-4">N2O/Paraffin Hybrid Engine</h3>
      
      <div className="flex-1 flex items-center justify-center">
        <svg width={width} height={height} className="max-w-full">
          {/* Chamber */}
          <rect
            x={chamberX}
            y={centerY - scaledChamberDiameter / 2}
            width={scaledChamberLength}
            height={scaledChamberDiameter}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1"
          />
          
          {/* Injector face */}
          <line
            x1={chamberX}
            y1={centerY - scaledChamberDiameter / 2}
            x2={chamberX}
            y2={centerY + scaledChamberDiameter / 2}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Injector holes - N2O injector */}
          {Array.from({ length: 6 }).map((_, i) => {
            const yOffset = (i - 2.5) * (scaledChamberDiameter / 6);
            return (
              <circle
                key={i}
                cx={chamberX + 5}
                cy={centerY + yOffset}
                r={2}
                fill="#94a3b8"
              />
            );
          })}
          
          {/* Paraffin Fuel Grain */}
          <rect
            x={grainStartX}
            y={centerY - scaledGrainOuterDiameter / 2}
            width={scaledGrainLength}
            height={scaledGrainOuterDiameter}
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="1"
          />
          
          {/* Fuel Grain Port */}
          <rect
            x={grainStartX}
            y={centerY - scaledGrainInnerDiameter / 2}
            width={scaledGrainLength}
            height={scaledGrainInnerDiameter}
            fill="#1e293b"
            stroke="none"
          />
          
          {/* Throat */}
          <rect
            x={throatX}
            y={centerY - scaledThroatDiameter / 2}
            width={4}
            height={scaledThroatDiameter}
            fill="#475569"
            stroke="#64748b"
            strokeWidth="1"
          />
          
          {/* Nozzle (as a trapezoid) */}
          <path
            d={`M ${throatX} ${centerY - scaledThroatDiameter / 2}
                L ${nozzleExitX} ${centerY - scaledExitDiameter / 2}
                L ${nozzleExitX} ${centerY + scaledExitDiameter / 2}
                L ${throatX} ${centerY + scaledThroatDiameter / 2}
                Z`}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1"
          />
          
          {/* Flame */}
          <path
            d={`M ${nozzleExitX} ${centerY - scaledExitDiameter / 4}
                Q ${nozzleExitX + 100} ${centerY} ${nozzleExitX} ${centerY + scaledExitDiameter / 4}
                Z`}
            className="flame-gradient animate-flame"
            opacity="0.8"
          />
          
          {/* Labels */}
          <text x={chamberX + 5} y={centerY - scaledChamberDiameter/2 - 5} fill="#94a3b8" fontSize="8">Chamber</text>
          <text x={grainStartX + 5} y={centerY} fill="#94a3b8" fontSize="8">Paraffin</text>
          <text x={throatX + 10} y={centerY - scaledExitDiameter/2 - 5} fill="#94a3b8" fontSize="8">Nozzle</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">
        Hybrid N2O/Paraffin Engine - {parameters.grain.port_axial_profile} port configuration
      </div>
    </div>
  );
};
