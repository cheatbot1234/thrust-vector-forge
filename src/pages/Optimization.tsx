
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import OptimizationPanel from '@/components/optimization/OptimizationPanel';
import OptimizationResults from '@/components/optimization/OptimizationResults';
import { OptimizationConfig, OptimizationResult } from '@/types/simulation';
import { 
  createOptimizationStudy, 
  runOptimization, 
  continueOptimization, 
  getOptimizationResults, 
  listOptimizationStudies, 
  checkBackendStatus 
} from '@/api/simulationApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Optimization = () => {
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [availableStudies, setAvailableStudies] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await checkBackendStatus();
        setBackendAvailable(available);
        
        if (available) {
          // Get list of studies
          await loadStudies();
          
          toast({
            title: "Optimization service available",
            description: "Backend is running and optimization features are available",
          });
        } else {
          toast({
            title: "Optimization not available",
            description: "Backend is not running. Start the Python backend to use optimization features.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, [toast]);
  
  const loadStudies = async () => {
    try {
      const { studies } = await listOptimizationStudies();
      setAvailableStudies(studies);
    } catch (error) {
      console.error("Failed to load optimization studies:", error);
    }
  };
  
  const handleCreateOptimization = async (config: OptimizationConfig) => {
    if (!backendAvailable) {
      toast({
        title: "Backend not available",
        description: "Cannot create optimization study. Start the backend first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsOptimizing(true);
      const { study_id } = await createOptimizationStudy(config);
      setActiveStudyId(study_id);
      
      toast({
        title: "Optimization study created",
        description: `Study ID: ${study_id}`,
      });
      
      await loadStudies();
      
    } catch (error) {
      toast({
        title: "Failed to create optimization",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleRunOptimization = async (study_id: string, async_mode: boolean = false) => {
    if (!backendAvailable) {
      toast({
        title: "Backend not available",
        description: "Cannot run optimization. Start the backend first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsOptimizing(true);
      setActiveStudyId(study_id);
      
      toast({
        title: "Optimization running",
        description: `Study ID: ${study_id}`,
      });
      
      const result = await runOptimization(study_id, async_mode);
      setOptimizationResults(result);
      
      toast({
        title: "Optimization completed",
        description: `Study ID: ${study_id}, ${result.best_trials.length} best trials found`,
      });
      
    } catch (error) {
      toast({
        title: "Failed to run optimization",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleContinueOptimization = async (study_id: string, n_trials: number = 10) => {
    if (!backendAvailable) {
      toast({
        title: "Backend not available",
        description: "Cannot continue optimization. Start the backend first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsOptimizing(true);
      setActiveStudyId(study_id);
      
      toast({
        title: "Continuing optimization",
        description: `Study ID: ${study_id}, Running ${n_trials} more trials`,
      });
      
      const result = await continueOptimization(study_id, n_trials);
      setOptimizationResults(result);
      
      toast({
        title: "Additional optimization completed",
        description: `Study ID: ${study_id}, ${result.best_trials.length} best trials found`,
      });
      
    } catch (error) {
      toast({
        title: "Failed to continue optimization",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleLoadStudyResults = async (study_id: string) => {
    if (!backendAvailable) {
      toast({
        title: "Backend not available",
        description: "Cannot load optimization results. Start the backend first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setActiveStudyId(study_id);
      
      const result = await getOptimizationResults(study_id);
      setOptimizationResults(result);
      
      toast({
        title: "Optimization results loaded",
        description: `Study ID: ${study_id}`,
      });
      
    } catch (error) {
      toast({
        title: "Failed to load optimization results",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6 h-full">
        {backendAvailable === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Optimization not available</AlertTitle>
            <AlertDescription>
              Backend is not running. Start the Python backend to use optimization features:
              <pre className="mt-2 text-xs bg-black/10 p-2 rounded">
                cd backend<br />
                pip install -r requirements.txt<br />
                uvicorn main:app --reload
              </pre>
            </AlertDescription>
          </Alert>
        )}
        
        <OptimizationPanel 
          isOptimizing={isOptimizing}
          onCreateOptimization={handleCreateOptimization} 
          onRunOptimization={handleRunOptimization}
          onContinueOptimization={handleContinueOptimization}
          onLoadStudyResults={handleLoadStudyResults}
          activeStudyId={activeStudyId}
          availableStudies={availableStudies}
        />
        
        <OptimizationResults 
          results={optimizationResults}
          isLoading={isOptimizing}
        />
      </div>
    </AppLayout>
  );
};

export default Optimization;
