import { useEffect, useRef } from "react"
import { Card } from "@/components/cards/Card"
import clsx from "clsx"

interface EventLog {
  id: string
  time: string
  type: string
  message: string
  variant?: "info" | "warning" | "danger" | "success"
}

interface LiveEventStreamProps {
  events: EventLog[]
  title?: string
}

export const LiveEventStream = ({ events, title = "Live Intelligence Feed" }: LiveEventStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <Card className="h-full flex flex-col p-4 bg-bgSecondary/50 border-l border-gray-800 rounded-none w-full">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h3>
        <div className="flex items-center space-x-2">
           <span className="w-2 h-2 bg-neonGreen rounded-full animate-pulse"></span>
           <span className="text-xs text-neonGreen font-mono">LIVE</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      >
        {events.length === 0 && (
           <div className="text-xs text-gray-600 text-center py-10 font-mono">WAITING FOR TELEMETRY...</div>
        )}
        
        {events.map((event) => (
          <div 
            key={event.id}
            className={clsx(
              "p-3 rounded border-l-2 text-sm font-mono transition-all animate-in slide-in-from-right",
              event.variant === "danger" ? "bg-neonRed/5 border-neonRed text-red-200" :
              event.variant === "warning" ? "bg-neonOrange/5 border-neonOrange text-orange-200" :
              event.variant === "success" ? "bg-neonGreen/5 border-neonGreen text-green-200" :
              "bg-bgCard border-gray-600 text-gray-400"
            )}
          >
            <div className="flex justify-between text-xs opacity-50 mb-1">
              <span>{event.time}</span>
              <span className="uppercase">{event.type}</span>
            </div>
            <div>{event.message}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
