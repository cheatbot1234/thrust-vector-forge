import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizationResult, SimulationResult } from '@/types/simulation';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, FileDown, Maximize2, Sparkles, Target } from 'lucide-react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar
} from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface OptimizationResultsProps {
  results: OptimizationResult | null;
  isLoading: boolean;
}

const OptimizationResults = ({ results, isLoading }: OptimizationResultsProps) => {
  const [selectedTrialIndex, setSelectedTrialIndex] = useState<number>(0);
  
  if (isLoading) {
    return (
      <Card className="bg-rocket-blue border-rocket-blue/30 text-white w-full md:w-3/5">
        <div className="flex flex-col items-center justify-center h-[30rem] p-8">
          <LoadingIndicator size="lg" className="mb-4" />
          <h3 className="text-xl font-medium">Running Optimization...</h3>
          <p className="text-gray-300 mt-2">This may take a few minutes depending on the number of trials.</p>
        </div>
      </Card>
    );
  }
  
  if (!results) {
    return (
      <Card className="bg-rocket-blue border-rocket-blue/30 text-white w-full md:w-3/5">
        <div className="flex flex-col items-center justify-center h-[30rem] p-8">
          <Target className="h-16 w-16 mb-6 text-gray-400" />
          <h3 className="text-xl font-medium">No Optimization Results</h3>
          <p className="text-gray-300 mt-2">Create and run an optimization study to see results here.</p>
        </div>
      </Card>
    );
  }
  
  // Get the selected best trial
  const selectedTrial = results.best_trials[selectedTrialIndex];
  
  // Format trial value for display
  const formatTrialValue = (value: number, metric: string): string => {
    if (metric === 'thrust') return `${value.toFixed(2)} kN`;
    if (metric === 'specificImpulse') return `${value.toFixed(1)} s`;
    if (metric === 'massFlowRate') return `${value.toFixed(3)} kg/s`;
    return value.toFixed(2);
  };

  // Create dataset for parameter importance chart
  const paramImportanceData = Object.entries(results.parameter_importance)
    .map(([param, importance]) => ({
      parameter: param.split('.').pop() || param,
      importance: importance * 100
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);
  
  // Create dataset for convergence plot
  const convergenceData = results.trials_history.map((trial, index) => {
    // Find the best metric value up to this trial
    let bestThrust = -Infinity;
    let bestIsp = -Infinity;
    
    for (let i = 0; i <= index; i++) {
      const currentTrial = results.trials_history[i];
      if (currentTrial.values.thrust && currentTrial.values.thrust > bestThrust) {
        bestThrust = currentTrial.values.thrust;
      }
      if (currentTrial.values.specificImpulse && currentTrial.values.specificImpulse > bestIsp) {
        bestIsp = currentTrial.values.specificImpulse;
      }
    }
    
    return {
      trial: index + 1,
      thrust: trial.values.thrust,
      specificImpulse: trial.values.specificImpulse,
      bestThrust,
      bestIsp
    };
  });
  
  // Create dataset for Pareto front if using multiple objectives
  const paretoData = results.trials_history
    .filter(trial => 
      trial.values.thrust !== undefined && 
      trial.values.specificImpulse !== undefined
    )
    .map(trial => ({
      thrust: trial.values.thrust,
      specificImpulse: trial.values.specificImpulse,
      isBest: results.best_trials.some(best => best.trial_id === trial.trial_id)
    }));

  return (
    <Card className="bg-rocket-blue border-rocket-blue/30 text-white w-full md:w-3/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-rocket-orange flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Optimization Results
            </CardTitle>
            <CardDescription className="text-gray-300">
              Study: {results.study_id} - {results.trials_history.length} trials completed
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-gray-300 border-rocket-blue/30">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="best" className="w-full">
          <TabsList className="bg-rocket-darkBlue w-full mb-4">
            <TabsTrigger value="best">Best Solutions</TabsTrigger>
            <TabsTrigger value="pareto">Pareto Front</TabsTrigger>
            <TabsTrigger value="convergence">Convergence</TabsTrigger>
            <TabsTrigger value="importance">Parameter Importance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="best" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {results.best_trials.map((trial, index) => (
                <Card 
                  key={trial.trial_id} 
                  className={`bg-rocket-darkBlue border-rocket-blue/30 cursor-pointer hover:bg-rocket-darkBlue/70 transition-colors ${
                    index === selectedTrialIndex ? 'ring-2 ring-rocket-orange' : ''
                  }`}
                  onClick={() => setSelectedTrialIndex(index)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="font-mono text-xs mb-1 text-gray-400">Trial #{trial.trial_id}</div>
                    {Object.entries(trial.values).map(([metric, value]) => (
                      <div key={metric} className="mb-1">
                        <Badge 
                          variant="outline" 
                          className={`font-mono ${
                            results.config.objectives.some(obj => obj.name === metric) 
                              ? 'bg-rocket-orange/20 border-rocket-orange' 
                              : 'bg-rocket-blue/20'
                          }`}
                        >
                          {metric === 'thrust' && 'Thrust'}
                          {metric === 'specificImpulse' && 'ISP'}
                          {metric === 'massFlowRate' && 'Mass Flow'}
                          {metric !== 'thrust' && metric !== 'specificImpulse' && metric !== 'massFlowRate' && metric}
                          {': '}
                          {formatTrialValue(value, metric)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedTrial && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-rocket-orange">Selected Solution Parameters</h3>
                
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="basic" className="border-rocket-blue/30">
                    <AccordionTrigger className="text-gray-100 hover:text-rocket-orange">Basic Parameters</AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedTrial.params)
                          .filter(([key]) => !key.includes('.'))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 border-b border-rocket-blue/20">
                              <span>{key}</span>
                              <span className="font-mono">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                            </div>
                          ))
                        }
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="grain" className="border-rocket-blue/30">
                    <AccordionTrigger className="text-gray-100 hover:text-rocket-orange">Grain Parameters</AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedTrial.params)
                          .filter(([key]) => key.startsWith('grain.'))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 border-b border-rocket-blue/20">
                              <span>{key.replace('grain.', '')}</span>
                              <span className="font-mono">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                            </div>
                          ))
                        }
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="nozzle" className="border-rocket-blue/30">
                    <AccordionTrigger className="text-gray-100 hover:text-rocket-orange">Nozzle Parameters</AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedTrial.params)
                          .filter(([key]) => key.startsWith('nozzle.'))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 border-b border-rocket-blue/20">
                              <span>{key.replace('nozzle.', '')}</span>
                              <span className="font-mono">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                            </div>
                          ))
                        }
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pareto" className="m-0">
            <div className="bg-rocket-darkBlue border border-rocket-blue/30 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-rocket-orange mb-2">Pareto Front - Thrust vs ISP</h3>
              <p className="text-xs text-gray-400 mb-4">
                Points in orange are on the Pareto front, representing the best trade-offs between objectives.
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 10, right: 30, bottom: 30, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="thrust" 
                      name="Thrust" 
                      unit=" kN"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Thrust (kN)', position: 'bottom', fill: '#94a3b8' }}
                    />
                    <YAxis 
                      dataKey="specificImpulse" 
                      name="ISP" 
                      unit=" s"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Specific Impulse (s)', angle: -90, position: 'left', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }}
                      formatter={(value) => [`${value}`, '']}
                    />
                    <Legend />
                    <Scatter 
                      name="All Trials" 
                      data={paretoData.filter(d => !d.isBest)} 
                      fill="#334155" 
                    />
                    <Scatter 
                      name="Best Solutions" 
                      data={paretoData.filter(d => d.isBest)} 
                      fill="#ff7e33" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="convergence" className="m-0">
            <div className="bg-rocket-darkBlue border border-rocket-blue/30 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-rocket-orange mb-2">Optimization Convergence</h3>
              <p className="text-xs text-gray-400 mb-4">
                This chart shows how the optimization performance improves over multiple trials.
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={convergenceData}
                    margin={{ top: 10, right: 30, bottom: 30, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="trial" 
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Trial Number', position: 'bottom', fill: '#94a3b8' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Thrust (kN)', angle: -90, position: 'left', fill: '#94a3b8' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'ISP (s)', angle: 90, position: 'right', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="thrust" 
                      stroke="#8884d8" 
                      dot={false}
                      name="Trial Thrust"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="bestThrust" 
                      stroke="#ff7e33" 
                      dot={false}
                      name="Best Thrust"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="specificImpulse" 
                      stroke="#82ca9d" 
                      dot={false}
                      name="Trial ISP"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="bestIsp" 
                      stroke="#ffc658" 
                      dot={false}
                      name="Best ISP"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="importance" className="m-0">
            <div className="bg-rocket-darkBlue border border-rocket-blue/30 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-rocket-orange mb-2">Parameter Importance</h3>
              <p className="text-xs text-gray-400 mb-4">
                These are the parameters with the most significant impact on optimization objectives.
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paramImportanceData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, bottom: 30, left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      type="number"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Relative Importance (%)', position: 'bottom', fill: '#94a3b8' }}
                    />
                    <YAxis 
                      dataKey="parameter" 
                      type="category"
                      tick={{ fill: '#94a3b8' }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }}
                      formatter={(value) => [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Importance']}
                    />
                    <Bar dataKey="importance" fill="#ff7e33" name="Importance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OptimizationResults;
