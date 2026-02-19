import { create } from 'zustand';
import { api } from '../services/api';
import { logger } from '../services/logger';
import { eventBus } from '../services/eventBus';

interface BatchJob {
  id: string;
  file_name: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  total_rows: number;
  processed_rows: number;
  started_at: string;
  completed_at?: string;
  result_hash?: string;
}

interface BatchState {
  currentJob: BatchJob | null;
  loading: boolean;
  error: string | null;
  progress: number;
  
  // Actions
  upload: (file: File) => Promise<string>;
  fetchStatus: (batchId: string) => Promise<void>;
  reset: () => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  currentJob: null,
  loading: false,
  error: null,
  progress: 0,

  upload: async (file: File) => {
    set({ loading: true, error: null, progress: 0 });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<{ batch_id: string; status: string }>(
        '/api/v1/batch/upload', 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const batchId = response.batch_id;
      
      set({ 
        loading: false, 
        currentJob: {
          id: batchId,
          file_name: file.name,
          status: 'PROCESSING',
          total_rows: 0,
          processed_rows: 0,
          started_at: new Date().toISOString()
        }
      });
      
      return batchId;
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Upload failed';
      set({ loading: false, error: msg });
      throw error;
    }
  },

  fetchStatus: async (batchId: string) => {
    try {
      const job = await api.get<BatchJob>(`/api/v1/batch/${batchId}`);
      set({ currentJob: job });
    } catch (error) {
      logger.error('Failed to fetch batch status', error as Error);
    }
  },

  reset: () => set({ currentJob: null, progress: 0, error: null })
}));

// Listen for WebSocket Progress
eventBus.on('batch:progress' as any, (data: any) => {
  const { batch_id, percentage } = data;
  const state = useBatchStore.getState();
  
  if (state.currentJob?.id === batch_id) {
    useBatchStore.setState({ progress: percentage });
  }
});

eventBus.on('batch:completed' as any, (data: any) => {
  const { batch_id, result_hash } = data;
  const state = useBatchStore.getState();
  
  if (state.currentJob?.id === batch_id) {
    useBatchStore.setState({ 
      progress: 100,
      currentJob: { ...state.currentJob, status: 'COMPLETED', result_hash } as BatchJob
    });
    
    // Auto-trigger session refresh if we're in the explorer?
    // useSessionStore.getState().fetch({ decision: 'BATCH' });
  }
});

eventBus.on('batch:failed' as any, (data: any) => {
  const { batch_id, error } = data;
  const state = useBatchStore.getState();
  
  if (state.currentJob?.id === batch_id) {
    useBatchStore.setState({ 
      error: error || 'Processing failed',
      currentJob: { ...state.currentJob, status: 'FAILED' } as BatchJob
    });
  }
});
