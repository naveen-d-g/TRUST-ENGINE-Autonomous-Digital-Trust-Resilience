import { create } from 'zustand';

interface LiveStoreState {
    systemStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    lastHeartbeat: number;
    tenantId: string;
    setTenantId: (id: string) => void;
    pulse: () => void;
}

export const useLiveStore = create<LiveStoreState>((set) => ({
    systemStatus: 'ONLINE',
    lastHeartbeat: Date.now(),
    tenantId: 'tenant-1', // Default
    setTenantId: (id) => set({ tenantId: id }),
    pulse: () => set({ lastHeartbeat: Date.now() })
}));
