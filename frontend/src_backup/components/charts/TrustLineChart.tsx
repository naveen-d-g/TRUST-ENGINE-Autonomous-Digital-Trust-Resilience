import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { chartColors } from "@/theme/chartColors"
import { tokens } from "@/theme/tokens"

interface TrustLineChartProps {
  data: Record<string, unknown>[]
  dataKey?: string
  color?: string
  height?: number
}

export const TrustLineChart = ({ 
  data, 
  dataKey = "score", 
  color = chartColors.allow, 
  height = 300 
}: TrustLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
        <XAxis 
          dataKey="time" 
          stroke={tokens.colors.neonBlue} 
          tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#94a3b8" />
        <Tooltip 
          contentStyle={{ backgroundColor: tokens.colors.bgCard, borderColor: '#334155', color: '#fff' }}
          itemStyle={{ color: color }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: color, stroke: tokens.colors.bgPrimary }} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
