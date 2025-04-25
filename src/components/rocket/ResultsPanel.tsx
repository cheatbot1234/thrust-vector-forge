
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationResult } from '@/types/simulation';
import ResultsTable from '@/components/rocket/ResultsTable';
import ResultsCharts from '@/components/rocket/ResultsCharts';
import { RocketEngine } from '@/components/rocket/RocketEngine';
import NoResults from '@/components/rocket/NoResults';

interface ResultsPanelProps {
  results: SimulationResult[];
  selectedResult: SimulationResult | null;
  onSelectResult: (result: SimulationResult) => void;
}

const ResultsPanel = ({ results, selectedResult, onSelectResult }: ResultsPanelProps) => {
  return (
    <Card className="bg-rocket-blue border-rocket-blue/50 text-white w-full md:w-2/3">
      <CardHeader>
        <CardTitle className="text-rocket-orange">Simulation Results</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <NoResults />
        ) : (
          <Tabs defaultValue="visualization" className="space-y-4">
            <TabsList className="bg-rocket-darkBlue">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="data">Data Table</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="space-y-4">
              {selectedResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <RocketEngine parameters={selectedResult.parameters} />
                  
                  <div className="bg-rocket-darkBlue rounded-md p-4 space-y-4">
                    <h3 className="text-xl font-semibold text-rocket-orange">Performance Metrics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-rocket-blue/50 p-3 rounded-md">
                        <p className="text-sm text-gray-300">Thrust</p>
                        <p className="text-2xl font-bold">{selectedResult.thrust.toFixed(2)} kN</p>
                      </div>
                      
                      <div className="bg-rocket-blue/50 p-3 rounded-md">
                        <p className="text-sm text-gray-300">Specific Impulse</p>
                        <p className="text-2xl font-bold">{selectedResult.specificImpulse.toFixed(2)} s</p>
                      </div>
                      
                      <div className="bg-rocket-blue/50 p-3 rounded-md">
                        <p className="text-sm text-gray-300">Chamber Temp</p>
                        <p className="text-2xl font-bold">{selectedResult.chamberTemperature.toFixed(0)} K</p>
                      </div>
                      
                      <div className="bg-rocket-blue/50 p-3 rounded-md">
                        <p className="text-sm text-gray-300">Mass Flow</p>
                        <p className="text-2xl font-bold">{selectedResult.massFlowRate.toFixed(2)} kg/s</p>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-rocket-orange mt-4">Input Parameters</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-300">Chamber Pressure:</span> {selectedResult.parameters.chamberPressure} MPa
                      </div>
                      <div>
                        <span className="text-gray-300">Mixture Ratio:</span> {selectedResult.parameters.mixtureRatio}
                      </div>
                      <div>
                        <span className="text-gray-300">Throat Diameter:</span> {selectedResult.parameters.throatDiameter} mm
                      </div>
                      <div>
                        <span className="text-gray-300">Chamber Length:</span> {selectedResult.parameters.chamberLength} mm
                      </div>
                      <div>
                        <span className="text-gray-300">Expansion Ratio:</span> {selectedResult.parameters.nozzleExpansionRatio}
                      </div>
                      <div>
                        <span className="text-gray-300">Propellant Temp:</span> {selectedResult.parameters.propellantTemp} K
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="charts">
              {selectedResult && <ResultsCharts result={selectedResult} />}
            </TabsContent>
            
            <TabsContent value="data">
              <ResultsTable results={results} onSelectResult={onSelectResult} selectedResultId={selectedResult?.id} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
