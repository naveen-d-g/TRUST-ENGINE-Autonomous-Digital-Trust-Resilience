export type AsyncStatus = "idle" | "loading" | "success" | "error"

export interface AsyncState<T> {
  data: T | null
  status: AsyncStatus
  error: string | null
}

export const createAsyncSlice = (set: (state: Partial<AsyncState<unknown>> | ((state: AsyncState<unknown>) => Partial<AsyncState<unknown>>)) => void) => ({
  status: "idle" as AsyncStatus,
  error: null as string | null,
  setLoading: () => set({ status: "loading", error: null }),
  setSuccess: () => set({ status: "success", error: null }),
  setError: (error: string) => set({ status: "error", error }),
  reset: () => set({ status: "idle", error: null }),
})
