export interface SessionModel {
  session_id: string
  user_id: string
  risk_score: number
  label: "TRUSTED" | "SUSPICIOUS" | "MALICIOUS"
  event_count: number
  first_seen: string
  last_seen: string
  decision?: "ALLOW" | "RESTRICT" | "ESCALATE" // Keep for compatibility if needed
}

export interface IncidentModel {
  incident_id: string
  session_id: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status: "OPEN" | "CONTAINED" | "RECOVERING" | "RESOLVED"
  created_at: string
  description?: string // Optional extra
}
