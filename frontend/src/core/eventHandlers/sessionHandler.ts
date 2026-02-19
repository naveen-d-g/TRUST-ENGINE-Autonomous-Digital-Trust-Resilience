import { SessionDTO } from "@/types/api"
// import { sessionStore } from "@/store/sessionStore"
import { mapSession } from "@/core/mappers/sessionMapper"

export const handleSessionUpdate = (payload: SessionDTO) => {
  const model = mapSession(payload)
  // Update store directly or via a specific action
  // For now we just log it as the store might be fetching fully
  console.log("Realtime Session Update:", model)
  // In a real app: sessionStore.getState().upsertSession(model)
}
