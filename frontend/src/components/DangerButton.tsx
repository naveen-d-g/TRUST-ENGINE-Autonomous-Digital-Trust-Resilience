import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DangerButtonProps {
    actionName: string;
    onConfirm: () => void;
    isLoading?: boolean;
    blastRadius?: string; // Description of impact
    disabled?: boolean;
    className?: string;
}

export const DangerButton: React.FC<DangerButtonProps> = ({
    actionName,
    onConfirm,
    isLoading,
    blastRadius = "This action cannot be undone.",
    disabled,
    className
}) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleInitialClick = () => {
        if (!disabled && !isLoading) setShowConfirm(true);
    };

    const handleConfirm = () => {
        setShowConfirm(false);
        onConfirm();
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                onClick={handleInitialClick}
                disabled={disabled || isLoading}
                className={`relative px-4 py-2 rounded-md font-medium text-sm transition-colors
                    ${disabled 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20'}
                    ${className}`}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </span>
                ) : (
                    actionName
                )}
            </motion.button>

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-card border border-destructive/50 rounded-lg shadow-lg overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-destructive mb-4">
                                    <div className="p-2 bg-destructive/10 rounded-full">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Confirm Action</h3>
                                </div>
                                
                                <p className="text-foreground font-medium mb-1">
                                    Are you sure you want to <strong>{actionName}</strong>?
                                </p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {blastRadius}
                                </p>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors shadow-sm"
                                    >
                                        Confirm Execution
                                    </button>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-destructive/20">
                                <motion.div 
                                    className="h-full bg-destructive"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
