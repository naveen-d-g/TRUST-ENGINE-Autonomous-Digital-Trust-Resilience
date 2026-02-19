
export type LiveStatus = 'idle' | 'loading' | 'live' | 'stale' | 'error';

export interface LiveState<T> {
  data: T | null;
  status: LiveStatus;
  lastUpdated: number;
  delta?: number; // Optional numerical change since last update
  error?: Error | null;
}

export const initialLiveState: LiveState<any> = {
    data: null,
    status: 'idle',
    lastUpdated: 0
};
