
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Pause, ThumbsUp, ThumbsDown } from "lucide-react";

interface SoundByteGameProps {
  data: any;
  onProgress: () => void;
}

const SoundByteGame = ({ data, onProgress }: SoundByteGameProps) => {
  const audioClips = data?.audioClips || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [waveformLevel, setWaveformLevel] = useState(0);
  
  // Get current audio clip
  const currentClip = audioClips[currentIndex];
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate audio playback with animated waveform
    if (!isPlaying) {
      // Start animation for waveform
      let level = 0;
      const interval = setInterval(() => {
        level = Math.random() * 100;
        setWaveformLevel(level);
      }, 100);
      
      // Simulate audio duration
      setTimeout(() => {
        clearInterval(interval);
        setIsPlaying(false);
        setWaveformLevel(0);
      }, 3000);
    }
  };
  
  const handleVote = (liked: boolean) => {
    setHasVoted(true);
    
    // Move to next clip after a short delay
    setTimeout(() => {
      if (currentIndex < audioClips.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setHasVoted(false);
      }
      
      // Report progress
      onProgress();
    }, 500);
  };
  
  if (!currentClip) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No audio clips to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <p className="text-lg font-medium">{currentClip.title}</p>
        <p className="text-sm text-muted-foreground">{currentClip.description}</p>
      </div>
      
      {/* Audio player */}
      <div className="w-full bg-card border border-border rounded-xl p-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-bronze"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-bronze" />
            ) : (
              <Play className="h-4 w-4 text-bronze" />
            )}
          </Button>
          
          {/* Audio waveform visualization */}
          <div className="flex-1 h-12 flex items-center gap-0.5">
            {Array.from({ length: 30 }).map((_, i) => {
              // Simulate a waveform with varying heights
              const height = isPlaying
                ? Math.sin((i + waveformLevel) * 0.2) * 50 + 50
                : (i % 3 === 0 ? 70 : i % 2 === 0 ? 40 : 20);
                
              return (
                <motion.div
                  key={i}
                  className="bg-bronze/60 w-1 rounded-full"
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.1 }}
                  style={{ backgroundColor: isPlaying ? '#CF955F' : '#DDB27750' }}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Voting buttons */}
      <div className="flex gap-6 w-full max-w-xs">
        <Button
          variant="outline"
          className={`flex-1 flex flex-col items-center gap-1 h-auto py-3
                     ${hasVoted === false ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => !hasVoted && handleVote(false)}
          disabled={hasVoted}
        >
          <ThumbsDown className="h-6 w-6 text-red-500" />
          <span className="text-sm">Dislike</span>
        </Button>
        
        <Button
          variant="outline"
          className={`flex-1 flex flex-col items-center gap-1 h-auto py-3
                     ${hasVoted === false ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => !hasVoted && handleVote(true)}
          disabled={hasVoted}
        >
          <ThumbsUp className="h-6 w-6 text-green-500" />
          <span className="text-sm">Like</span>
        </Button>
      </div>
    </div>
  );
};

export default SoundByteGame;
