
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DecisionDistributionChart = ({ data, height = "100%", isMini = false }) => {
  if (!data) return null;

  // Normalize and aggregate data
  const aggregatedData = Object.entries(data).reduce((acc, [name, value]) => {
    const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    acc[normalizedName] = (acc[normalizedName] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregatedData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = {
    Allow: '#10b981',
    Restrict: '#ef4444',
    Escalate: '#f59e0b'
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isMini ? 30 : 60}
            outerRadius={isMini ? 40 : 80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          {!isMini && (
            <Legend 
              iconType="circle" 
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-muted-foreground text-sm font-medium">
                  {value}
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecisionDistributionChart;
