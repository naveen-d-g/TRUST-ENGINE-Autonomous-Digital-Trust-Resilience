import { ReactNode } from 'react';

export interface LiveContextType {
    events: any[];
    stats: { active_sessions: number };
    alert: any;
    error: any;
    isConnected: boolean;
    isPaused: boolean;
    togglePause: () => void;
    clearEvents: () => void;
    reconnect: () => void;
}

export const LiveProvider: ({ children }: { children: ReactNode }) => JSX.Element;
export const useLiveContext: () => LiveContextType;
