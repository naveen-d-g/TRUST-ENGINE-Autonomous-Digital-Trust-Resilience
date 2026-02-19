import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  title: string;
  action: 'APPROVE' | 'REJECT';
  isProcessing: boolean;
}

export const JustificationModal: React.FC<JustificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  action,
  isProcessing
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim().length < 20) {
      setError('Justification must be at least 20 characters long.');
      return;
    }
    onConfirm(text);
  };

  const isDestructive = action === 'REJECT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-lg border border-border shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
            <div className="flex items-center space-x-2">
                <AlertTriangle className={clsx("w-5 h-5", isDestructive ? "text-red-500" : "text-amber-500")} />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
           <p className="text-sm text-muted-foreground">
             Please provide a reason for this action. This will be recorded in the immutable audit log.
           </p>
           
           <div className="space-y-2">
               <label className="text-sm font-medium">Justification <span className="text-red-500">*</span></label>
               <textarea 
                  className={clsx(
                      "w-full h-32 p-3 rounded-md bg-muted text-sm focus:outline-none focus:ring-2",
                      error ? "ring-2 ring-red-500" : "focus:ring-primary"
                  )}
                  placeholder="e.g., Confirmed malicious activity pattern matching CVE-2024-XXX..."
                  value={text}
                  onChange={(e) => {
                      setText(e.target.value);
                      if (error) setError('');
                  }}
               />
               {error && <p className="text-xs text-red-500">{error}</p>}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end space-x-3 bg-muted/20">
            <button 
                onClick={onClose} 
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium hover:bg-muted/80 rounded-md transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={clsx(
                    "px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors flex items-center",
                    isDestructive 
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    isProcessing && "opacity-50 cursor-not-allowed"
                )}
            >
                {isProcessing ? 'Processing...' : `Confirm ${action}`}
            </button>
        </div>
      </div>
    </div>
  );
};
