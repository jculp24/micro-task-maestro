import { useState, useCallback, useRef, useEffect } from "react";

interface UseMicroRewardReturn {
  showReward: boolean;
  rewardAmount: number;
  triggerReward: (amount: number) => void;
}

export const useMicroReward = (): UseMicroRewardReturn => {
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sounds/cha-ching.mp3');
    audioRef.current.volume = 0.6;
    
    // Preload the audio
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const triggerReward = useCallback((amount: number) => {
    setRewardAmount(amount);
    setShowReward(true);

    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }

    // Auto-hide after animation completes
    setTimeout(() => {
      setShowReward(false);
    }, 1500);
  }, []);

  return {
    showReward,
    rewardAmount,
    triggerReward,
  };
};
