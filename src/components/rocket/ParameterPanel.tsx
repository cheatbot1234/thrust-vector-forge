import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RocketParameters, GrainParameters, CombustionChamberParameters, InjectorParameters, NozzleParameters } from '@/types/simulation';
import { Loader2, RocketIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface ParameterPanelProps {
  onRunSimulation: (parameters: RocketParameters) => Promise<void>;
  isSimulating: boolean;
  useAdvancedMode?: boolean;
}

const defaultGrainParameters: GrainParameters = {
  length_mm: 300,
  outer_diameter_mm: 75,
  initial_port_diameter_mm: 25,
  port_wall_thickness_mm: 15,
  port_axial_profile: 'cylindrical',
  port_profile_taper_angle_deg: 2,
};

const defaultCombustionChamberParameters: CombustionChamberParameters = {
  length_mm: 350,
  inner_diameter_mm: 80,
  wall_thickness_mm: 5,
  chamber_volume_cc: 1200,
};

const defaultInjectorParameters: InjectorParameters = {
  inj_plate_thickness: 8,
};

const defaultNozzleParameters: NozzleParameters = {
  throat_diameter_mm: 50,
  exit_diameter_mm: 200,
  length_mm: 150,
  divergence_angle_deg: 15,
  contour_type: 'conical',
};

const defaultParameters: RocketParameters = {
  chamberPressure: 10,
  mixtureRatio: 2.1,
  throatDiameter: 50,
  chamberLength: 300,
  nozzleExpansionRatio: 16,
  propellantTemp: 298,
  grain: defaultGrainParameters,
  combustionChamber: defaultCombustionChamberParameters,
  injector: defaultInjectorParameters,
  nozzle: defaultNozzleParameters,
};

const ParameterPanel = ({ onRunSimulation, isSimulating, useAdvancedMode = false }: ParameterPanelProps) => {
  const [parameters, setParameters] = useState<RocketParameters>(defaultParameters);
  const [simulationType, setSimulationType] = useState<string>('cea');

  const handleParameterChange = (key: keyof RocketParameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      [key]: parseFloat(e.target.value),
    });
  };

  const handleNestedParameterChange = 
    (category: 'grain' | 'combustionChamber' | 'injector' | 'nozzle') => 
    (key: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParameters({
        ...parameters,
        [category]: {
          ...parameters[category],
          [key]: parseFloat(e.target.value),
        },
      });
  };

  const handleSelectChange = 
    (category: 'grain' | 'nozzle') => 
    (key: string) => 
    (value: string) => {
      setParameters({
        ...parameters,
        [category]: {
          ...parameters[category],
          [key]: value,
        },
      });
  };

  const handleRunClick = () => {
    onRunSimulation(parameters);
  };

  return (
    <Card className="bg-rocket-blue border-rocket-blue/50 text-white w-full md:w-1/3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-rocket-orange">Hybrid Engine Parameters</CardTitle>
          {useAdvancedMode && (
            <Badge variant="outline" className="bg-rocket-orange/20 border-rocket-orange text-white">
              Advanced Mode
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-300">Configure your N2O/Paraffin hybrid rocket engine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-rocket-darkBlue w-full">
            <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
            <TabsTrigger value="grain" className="flex-1">Grain</TabsTrigger>
            <TabsTrigger value="chamber" className="flex-1">Chamber</TabsTrigger>
            <TabsTrigger value="injector" className="flex-1">Injector</TabsTrigger>
            <TabsTrigger value="nozzle" className="flex-1">Nozzle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
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
                  <SelectItem value="cea" disabled={!useAdvancedMode}>RocketCEA (Advanced)</SelectItem>
                  <SelectItem value="lite">Lite Simulation</SelectItem>
                  <SelectItem value="cfd" disabled>CFD (Coming Soon)</SelectItem>
                  <SelectItem value="fem" disabled>FEM (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
              {!useAdvancedMode && simulationType === 'cea' && (
                <p className="text-xs text-amber-400">Backend not available. Start the Python backend for advanced simulations.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="grain" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="grain_length" className="text-gray-300">Length (mm)</Label>
              <Input
                id="grain_length"
                type="number"
                value={parameters.grain.length_mm}
                onChange={handleNestedParameterChange('grain')('length_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={100}
                max={1000}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grain_outer_diameter" className="text-gray-300">Outer Diameter (mm)</Label>
              <Input
                id="grain_outer_diameter"
                type="number"
                value={parameters.grain.outer_diameter_mm}
                onChange={handleNestedParameterChange('grain')('outer_diameter_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={20}
                max={300}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grain_initial_port_diameter" className="text-gray-300">Initial Port Diameter (mm)</Label>
              <Input
                id="grain_initial_port_diameter"
                type="number"
                value={parameters.grain.initial_port_diameter_mm}
                onChange={handleNestedParameterChange('grain')('initial_port_diameter_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={5}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grain_port_wall_thickness" className="text-gray-300">Port Wall Thickness (mm)</Label>
              <Input
                id="grain_port_wall_thickness"
                type="number"
                value={parameters.grain.port_wall_thickness_mm}
                onChange={handleNestedParameterChange('grain')('port_wall_thickness_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={1}
                max={50}
                step={0.5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grain_port_axial_profile" className="text-gray-300">Port Axial Profile</Label>
              <Select
                value={parameters.grain.port_axial_profile}
                onValueChange={handleSelectChange('grain')('port_axial_profile')}
              >
                <SelectTrigger id="grain_port_axial_profile" className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  <SelectValue placeholder="Select profile type" />
                </SelectTrigger>
                <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  <SelectItem value="cylindrical">Cylindrical</SelectItem>
                  <SelectItem value="tapered">Tapered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grain_port_profile_taper_angle" className="text-gray-300">Profile Taper Angle (deg)</Label>
              <Input
                id="grain_port_profile_taper_angle"
                type="number"
                value={parameters.grain.port_profile_taper_angle_deg}
                onChange={handleNestedParameterChange('grain')('port_profile_taper_angle_deg')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                disabled={parameters.grain.port_axial_profile !== 'tapered'}
                min={0}
                max={30}
                step={0.1}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="chamber" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="chamber_length" className="text-gray-300">Length (mm)</Label>
              <Input
                id="chamber_length"
                type="number"
                value={parameters.combustionChamber.length_mm}
                onChange={handleNestedParameterChange('combustionChamber')('length_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={100}
                max={1000}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chamber_inner_diameter" className="text-gray-300">Inner Diameter (mm)</Label>
              <Input
                id="chamber_inner_diameter"
                type="number"
                value={parameters.combustionChamber.inner_diameter_mm}
                onChange={handleNestedParameterChange('combustionChamber')('inner_diameter_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={20}
                max={300}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chamber_wall_thickness" className="text-gray-300">Wall Thickness (mm)</Label>
              <Input
                id="chamber_wall_thickness"
                type="number"
                value={parameters.combustionChamber.wall_thickness_mm}
                onChange={handleNestedParameterChange('combustionChamber')('wall_thickness_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={1}
                max={30}
                step={0.5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chamber_volume" className="text-gray-300">Chamber Volume (cc)</Label>
              <Input
                id="chamber_volume"
                type="number"
                value={parameters.combustionChamber.chamber_volume_cc}
                onChange={handleNestedParameterChange('combustionChamber')('chamber_volume_cc')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={100}
                max={10000}
                step={10}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="injector" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="injector_plate_thickness" className="text-gray-300">Injector Plate Thickness (mm)</Label>
              <Input
                id="injector_plate_thickness"
                type="number"
                value={parameters.injector.inj_plate_thickness}
                onChange={handleNestedParameterChange('injector')('inj_plate_thickness')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={1}
                max={30}
                step={0.5}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="nozzle" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nozzle_throat_diameter" className="text-gray-300">Throat Diameter (mm)</Label>
              <Input
                id="nozzle_throat_diameter"
                type="number"
                value={parameters.nozzle.throat_diameter_mm}
                onChange={handleNestedParameterChange('nozzle')('throat_diameter_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={5}
                max={100}
                step={0.5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nozzle_exit_diameter" className="text-gray-300">Exit Diameter (mm)</Label>
              <Input
                id="nozzle_exit_diameter"
                type="number"
                value={parameters.nozzle.exit_diameter_mm}
                onChange={handleNestedParameterChange('nozzle')('exit_diameter_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={10}
                max={500}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nozzle_length" className="text-gray-300">Length (mm)</Label>
              <Input
                id="nozzle_length"
                type="number"
                value={parameters.nozzle.length_mm}
                onChange={handleNestedParameterChange('nozzle')('length_mm')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={10}
                max={300}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nozzle_divergence_angle" className="text-gray-300">Divergence Angle (deg)</Label>
              <Input
                id="nozzle_divergence_angle"
                type="number"
                value={parameters.nozzle.divergence_angle_deg}
                onChange={handleNestedParameterChange('nozzle')('divergence_angle_deg')}
                className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
                min={5}
                max={45}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nozzle_contour_type" className="text-gray-300">Contour Type</Label>
              <Select
                value={parameters.nozzle.contour_type}
                onValueChange={handleSelectChange('nozzle')('contour_type')}
              >
                <SelectTrigger id="nozzle_contour_type" className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  <SelectValue placeholder="Select contour type" />
                </SelectTrigger>
                <SelectContent className="bg-rocket-darkBlue border-rocket-blue/30 text-white">
                  <SelectItem value="conical">Conical</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRunClick}
          disabled={isSimulating}
          className="w-full bg-rocket-orange hover:bg-rocket-lightOrange text-white"
        >
          {isSimulating ? (
            <>
              <LoadingIndicator className="mr-2" size="sm" />
              Running {useAdvancedMode ? 'Advanced' : 'Simplified'} Simulation...
            </>
          ) : (
            <>
              <RocketIcon className="mr-2 h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParameterPanel;
