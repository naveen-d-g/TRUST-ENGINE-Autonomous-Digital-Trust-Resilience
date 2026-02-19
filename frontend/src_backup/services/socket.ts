import { io, Socket } from "socket.io-client"
import { ENV } from "@/core/config/env"
import { eventBus } from "./eventBus"
import { authStore } from "@/store/authStore"
import { useTenantStore } from "@/store/tenantStore"

class SocketService {
  public socket: Socket | null = null

  connect() {
    if (this.socket?.connected) return

    const token = authStore.getState().token
    const tenantId = useTenantStore.getState().currentTenantId
    const role = authStore.getState().role

    this.socket = io(ENV.API_BASE || "http://127.0.0.1:5000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      autoConnect: true,
      auth: { token },
      query: { tenantId, role }
    })

    this.socket.on("connect", () => {
      console.log("Socket.IO connected")
    })

    this.socket.on("disconnect", () => {
      console.log("Socket.IO disconnected")
    })

    this.socket.on("connect_error", (err) => {
      if (err.message === "xhr poll error" || err.message === "unauthorized") { // Simplified check
          console.error("Socket auth error", err)
          // authStore.getState().logout() // Optional: force logout on socket auth fail
      }
    })

    // Bind core events and pipe to EventBus
    this.socket.on("dashboard_update", (data) => {
      eventBus.emit("dashboard_update", data)
    })

    this.socket.on("session_update", (data) => {
      eventBus.emit("session_update", data)
    })

    this.socket.on("incident_update", (data) => {
      eventBus.emit("incident_update", data)
    })

    this.socket.on("simulation_event", (data) => {
      eventBus.emit("simulation_event", data)
    })
  }
  
  // Keep allow direct access if needed, but prefer EventBus
  getSocket() {
    return this.socket
  }
}

export const socketService = new SocketService()
export default socketService
