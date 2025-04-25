
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimulationResult } from '@/types/simulation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ResultsTableProps {
  results: SimulationResult[];
  selectedResultId?: string;
  onSelectResult: (result: SimulationResult) => void;
}

const ResultsTable = ({ results, selectedResultId, onSelectResult }: ResultsTableProps) => {
  return (
    <div className="rounded-md border border-rocket-blue/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-rocket-darkBlue hover:bg-rocket-darkBlue">
            <TableHead className="text-rocket-orange">Time</TableHead>
            <TableHead className="text-rocket-orange">Chamber P (MPa)</TableHead>
            <TableHead className="text-rocket-orange">O/F Ratio</TableHead>
            <TableHead className="text-rocket-orange">Throat (mm)</TableHead>
            <TableHead className="text-rocket-orange">Thrust (kN)</TableHead>
            <TableHead className="text-rocket-orange">Isp (s)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow 
              key={result.id}
              className={cn(
                "cursor-pointer bg-rocket-blue/50 hover:bg-rocket-blue",
                selectedResultId === result.id && "bg-rocket-blue"
              )}
              onClick={() => onSelectResult(result)}
            >
              <TableCell>{format(new Date(result.timestamp), 'HH:mm:ss')}</TableCell>
              <TableCell>{result.parameters.chamberPressure.toFixed(1)}</TableCell>
              <TableCell>{result.parameters.mixtureRatio.toFixed(1)}</TableCell>
              <TableCell>{result.parameters.throatDiameter}</TableCell>
              <TableCell>{result.thrust.toFixed(2)}</TableCell>
              <TableCell>{result.specificImpulse.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTable;
