
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  OptimizationConfig,
  OptimizationObjective,
  ParameterRange,
  RocketParameters
} from '@/types/simulation';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { 
  BarChart3, 
  Layers, 
  Play, 
  Plus, 
  Search, 
  Settings, 
  Sliders, 
  Trash2 
} from 'lucide-react';
import ParameterRangeInput from './ParameterRangeInput';

interface OptimizationPanelProps {
  isOptimizing: boolean;
  onCreateOptimization: (config: OptimizationConfig) => Promise<void>;
  onRunOptimization: (studyId: string, async: boolean) => Promise<void>;
  onContinueOptimization: (studyId: string, n_trials: number) => Promise<void>;
  onLoadStudyResults: (studyId: string) => Promise<void>;
  activeStudyId: string | null;
  availableStudies: string[];
}

// Updated DEFAULT_CONFIG with flat parameter structure
const DEFAULT_CONFIG: OptimizationConfig = {
  parameter_ranges: {
    "chamberPressure": { min: 5, max: 20, step: 0.5, fixed: false },
    "mixtureRatio": { min: 1.5, max: 3, step: 0.1, fixed: false },
    "nozzleExpansionRatio": { min: 8, max: 20, step: 1, fixed: false },
    "propellantTemp": { min: 273, max: 323, step: 5, fixed: true, value: 298 },
    "grain.length_mm": { min: 200, max: 500, step: 10, fixed: false },
    "grain.outer_diameter_mm": { min: 50, max: 150, step: 5, fixed: false },
    "grain.initial_port_diameter_mm": { min: 15, max: 50, step: 1, fixed: false },
    "nozzle.throat_diameter_mm": { min: 30, max: 80, step: 2, fixed: false },
    "nozzle.divergence_angle_deg": { min: 10, max: 25, step: 1, fixed: false },
    "nozzle.contour_type": { min: 0, max: 1, step: 1, fixed: true, value: "bell" as any },
  },
  objectives: [
    { name: "thrust", minimize: false, weight: 1.0 },
    { name: "specificImpulse", minimize: false, weight: 1.0 },
  ],
  n_trials: 50,
  timeout: 600,  // 10 minutes timeout
};

