
import { ParameterRange } from '@/types/simulation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ParameterRangeInputProps {
  category: string;
  parameter: string;
  range: ParameterRange;
  onChange: (category: string, parameter: string, field: keyof ParameterRange, value: any) => void;
  label: string;
}

const ParameterRangeInput = ({
  category,
  parameter,
  range,
  onChange,
  label
}: ParameterRangeInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <div className="flex items-center space-x-2">
        <Switch
          id={`${category}-${parameter}-fixed`}
          checked={range.fixed}
          onCheckedChange={(checked) => onChange(category, parameter, "fixed", checked)}
        />
        <Label htmlFor={`${category}-${parameter}-fixed`}>Fixed Value</Label>
      </div>
      
      {range.fixed ? (
        <div className="space-y-2">
          <Label htmlFor={`${category}-${parameter}-value`} className="text-xs text-gray-400">Value</Label>
          <Input
            id={`${category}-${parameter}-value`}
            type="number"
            value={range.value !== undefined ? range.value : 0}
            onChange={(e) => onChange(category, parameter, "value", parseFloat(e.target.value))}
            className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor={`${category}-${parameter}-min`} className="text-xs text-gray-400">Min</Label>
            <Input
              id={`${category}-${parameter}-min`}
              type="number"
              value={range.min}
              onChange={(e) => onChange(category, parameter, "min", parseFloat(e.target.value))}
              className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${category}-${parameter}-max`} className="text-xs text-gray-400">Max</Label>
            <Input
              id={`${category}-${parameter}-max`}
              type="number"
              value={range.max}
              onChange={(e) => onChange(category, parameter, "max", parseFloat(e.target.value))}
              className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${category}-${parameter}-step`} className="text-xs text-gray-400">Step</Label>
            <Input
              id={`${category}-${parameter}-step`}
              type="number"
              value={range.step || 1}
              onChange={(e) => onChange(category, parameter, "step", parseFloat(e.target.value))}
              className="bg-rocket-darkBlue border-rocket-blue/30 text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterRangeInput;
