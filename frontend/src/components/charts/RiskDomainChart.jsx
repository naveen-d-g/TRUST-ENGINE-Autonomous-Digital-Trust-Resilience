
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const RiskDomainChart = ({ data }) => {
  // Data expected: { "Web": 12, "API": 5, "Network": 2, "Infra": 1 }
  // Transform to array
  const chartData = [
      { name: 'Web', value: data?.web_abuse_count || 0, color: '#3b82f6' },
      { name: 'API', value: data?.api_abuse_count || 0, color: '#8b5cf6' },
      { name: 'Network', value: data?.network_anomaly_count || 0, color: '#f59e0b' },
      { name: 'Infra', value: data?.infra_stress_count || 0, color: '#ef4444' },
  ];

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDomainChart;
