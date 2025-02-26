import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the type for the weight tracking data
interface WeightData {
  date: string;
  weight: number;
}

const WeightTracker: React.FC = () => {
  // Sample data - each entry has a date and weight
  const data: WeightData[] = [
    { date: '2024-01-01', weight: 180 },
    { date: '2024-01-15', weight: 178 },
    { date: '2024-02-01', weight: 176 },
    { date: '2024-02-15', weight: 175 },
    { date: '2024-03-01', weight: 173 },
    { date: '2024-03-15', weight: 172 },
    { date: '2024-04-01', weight: 170 },
    { date: '2025-01-01', weight: 180 },
    { date: '2025-01-15', weight: 178 },
    { date: '2025-02-01', weight: 176 },
    { date: '2025-02-15', weight: 175 },
    { date: '2025-03-01', weight: 173 },
    { date: '2025-03-15', weight: 172 },
    { date: '2025-04-01', weight: 170 }
  ];

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric' });
  };

  const tooltipformatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {year:"numeric", month: 'short', day: 'numeric' });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Weight Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value: number) => `${value} lbs`}
              />
              <Tooltip
                labelFormatter={tooltipformatDate}
                formatter={(value: number) => [`${value} lbs`, 'Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightTracker;
