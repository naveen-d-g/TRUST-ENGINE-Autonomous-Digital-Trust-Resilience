export type Decision = "ALLOW" | "RESTRICT" | "ESCALATE" | "DEMO"

export interface SessionDTO {
  session_id: string
  user_id: string
  ip_address: string
  risk_score: number
  decision: Decision
  timestamp: string
  metadata?: Record<string, any>
}

export interface IncidentDTO {
  incident_id: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status: "OPEN" | "CONTAINED" | "RESOLVED"
  description: string
  created_at: string
}

export interface SocketEvent<T = any> {
  type: "SESSION_UPDATE" | "INCIDENT_UPDATE" | "HEARTBEAT"
  payload: T
}
