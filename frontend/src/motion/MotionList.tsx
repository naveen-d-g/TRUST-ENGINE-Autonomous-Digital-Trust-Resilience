import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
    emptyMessage?: string;
}

export function MotionList<T>({ items, renderItem, keyExtractor, className, emptyMessage = "No items" }: MotionListProps<T>) {
    return (
        <div className={className}>
            <AnimatePresence mode='popLayout'>
                {items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-muted-foreground italic"
                    >
                        {emptyMessage}
                    </motion.div>
                )}
                {items.map((item) => (
                    <motion.div
                        key={keyExtractor(item)}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderItem(item)}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
