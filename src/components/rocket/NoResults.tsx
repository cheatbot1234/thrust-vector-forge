
import { RocketIcon } from '@/components/icons/RocketIcon';

const NoResults = () => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6">
      <RocketIcon className="h-12 w-12 text-rocket-orange mb-4" />
      <h3 className="text-xl font-semibold">No Simulation Results Yet</h3>
      <p className="text-gray-300 mt-2 max-w-md">
        Configure your rocket engine parameters and click "Run Simulation" to visualize performance metrics and optimization opportunities.
      </p>
    </div>
  );
};

export default NoResults;
