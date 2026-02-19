import { SessionDTO } from "@/types/api"
import { SessionModel } from "@/types/models"

export const mapSession = (dto: SessionDTO): SessionModel => ({
  id: dto.session_id,
  userId: dto.user_id,
  ip: dto.ip_address,
  score: dto.risk_score,
  decision: dto.decision,
  time: new Date(dto.timestamp),
  details: dto.metadata,
})
