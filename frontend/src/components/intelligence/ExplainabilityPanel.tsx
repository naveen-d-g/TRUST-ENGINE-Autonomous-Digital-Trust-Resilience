import { MLExplanation } from "@/types/explainability"
import { BrainCircuit, Info } from "lucide-react"

interface Props {
  explanation?: MLExplanation
}

export const ExplainabilityPanel = ({ explanation }: Props) => {
  if (!explanation) return null

  return (
    <div className="bg-bgCard/50 border border-gray-700 p-6 rounded-2xl shadow-lg space-y-4">
      <div className="flex items-center gap-2 text-neonPurple">
          <BrainCircuit className="w-5 h-5" />
          <h2 className="text-lg font-semibold tracking-wide">ML Model Explainability</h2>
      </div>

      <div className="flex items-center gap-6 p-4 bg-bgSecondary rounded-lg">
        <div>
           <div className="text-gray-400 text-xs uppercase">Risk Score</div>
           <div className={`text-2xl font-bold ${
               explanation.risk_score > 80 ? "text-neonGreen" : explanation.risk_score > 50 ? "text-neonOrange" : "text-neonRed"
           }`}>{explanation.risk_score}</div>
        </div>
        <div className="h-8 w-px bg-gray-700"></div>
        <div>
           <div className="text-gray-400 text-xs uppercase">Decision</div>
           <div className="text-white font-mono">{explanation.decision}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-neonBlue" />
            Feature Importance
        </h3>
        <div className="space-y-2">
            {explanation.feature_importance.map((f, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{f.feature}</span>
                <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-neonBlue" 
                            style={{ width: `${Math.min(100, Math.abs(f.weight) * 100)}%` }}
                        ></div>
                    </div>
                    <span className="font-mono text-neonBlue">{f.weight.toFixed(2)}</span>
                </div>
            </div>
            ))}
        </div>
      </div>

      {explanation.llm_advisory && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <p className="text-xs text-neonGreen font-bold uppercase mb-1">LLM Advisory</p>
          <p className="text-sm text-gray-200 leading-relaxed italic">&quot;{explanation.llm_advisory.recommendation}&quot;</p>
          <div className="text-end text-xs text-gray-500 mt-1">Confidence: {(explanation.llm_advisory.confidence * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  )
}
