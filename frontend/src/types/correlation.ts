export interface CorrelationNode {
  id: string
  name: string
  type: "SESSION" | "IP" | "USER" | "INCIDENT"
  val: number
}

export interface CorrelationEdge {
  source: string
  target: string
}

export interface CorrelationData {
    nodes: CorrelationNode[]
    links: CorrelationEdge[]
}
