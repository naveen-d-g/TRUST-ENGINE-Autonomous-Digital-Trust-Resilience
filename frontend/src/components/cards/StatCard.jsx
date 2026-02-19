import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-border/80 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
