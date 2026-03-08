import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { chartColors } from "@/theme/chartColors"
import { colors } from "@/theme/tokens"

interface TrustLineChartProps {
  data: Record<string, unknown>[]
  dataKey?: string
  color?: string
  height?: number
}

export const TrustLineChart = ({ 
  data, 
  dataKey = "score", 
  color = chartColors.decision.allow, 
  height = 300 
}: TrustLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
        <XAxis 
          dataKey="time" 
          stroke={colors.neonBlue} 
          tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} 
          style={{ fontSize: '10px' }}
          label={{ value: 'Timeline', position: 'insideBottomRight', offset: -10, fill: colors.neonBlue, fontSize: 10, fontWeight: 'bold', opacity: 0.8 }}
        />
        <YAxis 
          stroke="#94a3b8" 
          label={{ value: 'Score %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', opacity: 0.8 }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: colors.bgCard, borderColor: '#334155', color: '#fff' }}
          itemStyle={{ color: color }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ r: 3, fill: color, strokeWidth: 0, fillOpacity: 0.8 }}
          activeDot={{ r: 5, fill: color, stroke: colors.bgPrimary, strokeWidth: 2 }} 
        />
        <ReferenceLine 
          y={60} 
          stroke={chartColors.decision.challenge} 
          strokeDasharray="5 5"
          label={{ value: 'RESTRICT', position: 'right', fill: chartColors.decision.challenge, fontSize: 10, fontWeight: 'bold' }} 
        />
        <ReferenceLine 
          y={30} 
          stroke={chartColors.decision.block} 
          strokeDasharray="5 5"
          label={{ value: 'ESCALATE', position: 'right', fill: chartColors.decision.block, fontSize: 10, fontWeight: 'bold' }} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
