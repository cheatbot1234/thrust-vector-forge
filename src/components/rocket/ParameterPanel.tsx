
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RocketParameters } from '@/types/simulation';
import { Loader2 } from 'lucide-react';

interface ParameterPanelProps {
  onRunSimulation: (parameters: Record<string, number>) => Promise<void>;
  isSimulating: boolean;
}

const defaultParameters: RocketParameters = {
  chamberPressure: 10,
  mixtureRatio: 2.1,
  throatDiameter: 50,
  chamberLength: 300,
  nozzleExpansionRatio: 16,
  propellantTemp: 298,
};

const ParameterPanel = ({ onRunSimulation, isSimulating }: ParameterPanelProps) => {
  const [parameters, setParameters] = useState<RocketParameters>(defaultParameters);
  const [simulationType, setSimulationType] = useState<string>('lite');

  const handleParameterChange = (key: keyof RocketParameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      [key]: parseFloat(e.target.value),
    });
  };

  const handleRunClick = () => {
    onRunSimulation(parameters);
  };

  return (
    <Card className="bg-rocket-blue border-rocket-blue/50 text-white w-full md:w-1/3">
      <CardHeader>
        <CardTitle className="text-rocket-orange">Engine Parameters</CardTitle>
        <CardDescription className="text-gray-300">Configure your rocket engine parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chamberPressure" className="text-gray-300">Chamber Pressure (MPa)</Label>
          <Input
            id="chamberPressure"
            type="number"
            value={parameters.chamberPressure}
            onChange={handleParameterChange('chamberPressure')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={1}
            max={30}
            step={0.1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mixtureRatio" className="text-gray-300">Mixture Ratio (O/F)</Label>
          <Input
            id="mixtureRatio"
            type="number"
            value={parameters.mixtureRatio}
            onChange={handleParameterChange('mixtureRatio')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={0.5}
            max={8}
            step={0.1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="throatDiameter" className="text-gray-300">Throat Diameter (mm)</Label>
          <Input
            id="throatDiameter"
            type="number"
            value={parameters.throatDiameter}
            onChange={handleParameterChange('throatDiameter')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={1}
            max={500}
            step={1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chamberLength" className="text-gray-300">Chamber Length (mm)</Label>
          <Input
            id="chamberLength"
            type="number"
            value={parameters.chamberLength}
            onChange={handleParameterChange('chamberLength')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={50}
            max={1000}
            step={10}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nozzleExpansionRatio" className="text-gray-300">Nozzle Expansion Ratio</Label>
          <Input
            id="nozzleExpansionRatio"
            type="number"
            value={parameters.nozzleExpansionRatio}
            onChange={handleParameterChange('nozzleExpansionRatio')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={2}
            max={100}
            step={0.5}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="propellantTemp" className="text-gray-300">Propellant Temperature (K)</Label>
          <Input
            id="propellantTemp"
            type="number"
            value={parameters.propellantTemp}
            onChange={handleParameterChange('propellantTemp')}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            min={100}
            max={400}
            step={1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="simulationType" className="text-gray-300">Simulation Type</Label>
          <Select
            value={simulationType}
            onValueChange={setSimulationType}
          >
            <SelectTrigger id="simulationType" className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
              <SelectValue placeholder="Select simulation type" />
            </SelectTrigger>
            <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
              <SelectItem value="lite">Lite Simulation</SelectItem>
              <SelectItem value="cfd" disabled>CFD (Coming Soon)</SelectItem>
              <SelectItem value="fem" disabled>FEM (Coming Soon)</SelectItem>
              <SelectItem value="ansys" disabled>ANSYS (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRunClick}
          disabled={isSimulating}
          className="w-full bg-rocket-orange hover:bg-rocket-lightOrange text-white"
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Simulation...
            </>
          ) : (
            'Run Simulation'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParameterPanel;
