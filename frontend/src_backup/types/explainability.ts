export interface MLExplanation {
  risk_score: number
  decision: "TRUSTED" | "SUSPICIOUS" | "MALICIOUS"
  feature_importance: {
    feature: string
    weight: number
  }[]
  anomaly_flags: string[]
  llm_advisory?: {
    recommendation: string
    confidence: number
  }
}
