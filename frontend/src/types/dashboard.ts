export interface DashboardMetrics {
  global_trust_score: number
  active_sessions: number
  critical_incidents: number
  attack_ratio: number
  decision_distribution: {
    trusted: number
    suspicious: number
    malicious: number
  }
  domain_risk: {
    web: number
    api: number
    network: number
    infra: number
  }
  risk_velocity: {
    timestamp: string
    value: number
  }[]
}
