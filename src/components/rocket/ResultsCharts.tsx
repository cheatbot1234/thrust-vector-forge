
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult } from '@/types/simulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResultsChartsProps {
  result: SimulationResult;
}

const ResultsCharts = ({ result }: ResultsChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-rocket-darkBlue border-rocket-blue/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rocket-orange">Pressure Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.pressureData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="x" 
                  label={{ value: 'Position (m)', position: 'insideBottom', offset: -5 }} 
                  tick={{ fill: '#94a3b8' }} 
                />
                <YAxis label={{ value: 'Pressure (MPa)', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }} 
                  itemStyle={{ color: '#ffffff' }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  name="Pressure"
                  stroke="#ff7e33" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-rocket-darkBlue border-rocket-blue/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rocket-orange">Temperature Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.temperatureData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="x" 
                  label={{ value: 'Position (m)', position: 'insideBottom', offset: -5 }} 
                  tick={{ fill: '#94a3b8' }} 
                />
                <YAxis label={{ value: 'Temperature (K)', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }} 
                  itemStyle={{ color: '#ffffff' }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  name="Temperature" 
                  stroke="#ffa066" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-rocket-darkBlue border-rocket-blue/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rocket-orange">Velocity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.velocityData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="x" 
                  label={{ value: 'Position (m)', position: 'insideBottom', offset: -5 }} 
                  tick={{ fill: '#94a3b8' }} 
                />
                <YAxis label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2a4f', borderColor: '#334155' }} 
                  itemStyle={{ color: '#ffffff' }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  name="Velocity" 
                  stroke="#60a5fa" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-rocket-darkBlue border-rocket-blue/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rocket-orange">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>Run multiple simulations to compare performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsCharts;
