
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ThisThatGameProps {
  data: any;
  onProgress: () => void;
}

const ThisThatGame = ({ data, onProgress }: ThisThatGameProps) => {
  const comparisons = data?.comparisons || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const { toast } = useToast();
  
  // Get current comparison
  const currentComparison = comparisons[currentIndex % comparisons.length]; // Use modulo to cycle through items
  
  const handleSelect = async (side: 'left' | 'right') => {
    setSelectedSide(side);

    // Record response immediately
    try {
      const selectedOption = side === 'left' ? currentComparison.left : currentComparison.right;
      const { error } = await supabase.functions.invoke('record-response', {
        body: {
          game_type: 'thisthat',
          action_type: `select_${side}`,
          response_data: { 
            comparison_id: currentComparison.id,
            question: currentComparison.question,
            selected_side: side,
            selected_title: selectedOption.title
          },
          reward_amount: data.rewardPerAction
        }
      });

      if (error) throw error;

      // Show earning feedback
      toast({
        title: `+$${data.rewardPerAction.toFixed(2)}`,
        description: `Selected ${selectedOption.title}`,
        duration: 2000,
      });

      // Report progress
      onProgress();
    } catch (error) {
      console.error('Error recording response:', error);
    }
    
    setTimeout(() => {
      // Move to the next comparison (cycling through available comparisons)
      setCurrentIndex(currentIndex + 1);
      setSelectedSide(null);
    }, 500);
  };
  
  if (!currentComparison) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No comparisons to display</p>
      </div>
    );
  }

  const { left, right } = currentComparison;

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-5">
        <p className="text-lg font-medium">{currentComparison.question}</p>
        <p className="text-sm text-muted-foreground mt-1">Tap your preference</p>
        <p className="text-xs text-muted-foreground mt-1">
          Card #{(currentIndex % comparisons.length) + 1} of {comparisons.length}
        </p>
      </div>
      
      <div className="flex justify-between gap-4 w-full">
        {/* Left Option */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            opacity: selectedSide === 'right' ? 0.5 : 1,
            scale: selectedSide === 'left' ? 1.05 : 1
          }}
          onClick={() => handleSelect('left')}
          className="flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer transition-all"
        >
          <div className="aspect-square overflow-hidden">
            <img 
              src={left.image} 
              alt={left.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium">{left.title}</h3>
          </div>
        </motion.div>
        
        {/* Right Option */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            opacity: selectedSide === 'left' ? 0.5 : 1,
            scale: selectedSide === 'right' ? 1.05 : 1
          }}
          onClick={() => handleSelect('right')}
          className="flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer transition-all"
        >
          <div className="aspect-square overflow-hidden">
            <img 
              src={right.image} 
              alt={right.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium">{right.title}</h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThisThatGame;
