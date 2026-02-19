import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"

export const severity = {
  CRITICAL: {
    color: "text-neonRed",
    bg: "bg-neonRed/10",
    border: "border-neonRed",
    icon: XCircle,
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.5)]",
  },
  HIGH: {
    color: "text-neonOrange",
    bg: "bg-neonOrange/10",
    border: "border-neonOrange",
    icon: AlertTriangle,
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]",
  },
  MEDIUM: {
    color: "text-neonYellow",
    bg: "bg-neonYellow/10",
    border: "border-neonYellow",
    icon: AlertTriangle,
    glow: "shadow-[0_0_5px_rgba(234,179,8,0.5)]",
  },
  LOW: {
    color: "text-neonBlue",
    bg: "bg-neonBlue/10",
    border: "border-neonBlue",
    icon: Info,
    glow: "shadow-[0_0_5px_rgba(59,130,246,0.5)]",
  },
  INFO: {
    color: "text-gray-400",
    bg: "bg-gray-800",
    border: "border-gray-700",
    icon: Info,
    glow: "",
  },
}

export const getSeverityConfig = (level: string) => {
  const normalized = level.toUpperCase() as SeverityLevel
  return severity[normalized] || severity.INFO
}
