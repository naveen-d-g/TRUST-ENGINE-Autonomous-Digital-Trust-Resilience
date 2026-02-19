export class RealtimeReconciler {
  private processedEventIds = new Set<string>()
  private MAX_HISTORY = 1000

  public shouldProcess(eventId: string): boolean {
    if (this.processedEventIds.has(eventId)) {
      console.warn(`[Reconciler] Duplicate event detected: ${eventId}`)
      return false
    }
    
    this.processedEventIds.add(eventId)
    this.cleanup()
    return true
  }

  private cleanup() {
    if (this.processedEventIds.size > this.MAX_HISTORY) {
      const it = this.processedEventIds.values()
      for (let i = 0; i < 100; i++) {
        const value = it.next().value
        if (value) this.processedEventIds.delete(value)
      }
    }
  }

  public merge<T>(currentState: T, update: Partial<T>): T {
    // Deep merge logic could go here if needed, for now shallow merge matches React pattern
    return { ...currentState, ...update }
  }
}

export const reconciler = new RealtimeReconciler()