const OptimizationPanel = ({
  isOptimizing,
  onCreateOptimization,
  onRunOptimization,
  onContinueOptimization,
  onLoadStudyResults,
  activeStudyId,
  availableStudies
}: OptimizationPanelProps) => {
  const [config, setConfig] = useState<OptimizationConfig>(DEFAULT_CONFIG);
  const [selectedStudy, setSelectedStudy] = useState<string>('');
  const [additionalTrials, setAdditionalTrials] = useState<number>(10);
  
  const handleObjectiveChange = (index: number, field: string, value: any) => {
    const newObjectives = [...config.objectives];
    newObjectives[index] = { ...newObjectives[index], [field]: value };
    setConfig({ ...config, objectives: newObjectives });
  };
  
  const addObjective = () => {
    setConfig({
      ...config,
      objectives: [
        ...config.objectives,
        { name: "specificImpulse", minimize: false, weight: 1.0 }
      ]
    });
  };
  
  const removeObjective = (index: number) => {
    if (config.objectives.length <= 1) return;
    
    const newObjectives = [...config.objectives];
    newObjectives.splice(index, 1);
    setConfig({ ...config, objectives: newObjectives });
  };
  
  // Updated to handle flat parameter structure
  const handleParameterRangeChange = (
    paramName: string,
    field: keyof ParameterRange,
    value: any
  ) => {
    const updatedRanges = { ...config.parameter_ranges };
    
    // Ensure the parameter exists
    if (!updatedRanges[paramName]) {
      updatedRanges[paramName] = { min: 0, max: 0, fixed: false };
    }
    
    // Update the field
    updatedRanges[paramName] = {
      ...updatedRanges[paramName],
      [field]: value
    };
    
    setConfig({
      ...config,
      parameter_ranges: updatedRanges
    });
  };
  
  const handleCreateOptimization = () => {
    onCreateOptimization(config);
  };
  
  const handleRunOptimization = (async_mode: boolean = false) => {
    if (activeStudyId) {
      onRunOptimization(activeStudyId, async_mode);
    } else if (selectedStudy) {
      onRunOptimization(selectedStudy, async_mode);
    }
  };
  
  const handleContinueOptimization = () => {
    if (activeStudyId) {
      onContinueOptimization(activeStudyId, additionalTrials);
    } else if (selectedStudy) {
      onContinueOptimization(selectedStudy, additionalTrials);
    }
  };
  
  const handleLoadStudyResults = () => {
    if (selectedStudy) {
      onLoadStudyResults(selectedStudy);
    }
  };

  // Helper function to group parameters by section for UI organization
  const getParametersBySection = () => {
    const sections: Record<string, string[]> = {
      "": [], // Top level parameters 
      "grain": [],
      "nozzle": [],
      "combustionChamber": [],
      "injector": []
    };
    
    Object.keys(config.parameter_ranges).forEach(param => {
      if (param.includes('.')) {
        const [section, name] = param.split('.');
        if (sections[section]) {
          sections[section].push(param);
        }
      } else {
        sections[""].push(param);
      }
    });
    
    return sections;
  };
  
  const parametersBySection = getParametersBySection();

  return (
    <Card className="bg-rocket-blue border-rocket-blue/50 text-white w-full md:w-2/5 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-rocket-orange flex items-center">
          <Sliders className="mr-2 h-5 w-5" />
          Parameter Optimization
        </CardTitle>
        <CardDescription className="text-gray-300">
          Automatically find optimal parameters for your rocket design
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[calc(100vh-250px)] overflow-y-auto">
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="bg-rocket-darkBlue w-full rounded-none border-b border-rocket-blue/30">
            <TabsTrigger value="parameters" className="flex-1">
              <Layers className="mr-2 h-4 w-4" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="objectives" className="flex-1">
              <BarChart3 className="mr-2 h-4 w-4" />
              Objectives
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Studies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4 p-6 pt-4 m-0">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-rocket-orange">Top Level Parameters</h3>
              
              {parametersBySection[""].map(param => (
                <ParameterRangeInput
                  key={param}
                  parameter={param}
                  range={config.parameter_ranges[param] || { min: 0, max: 0, fixed: false }}
                  onChange={(_, field, value) => handleParameterRangeChange(param, field, value)}
                  label={getLabelForParameter(param)}
                />
              ))}
              
              <Separator className="my-4 bg-rocket-blue/30" />
              
              <h3 className="text-sm font-medium text-rocket-orange">Grain Parameters</h3>
              
              {parametersBySection["grain"].map(param => (
                <ParameterRangeInput
                  key={param}
                  parameter={param}
                  range={config.parameter_ranges[param] || { min: 0, max: 0, fixed: false }}
                  onChange={(_, field, value) => handleParameterRangeChange(param, field, value)}
                  label={getLabelForParameter(param)}
                />
              ))}
              
              <Separator className="my-4 bg-rocket-blue/30" />
              
              <h3 className="text-sm font-medium text-rocket-orange">Nozzle Parameters</h3>
              
              {parametersBySection["nozzle"].map(param => (
                param === "nozzle.contour_type" ? (
                  <div key={param} className="space-y-2">
                    <Label className="text-gray-300">Nozzle Contour Type</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="contour-fixed"
                        checked={config.parameter_ranges[param]?.fixed || false}
                        onCheckedChange={(checked) =>
                          handleParameterRangeChange(param, "fixed", checked)
                        }
                      />
                      <Label htmlFor="contour-fixed">Fixed Value</Label>
                    </div>
                    
                    {config.parameter_ranges[param]?.fixed && (
                      <Select
                        value={config.parameter_ranges[param]?.value?.toString() || "bell"}
                        onValueChange={(value) =>
                          handleParameterRangeChange(param, "value", value)
                        }
                      >
                        <SelectTrigger className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                          <SelectValue placeholder="Select contour type" />
                        </SelectTrigger>
                        <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                          <SelectItem value="bell">Bell</SelectItem>
                          <SelectItem value="conical">Conical</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : (
                  <ParameterRangeInput
                    key={param}
                    parameter={param}
                    range={config.parameter_ranges[param] || { min: 0, max: 0, fixed: false }}
                    onChange={(_, field, value) => handleParameterRangeChange(param, field, value)}
                    label={getLabelForParameter(param)}
                  />
                )
              ))}
              
              {parametersBySection["combustionChamber"].length > 0 && (
                <>
                  <Separator className="my-4 bg-rocket-blue/30" />
                  <h3 className="text-sm font-medium text-rocket-orange">Combustion Chamber Parameters</h3>
                  
                  {parametersBySection["combustionChamber"].map(param => (
                    <ParameterRangeInput
                      key={param}
                      parameter={param}
                      range={config.parameter_ranges[param] || { min: 0, max: 0, fixed: false }}
                      onChange={(_, field, value) => handleParameterRangeChange(param, field, value)}
                      label={getLabelForParameter(param)}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="objectives" className="space-y-6 p-6 pt-4 m-0">
            {config.objectives.map((objective, index) => (
              <div key={index} className="space-y-4 p-4 border border-rocket-blue/30 rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-rocket-orange">
                    Objective {index + 1}
                  </h4>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeObjective(index)} 
                    disabled={config.objectives.length <= 1}
                    className="h-7 w-7 text-gray-300 hover:text-rocket-orange"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`metric-${index}`} className="text-gray-300">Metric</Label>
                  <Select
                    value={objective.name}
                    onValueChange={(value: any) => handleObjectiveChange(index, "name", value)}
                  >
                    <SelectTrigger id={`metric-${index}`} className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                      <SelectItem value="thrust">Thrust (kN)</SelectItem>
                      <SelectItem value="specificImpulse">Specific Impulse (s)</SelectItem>
                      <SelectItem value="massFlowRate">Mass Flow Rate (kg/s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`direction-${index}`} className="text-gray-300">Direction</Label>
                  <Select
                    value={objective.minimize ? "minimize" : "maximize"}
                    onValueChange={(value: any) => handleObjectiveChange(index, "minimize", value === "minimize")}
                  >
                    <SelectTrigger id={`direction-${index}`} className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                      <SelectItem value="maximize">Maximize</SelectItem>
                      <SelectItem value="minimize">Minimize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {config.objectives.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`weight-${index}`} className="text-gray-300">Weight</Label>
                      <span className="text-xs text-gray-400">{objective.weight || 1.0}</span>
                    </div>
                    <Input
                      id={`weight-${index}`}
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={objective.weight || 1.0}
                      onChange={(e) => handleObjectiveChange(index, "weight", parseFloat(e.target.value))}
                      className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Higher weights give more importance to this objective in multi-objective optimization
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addObjective}
              className="w-full border-dashed border-rocket-blue/50 bg-transparent hover:bg-rocket-blue/20 text-gray-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Objective
            </Button>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 p-6 pt-4 m-0">
            <div className="space-y-2">
              <Label htmlFor="n_trials" className="text-gray-300">Number of Trials</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="n_trials"
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={config.n_trials}
                  onChange={(e) => setConfig({ ...config, n_trials: parseInt(e.target.value) })}
                  className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                />
              </div>
              <p className="text-xs text-gray-400">
                Number of optimization trials to run (higher values give better results but take longer)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-gray-300">Timeout (seconds)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="timeout"
                  type="number"
                  min="60"
                  max="3600"
                  step="60"
                  value={config.timeout || 600}
                  onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                />
              </div>
              <p className="text-xs text-gray-400">
                Maximum time to run optimization in seconds (0 for no timeout)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="early_stopping" className="text-gray-300">Early Stopping Trials</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="early_stopping"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={config.early_stopping_trials || 0}
                  onChange={(e) => setConfig({ ...config, early_stopping_trials: parseInt(e.target.value) })}
                  className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                />
              </div>
              <p className="text-xs text-gray-400">
                Stop optimization if no improvement after this many trials (0 to disable)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="studies" className="space-y-4 p-6 pt-4 m-0">
            <div className="space-y-2">
              <Label htmlFor="study_select" className="text-gray-300">Select Study</Label>
              <Select
                value={selectedStudy}
                onValueChange={(value) => setSelectedStudy(value)}
              >
                <SelectTrigger id="study_select" className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  <SelectValue placeholder="Select a study" />
                </SelectTrigger>
                <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  {availableStudies.map((studyId) => (
                    <SelectItem key={studyId} value={studyId}>
                      {studyId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={handleLoadStudyResults}
                disabled={!selectedStudy || isOptimizing}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Load Study Results
              </Button>
            </div>
            
            <Separator className="my-4 bg-rocket-blue/30" />
            
            <div className="space-y-2">
              <Label htmlFor="continue_trials" className="text-gray-300">Additional Trials</Label>
              <Input
                id="continue_trials"
                type="number"
                min="1"
                max="100"
                value={additionalTrials}
                onChange={(e) => setAdditionalTrials(parseInt(e.target.value))}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleContinueOptimization()}
                disabled={(!selectedStudy && !activeStudyId) || isOptimizing}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Continue Study with {additionalTrials} More Trials
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-rocket-darkBlue border-t border-rocket-blue/30 p-4 flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleCreateOptimization}
          disabled={isOptimizing}
          className="w-full sm:w-1/3 bg-rocket-orange hover:bg-rocket-lightOrange text-white"
        >
          {isOptimizing ? (
            <LoadingIndicator className="mr-2" size="sm" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Create New
        </Button>
        
        <Button 
          onClick={() => handleRunOptimization(false)}
          disabled={(!activeStudyId && !selectedStudy) || isOptimizing}
          className="w-full sm:w-1/3 bg-rocket-green hover:bg-rocket-green/80 text-white"
        >
          {isOptimizing ? (
            <LoadingIndicator className="mr-2" size="sm" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run Full
        </Button>
        
        <Button 
          onClick={() => handleRunOptimization(true)}
          disabled={(!activeStudyId && !selectedStudy) || isOptimizing}
          variant="secondary"
          className="w-full sm:w-1/3"
        >
          {isOptimizing ? (
            <LoadingIndicator className="mr-2" size="sm" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run 1 Trial
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper function to format parameter names for display
function getLabelForParameter(param: string): string {
  if (param.includes('.')) {
    const [section, name] = param.split('.');
    // Convert snake_case to Title Case with spaces
    const formattedName = name.replace(/_/g, ' ').replace(/mm$/, ' (mm)').replace(/deg$/, ' (deg)');
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  } else {
    // Format top-level parameters
    switch(param) {
      case 'chamberPressure': return 'Chamber Pressure (MPa)';
      case 'mixtureRatio': return 'Mixture Ratio (O/F)';
      case 'nozzleExpansionRatio': return 'Nozzle Expansion Ratio';
      case 'propellantTemp': return 'Propellant Temperature (K)';
      case 'throatDiameter': return 'Throat Diameter (mm)';
      default: return param.replace(/([A-Z])/g, ' $1').trim();
    }
  }
}

export default OptimizationPanel;
