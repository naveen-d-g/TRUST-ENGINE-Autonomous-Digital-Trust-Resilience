import { isFeatureEnabled } from "@/core/featureFlags"
import { motion } from "@/theme/motion"

interface Props {
  data: { region: string; risk: number }[]
}

export const ThreatHeatmap = ({ data }: Props) => {
  if (!isFeatureEnabled("ENABLE_HEATMAP")) return null

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${motion.animations.fadeIn}`}>
      {data.map((item) => (
        <div
          key={item.region}
          className="p-4 rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-105 border border-transparent hover:border-neonRed/50"
          style={{
            backgroundColor: `rgba(239, 68, 68, ${item.risk / 100})`, // Red scale based on risk
          }}
        >
          <span className="font-bold text-white text-lg drop-shadow-md">{item.region}</span>
          <span className="text-xs font-mono text-gray-100 mt-1 bg-black/40 px-2 py-0.5 rounded">Risk: {item.risk}%</span>
        </div>
      ))}
    </div>
  )
}
