import { useState, useRef } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMicroReward } from "@/hooks/useMicroReward";
import MicroRewardAnimation from "./MicroRewardAnimation";
import { useBasketballGame } from "@/hooks/useBasketballGame";

interface LogoSortProps {
  data: any;
  onProgress: () => void;
}

interface Logo {
  id: string;
  name: string;
  image: string;
}

interface Bin {
  id: string;
  label: string;
}

const LogoSortGame = ({ data, onProgress }: LogoSortProps) => {
  const [logos] = useState<Logo[]>(data?.logos || []);
  const [bins] = useState<Bin[]>(data?.bins || []);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [sortedLogos, setSortedLogos] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { showReward, rewardAmount, triggerReward } = useMicroReward();

  const currentLogo = logos[currentLogoIndex] || null;
  const sortedCount = Object.keys(sortedLogos).length;
  const minSortedRequired = Math.min(10, logos.length);
  const canSubmit = sortedCount >= minSortedRequired;

  const handleScore = async (logoId: string, binId: string, binLabel: string, basketSide: 'left' | 'right') => {
    setSortedLogos((prev) => ({
      ...prev,
      [logoId]: binId,
    }));

    try {
      const logo = logos.find(l => l.id === logoId);
      
      const { error } = await supabase.functions.invoke('record-response', {
        body: {
          game_type: 'logosort',
          action_type: 'basket_score',
          response_data: { 
            logo_id: logoId,
            logo_name: logo?.name,
            basket_side: basketSide,
            bin_id: binId,
            bin_label: binLabel
          },
          reward_amount: data.rewardPerAction
        }
      });

      if (error) throw error;

      triggerReward(data.rewardPerAction);
      onProgress();

      // Load next logo after delay
      setTimeout(() => {
        if (currentLogoIndex < logos.length - 1) {
          setCurrentLogoIndex(prev => prev + 1);
        }
      }, 500);
    } catch (error) {
      console.error('Error recording response:', error);
    }
  };

  useBasketballGame({
    canvasRef,
    currentLogo,
    bins,
    onScore: handleScore
  });

  const handleSubmit = () => {
    toast({
      title: "Game completed!",
      description: `You sorted ${sortedCount} logos`,
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <MicroRewardAnimation show={showReward} amount={rewardAmount} />
      
      {/* Progress */}
      <div className="bg-bronze/10 rounded-lg p-2 mb-2 flex items-center justify-between shrink-0">
        <span className="text-sm font-medium">Sorted: {sortedCount} / {minSortedRequired}</span>
        {currentLogo && (
          <span className="text-sm font-medium text-muted-foreground truncate ml-2">
            {currentLogo.name}
          </span>
        )}
      </div>

      {/* Basketball Game Canvas */}
      <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden bg-gradient-to-b from-[#8B4513] to-[#654321]">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        />
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-center whitespace-nowrap">
          👈 Swipe to shoot! 👉
        </div>
      </div>

      {/* Submit button */}
      <Button 
        className="mt-2 shrink-0 border-bronze text-bronze hover:bg-bronze hover:text-white"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Complete ({sortedCount}/{minSortedRequired})
        {canSubmit && <Check size={16} className="ml-1" />}
      </Button>
    </div>
  );
};

export default LogoSortGame;
