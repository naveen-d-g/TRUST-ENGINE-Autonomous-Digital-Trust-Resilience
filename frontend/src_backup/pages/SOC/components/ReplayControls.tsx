
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, RotateCcw } from 'lucide-react';

interface ReplayControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  currentFrameIndex: number;
  totalFrames: number;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSpeedChange: () => void;
  onExit: () => void;
  onScrub: (index: number) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  isPlaying,
  playbackSpeed,
  currentFrameIndex,
  totalFrames,
  onPlayPause,
  onStepBack,
  onStepForward,
  onSpeedChange,
  onExit,
  onScrub
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t border-border p-4 z-50 animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto space-y-2">
        
        {/* Scrubber */}
        <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground w-12">{currentFrameIndex} / {totalFrames}</span>
            <input 
                type="range" 
                min={0} 
                max={totalFrames - 1} 
                value={currentFrameIndex} 
                onChange={(e) => onScrub(parseInt(e.target.value))}
                className="flex-1"
            />
            <span className="text-xs font-mono text-primary font-bold">REPLAY MODE</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-center items-center gap-6">
            <button onClick={onExit} className="absolute left-4 text-xs hover:text-red-500 font-mono flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> EXIT REPLAY
            </button>

            <div className="flex items-center gap-2">
                <button onClick={onStepBack} className="p-2 hover:bg-muted rounded-full">
                    <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={onPlayPause} 
                  className="p-3 bg-primary text-primary-foreground rounded-full hover:scale-105 transition-transform"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button onClick={onStepForward} className="p-2 hover:bg-muted rounded-full">
                    <SkipForward className="w-4 h-4" />
                </button>
            </div>

            <button onClick={onSpeedChange} className="px-2 py-1 rounded hover:bg-muted text-xs font-mono w-12">
                {playbackSpeed}x
            </button>
        </div>
      </div>
    </div>
  );
};
