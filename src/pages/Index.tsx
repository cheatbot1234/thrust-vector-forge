
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ParameterPanel from '@/components/rocket/ParameterPanel';
import ResultsPanel from '@/components/rocket/ResultsPanel';
import { RocketParameters, SimulationResult } from '@/types/simulation';
import { runLiteSimulation } from '@/utils/simulationEngine';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const handleRunSimulation = async (parameters: RocketParameters) => {
    setIsSimulating(true);
    
    try {
      // In a real app, this would be replaced with a call to a Python backend
      const result = await runLiteSimulation(parameters);
      
      // Add result to the list
      setResults(prev => [...prev, result]);
      setSelectedResult(result);
      
      toast({
        title: "Simulation completed",
        description: `Thrust: ${result.thrust.toFixed(2)} kN, Isp: ${result.specificImpulse.toFixed(2)} s`,
      });
    } catch (error) {
      toast({
        title: "Simulation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSelectResult = (result: SimulationResult) => {
    setSelectedResult(result);
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6 h-full">
        <ParameterPanel onRunSimulation={handleRunSimulation} isSimulating={isSimulating} />
        <ResultsPanel 
          results={results}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
