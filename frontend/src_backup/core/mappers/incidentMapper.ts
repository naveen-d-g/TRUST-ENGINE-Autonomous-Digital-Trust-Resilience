import { IncidentDTO } from "@/types/api"
import { IncidentModel } from "@/types/models"

export const mapIncident = (dto: IncidentDTO): IncidentModel => ({
  id: dto.incident_id,
  severity: dto.severity,
  status: dto.status,
  description: dto.description,
  timestamp: new Date(dto.created_at),
})
