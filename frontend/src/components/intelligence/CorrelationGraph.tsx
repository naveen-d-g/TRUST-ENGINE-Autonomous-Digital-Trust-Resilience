import { useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { Card } from "../cards/Card"
import { CorrelationData } from "@/types/correlation"
import { Maximize2, Minimize2 } from "lucide-react"

interface GraphNode {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    val?: number;
    color?: string;
}

interface Props {
  data: CorrelationData
}

export const CorrelationGraph = ({ data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ w: 800, h: 400 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
        setDimensions({
            w: containerRef.current.clientWidth,
            h: containerRef.current.clientHeight
        })
    }
  }, [isFullscreen])

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  return (
    <Card 
        className={`relative transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : 'h-[500px]'}`}
    >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
                onClick={toggleFullscreen}
                className="p-2 bg-black/50 rounded hover:bg-black/70 text-white"
            >
                {isFullscreen ? <Minimize2 className="w-5 h-5"/> : <Maximize2 className="w-5 h-5"/>}
            </button>
        </div>
        
        <h3 className="text-white font-bold mb-2 p-2 absolute top-0 left-0 bg-black/20 backdrop-blur rounded">
            Incident Correlation Map
        </h3>

        <div ref={containerRef} className="w-full h-full rounded overflow-hidden">
             <ForceGraph2D
                width={dimensions.w}
                height={dimensions.h}
                graphData={data}
                nodeAutoColorBy="type"
                nodeLabel="name"
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={() => 0.005}
                backgroundColor="#111827"
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const n = node as unknown as GraphNode;
                    const label = n.name;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    if (n.type === 'INCIDENT') ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                    
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.val ? n.val * 2 : 4, 0, 2 * Math.PI, false);
                    ctx.fill();

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = n.color || '#fff';
                    if (n.type === 'INCIDENT') ctx.fillStyle = '#fff';
                    ctx.fillText(label, n.x, n.y);
                }}
             />
        </div>
    </Card>
  )
}
