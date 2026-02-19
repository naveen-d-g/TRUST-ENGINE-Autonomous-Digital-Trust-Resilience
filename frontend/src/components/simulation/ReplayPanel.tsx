import { Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { useReplayStore } from "@/store/replayStore"
import { Button } from "../buttons/Button"
import { isFeatureEnabled } from "@/core/featureFlags"

export const ReplayPanel = () => {
  const { isPlaying: playing, currentIndex: index, events, play, pause, next, prev, seek: setIndex, speed, setSpeed } = useReplayStore()

  if (!isFeatureEnabled("ENABLE_REPLAY")) return null
  if (events.length === 0) return null

  return (
    <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg flex items-center gap-4 shadow-lg animate-in slide-in-from-bottom">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={prev} disabled={index === 0}>
            <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant={playing ? "secondary" : "primary"} size="sm" onClick={playing ? pause : play}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={next} disabled={index === events.length - 1}>
            <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1">
          <input 
            type="range" 
            min={0} 
            max={events.length - 1} 
            value={index} 
            onChange={(e) => setIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neonBlue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
              <span>Start</span>
              <span>Event {index + 1} / {events.length}</span>
              <span>End</span>
          </div>
      </div>
    
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <span className="text-xs text-gray-400 font-mono">Speed:</span>
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-gray-800 text-xs rounded px-2 py-1 text-white border border-gray-700"
          >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={200}>5x</option>
          </select>
      </div>
    </div>
  )
}
