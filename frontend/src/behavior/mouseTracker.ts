import { api } from "../services/api"

/**
 * Capture and batch mouse movement telemetry for bot detection analysis.
 */
class MouseTracker {
  private events: { x: number; y: number; time: number }[] = []
  private maxEvents = 100
  private interval = 5000 // Send every 5 seconds

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window === "undefined") return

    window.addEventListener("mousemove", (e) => {
      this.events.push({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      })

      if (this.events.length >= this.maxEvents) {
        this.send()
      }
    })

    // Periodic sync
    setInterval(() => {
      if (this.events.length > 5) {
        this.send()
      }
    }, this.interval)
  }

  private async send() {
    const payload = [...this.events]
    this.events = [] // Clear buffer

    try {
      // Send to the new behavior endpoint
      await api.post("/api/v1/behavior/mouse", { events: payload })
    } catch (err) {
      console.error("[MouseTracker] Failed to send behavior telemetry", err)
    }
  }
}

export const mouseTracker = new MouseTracker()
