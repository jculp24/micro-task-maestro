import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import LogoItem from './logo-sort/LogoItem';
import CartoonBin from './logo-sort/CartoonBin';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMicroReward } from "@/hooks/useMicroReward";
import MicroRewardAnimation from "./MicroRewardAnimation";

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
  const [logos, setLogos] = useState<Logo[]>(data?.logos || []);
  const [bins, setBins] = useState<Bin[]>(data?.bins || []);
  const [sortedLogos, setSortedLogos] = useState<Record<string, string>>({});
  const [activeDragLogo, setActiveDragLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const { showReward, rewardAmount, triggerReward } = useMicroReward();

  // Check if enough logos have been sorted
  const sortedCount = Object.keys(sortedLogos).length;
  const minSortedRequired = Math.min(10, logos.length);
  const canSubmit = sortedCount >= minSortedRequired;
  
  // Handle drag start
  const handleDragStart = (logoId: string) => {
    setActiveDragLogo(logoId);
  };
  
  // Handle drag end - check if logo is over a bin using Framer Motion's info
  const handleDragEnd = (logoId: string, info: any) => {
    if (!activeDragLogo) {
      setActiveDragLogo(null);
      return;
    }
    
    // Get the drag end position from Framer Motion
    const { point } = info;
    
    // Get all bin elements
    const binElements = document.querySelectorAll('[data-bin-id]');
    
    // Check if the logo was dropped on a bin
    for (const binElement of binElements) {
      const rect = binElement.getBoundingClientRect();
      
      // Check if the drop position is inside the bin's rectangle
      if (
        point.x >= rect.left && 
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      ) {
        // Found a bin that the logo was dropped on
        const binId = binElement.getAttribute('data-bin-id');
        if (binId) {
          handleDrop(logoId, binId);
          setActiveDragLogo(null);
          return;
        }
      }
    }
    
    setActiveDragLogo(null);
  };

  // Handle logo drop into bin
  const handleDrop = async (logoId: string, binId: string) => {
    // Play haptic feedback simulation (we'll use visual feedback for now)
    setSortedLogos((prev) => ({
      ...prev,
      [logoId]: binId,
    }));

    // Record response immediately
    try {
      const logo = logos.find(l => l.id === logoId);
      const bin = bins.find(b => b.id === binId);
      
      const { error } = await supabase.functions.invoke('record-response', {
        body: {
          game_type: 'logosort',
          action_type: 'sort_logo',
          response_data: { 
            logo_id: logoId,
            logo_name: logo?.name,
            bin_id: binId,
            bin_label: bin?.label
          },
          reward_amount: data.rewardPerAction
        }
      });

      if (error) throw error;

      // Show micro-reward animation
      triggerReward(data.rewardPerAction);

      // Report progress
      onProgress();
    } catch (error) {
      console.error('Error recording response:', error);
    }
  };

  // Submit results (no additional payment needed since each sort already paid)
  const handleSubmit = () => {
    // Just navigate away - no additional payment
    toast({
      title: "Game completed!",
      description: `You sorted ${sortedCount} logos`,
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <MicroRewardAnimation show={showReward} amount={rewardAmount} />
      {/* Progress */}
      <div className="bg-bronze/10 rounded-lg p-2 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium">Sorted</span>
        <span className="text-lg font-bold text-bronze">
          {sortedCount} / {minSortedRequired}
        </span>
      </div>

      {/* Bins */}
      <div className="flex justify-around mb-4">
        {bins.map((bin) => (
          <CartoonBin 
            key={bin.id} 
            id={bin.id} 
            label={bin.label} 
            onDrop={(logoId) => handleDrop(logoId, bin.id)}
          />
        ))}
      </div>

      {/* Logos */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {logos.map((logo) => {
            const isSorted = sortedLogos[logo.id] !== undefined;
            return (
              <LogoItem 
                key={logo.id}
                id={logo.id}
                name={logo.name}
                image={logo.image}
                isSorted={isSorted}
                sortedBinId={sortedLogos[logo.id]}
                onDragStart={() => handleDragStart(logo.id)}
                onDragEnd={(info) => handleDragEnd(logo.id, info)}
              />
            );
          })}
        </div>
      </div>

      {/* Submit button */}
      <Button 
        className="mt-4 border-bronze text-bronze hover:bg-bronze hover:text-white"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Complete ({sortedCount}/{minSortedRequired} sorted)
        {canSubmit && <Check size={16} className="ml-1" />}
      </Button>
    </div>
  );
};

export default LogoSortGame;
