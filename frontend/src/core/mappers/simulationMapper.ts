// Currently simple, but extensible
export const mapSimulationEvent = (payload: Record<string, unknown>) => {
  return {
    type: payload.type as string,
    timestamp: new Date((payload.timestamp as string | number | Date) || Date.now()),
    data: payload.data
  }
}
