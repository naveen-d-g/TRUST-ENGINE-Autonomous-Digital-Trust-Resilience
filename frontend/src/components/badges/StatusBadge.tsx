import React from 'react';
import clsx from 'clsx';
import { IncidentState, EnforcementState } from '../../types/soc';

interface StatusBadgeProps {
  status: IncidentState | EnforcementState | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles: Record<string, string> = {
    // Incident States
    [IncidentState.OPEN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200',
    [IncidentState.CONTAINED]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
    [IncidentState.RECOVERED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
    [IncidentState.CLOSED]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200',
    
    // Enforcement States
    [EnforcementState.PENDING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
    [EnforcementState.APPROVED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
    [EnforcementState.REJECTED]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200',
    [EnforcementState.EXECUTED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
    [EnforcementState.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200',
    [EnforcementState.FAILED_CRASH]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 animate-pulse',
    [EnforcementState.ROLLED_BACK]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
  };

  const badgeStyle = styles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      badgeStyle,
      className
    )}>
      {status}
    </span>
  );
};
