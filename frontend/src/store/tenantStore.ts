import { create } from 'zustand';

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  
  // Actions
  setTenant: (tenantId: string, tenantName: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null,
  tenantName: null,

  setTenant: (tenantId: string, tenantName: string) => {
    set({ tenantId, tenantName });
  },

  clearTenant: () => {
    set({ tenantId: null, tenantName: null });
  },
}));

// Set up API service callback for tenant header
import { api } from '../services/api';
api.setTenantGetter(() => useTenantStore.getState().tenantId);
