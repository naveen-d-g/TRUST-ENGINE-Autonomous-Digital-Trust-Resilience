import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/audit.api';
import { SeverityBadge } from '../../components/badges/SeverityBadge';
import { Shield, Terminal } from 'lucide-react';

export const AuditLog: React.FC = () => {
    // Only fetch on mount, or poll slowly
  const { data: logs, isLoading } = useQuery({
      queryKey: ['soc', 'audit'],
      queryFn: auditApi.getAll,
      refetchInterval: 10000 
  });

  if (isLoading) return <div className="p-8">Loading Audit Stream...</div>;
  
  const safeLogs = logs || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Shield className="w-6 h-6 mr-2 text-primary" />
            Audit Log
        </h1>
        <div className="text-sm text-muted-foreground">
          Immutable Ledger • {safeLogs.length} Entries
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {safeLogs.map((log) => (
              <tr key={log.event_id} className="hover:bg-muted/50 transition-colors font-mono text-xs">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{log.timestamp}</td>
                <td className="px-4 py-3 font-semibold text-primary">{log.actor}</td>
                <td className="px-4 py-3">
                    <span className="font-bold">{log.action}</span>
                </td>
                <td className="px-4 py-3">{log.target}</td>
                <td className="px-4 py-3">
                   <SeverityBadge severity={log.severity} className="scale-90 origin-left" />
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-md truncate" title={log.details}>
                    {log.details}
                </td>
              </tr>
            ))}
            {safeLogs.length === 0 && (
              <tr>
                 <td colSpan={6}>
                    <div className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                        <Terminal className="w-8 h-8 mb-2 opacity-50" />
                        No audit records found.
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
