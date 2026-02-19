import { create } from "zustand"
import api from "@/services/api"
import { IncidentModel } from "@/types/models"
import { IncidentDTO } from "@/types/api"

// Simple mapper for now, ideally strictly separated
const mapIncident = (dto: IncidentDTO): IncidentModel => ({
  id: dto.incident_id,
  severity: dto.severity,
  status: dto.status,
  description: dto.description,
  timestamp: new Date(dto.created_at),
})

interface IncidentState {
  incidents: IncidentModel[]
  loadIncidents: () => Promise<void>
  updateIncidentStatus: (id: string, status: IncidentModel["status"]) => Promise<void>
}

export const incidentStore = create<IncidentState>((set) => ({
  incidents: [],
  loadIncidents: async () => {
    const { data } = await api.get<IncidentDTO[]>("/incidents")
    set({ incidents: data.map(mapIncident) })
  },
  updateIncidentStatus: async (id, status) => {
    await api.patch(`/incidents/${id}`, { status })
    // Optimistic update
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status } : inc
      ),
    }))
  },
}))
