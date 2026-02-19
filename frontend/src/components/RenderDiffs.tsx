import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ArrowRight } from 'lucide-react';

interface DiffEntry {
  key: string;
  old_value: unknown;
  new_value: unknown;
  description?: string;
}

interface RenderDiffsProps {
  diffs: DiffEntry[] | Record<string, unknown>;
}

export const RenderDiffs: React.FC<RenderDiffsProps> = ({ diffs }) => {
  // Normalize diffs into an array
  const diffArray = Array.isArray(diffs) 
    ? diffs 
    : Object.entries(diffs).map(([key, val]): DiffEntry => ({
        key,
        old_value: 'N/A',
        new_value: val,
      }));

  return (
    <div className="space-y-3">
      {diffArray.map((diff, idx) => (
        <motion.div
          key={`${diff.key}-${idx}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-background/50 border border-border rounded-md overflow-hidden"
        >
          <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border flex justify-between items-center">
            <span>{diff.key.replace(/_/g, ' ')}</span>
            {diff.description && <span className="normal-case font-normal italic opacity-60">{diff.description}</span>}
          </div>
          
          <div className="p-3 flex items-center gap-4 font-mono text-sm overflow-x-auto">
            <div className="flex-1 min-w-[120px]">
              <div className="text-[10px] text-muted-foreground mb-1 flex items-center">
                <Minus className="w-2.5 h-2.5 mr-1 text-red-500" />
                PREVIOUS
              </div>
              <div className="text-red-500/80 bg-red-500/5 px-2 py-1 rounded border border-red-500/10 truncate">
                {String(diff.old_value)}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            <div className="flex-1 min-w-[120px]">
              <div className="text-[10px] text-muted-foreground mb-1 flex items-center">
                <Plus className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                PROPOSED
              </div>
              <div className="text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 truncate font-bold">
                {String(diff.new_value)}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {diffArray.length === 0 && (
        <div className="text-sm text-muted-foreground italic p-4 text-center border rounded-md border-dashed border-border">
          No configuration changes detected in this proposal.
        </div>
      )}
    </div>
  );
};
