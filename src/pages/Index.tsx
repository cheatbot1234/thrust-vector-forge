
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ParameterPanel from '@/components/rocket/ParameterPanel';
import ResultsPanel from '@/components/rocket/ResultsPanel';
import { RocketParameters, SimulationResult } from '@/types/simulation';
import { runSimulation } from '@/utils/simulationEngine';
import { useToast } from '@/hooks/use-toast';
import { checkBackendStatus } from '@/api/simulationApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SimulationResult | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await checkBackendStatus();
        setBackendAvailable(available);
        if (available) {
          toast({
            title: "Advanced simulation available",
            description: "Using RocketCEA, CoolProp and other libraries for accurate results",
          });
        } else {
          toast({
            title: "Using simplified simulation",
            description: "Backend not available. For more accurate results, start the Python backend.",
            variant: "default",
          });
        }
      } catch (error) {
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, [toast]);

  const handleRunSimulation = async (parameters: RocketParameters) => {
    setIsSimulating(true);
    
    try {
      const result = await runSimulation(parameters);
      
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
        {backendAvailable === false && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Advanced simulation not available</AlertTitle>
            <AlertDescription>
              Using simplified simulation engine. For more accurate results, start the Python backend:
              <pre className="mt-2 text-xs bg-black/10 p-2 rounded">
                cd backend<br />
                pip install -r requirements.txt<br />
                uvicorn main:app --reload
              </pre>
            </AlertDescription>
          </Alert>
        )}
        
        <ParameterPanel 
          onRunSimulation={handleRunSimulation} 
          isSimulating={isSimulating} 
          useAdvancedMode={backendAvailable === true}
        />
        
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
