import { SocketEvent } from "@/types/api"
import { handleSessionUpdate } from "./sessionHandler"
import { handleIncidentUpdate } from "./incidentHandler"

export const dispatchEvent = (event: SocketEvent) => {
  switch(event.type) {
    case "SESSION_UPDATE":
      handleSessionUpdate(event.payload)
      break
    case "INCIDENT_UPDATE":
      handleIncidentUpdate(event.payload)
      break
    case "HEARTBEAT":
      console.debug("Heartbeat received")
      break
    default:
      console.warn("Unknown event type:", event.type)
  }
}
