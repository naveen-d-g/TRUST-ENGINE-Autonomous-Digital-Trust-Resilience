import { IncidentDTO } from "@/types/api"
import { mapIncident } from "@/core/mappers/incidentMapper"
// import { incidentStore } from "@/store/incidentStore"

export const handleIncidentUpdate = (payload: IncidentDTO) => {
  const model = mapIncident(payload)
  console.log("Processed Incident Update:", model)
  // incidentStore.getState().updateIncident(model) // If store had update method
}
