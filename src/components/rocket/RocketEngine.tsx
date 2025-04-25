
import { RocketParameters } from '@/types/simulation';

interface RocketEngineProps {
  parameters: RocketParameters;
}

export const RocketEngine = ({ parameters }: RocketEngineProps) => {
  // Calculate dimensions based on parameters
  const throatDiameter = parameters.throatDiameter;
  const chamberDiameter = throatDiameter * 1.5;
  const nozzleExitDiameter = throatDiameter * Math.sqrt(parameters.nozzleExpansionRatio);
  const chamberLength = parameters.chamberLength;
  
  // Calculate SVG dimensions and scaling
  const maxDiameter = Math.max(chamberDiameter, nozzleExitDiameter);
  const totalLength = chamberLength + maxDiameter * 1.5; // Approximate nozzle length
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
  const nozzleExitX = throatX + maxDiameter * scale;

  // Convert dimensions to scaled pixel values
  const scaledChamberDiameter = chamberDiameter * scale;
  const scaledThroatDiameter = throatDiameter * scale;
  const scaledNozzleExitDiameter = nozzleExitDiameter * scale;
  const scaledChamberLength = chamberLength * scale;
  
  return (
    <div className="bg-rocket-darkBlue rounded-md p-4 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-rocket-orange mb-4">Engine Visualization</h3>
      
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
          
          {/* Injector holes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const yOffset = (i - 3.5) * (scaledChamberDiameter / 8);
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
                L ${nozzleExitX} ${centerY - scaledNozzleExitDiameter / 2}
                L ${nozzleExitX} ${centerY + scaledNozzleExitDiameter / 2}
                L ${throatX} ${centerY + scaledThroatDiameter / 2}
                Z`}
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1"
          />
          
          {/* Flame */}
          <path
            d={`M ${nozzleExitX} ${centerY - scaledNozzleExitDiameter / 4}
                Q ${nozzleExitX + 100} ${centerY} ${nozzleExitX} ${centerY + scaledNozzleExitDiameter / 4}
                Z`}
            className="flame-gradient animate-flame"
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
};
