
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationResult } from '@/types/simulation';
import ResultsTable from '@/components/rocket/ResultsTable';
import ResultsCharts from '@/components/rocket/ResultsCharts';
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
          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList className="bg-rocket-darkBlue">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="data">Data Table</TabsTrigger>
            </TabsList>
            
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
