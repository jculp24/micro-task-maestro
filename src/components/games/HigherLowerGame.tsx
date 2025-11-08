
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HigherLowerGameProps {
  data: any;
  onProgress: () => void;
}

const HigherLowerGame = ({ data, onProgress }: HigherLowerGameProps) => {
  const products = data?.products || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showActualPrice, setShowActualPrice] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<'higher' | 'lower' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Get current product
  const currentProduct = products[currentIndex];
  
  const handleGuess = async (guess: 'higher' | 'lower') => {
    setSelectedGuess(guess);
    
    // Check if guess is correct
    const actualPrice = currentProduct.actualPrice;
    const displayPrice = currentProduct.displayPrice;
    
    const isGuessCorrect = guess === 'higher' 
      ? actualPrice > displayPrice
      : actualPrice < displayPrice;
      
    setIsCorrect(isGuessCorrect);
    
    // Show the actual price
    setShowActualPrice(true);

    // Record response immediately
    try {
      const { error } = await supabase.functions.invoke('record-response', {
        body: {
          game_type: 'higherlower',
          action_type: `guess_${guess}`,
          response_data: { 
            product_id: currentProduct.id,
            product_name: currentProduct.name,
            guess,
            correct: isGuessCorrect,
            display_price: displayPrice,
            actual_price: actualPrice
          },
          reward_amount: data.rewardPerAction
        }
      });

      if (error) throw error;

      // Show earning feedback
      toast({
        title: `+$${data.rewardPerAction.toFixed(2)}`,
        description: isGuessCorrect ? 'Correct guess!' : 'Nice try!',
        duration: 2000,
      });

      // Report progress
      onProgress();
    } catch (error) {
      console.error('Error recording response:', error);
    }
    
    // Move to next product after a delay
    setTimeout(() => {
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedGuess(null);
        setShowActualPrice(false);
        setIsCorrect(null);
      }
    }, 2000);
  };
  
  if (!currentProduct) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No products to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full">
      {/* Product card */}
      <div className="w-full bg-card rounded-lg overflow-hidden border border-border mb-4 flex-1 flex flex-col">
        <div className="h-[70vh] overflow-hidden relative flex-1">
          <img 
            src={currentProduct.image} 
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
          
          {/* Product name overlay */}
          <div className="absolute top-0 left-0 bg-background/80 backdrop-blur-sm px-3 py-2 m-4 rounded-md">
            <h3 className="font-semibold text-sm">{currentProduct.name}</h3>
          </div>
          
          {/* Price tag */}
          <div className="absolute bottom-0 right-0 bg-background/80 backdrop-blur-sm px-3 py-2 m-4 rounded-md">
            <div className="flex flex-col items-end">
              {showActualPrice && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-semibold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                >
                  ${currentProduct.actualPrice.toFixed(2)}
                </motion.div>
              )}
              <div className={showActualPrice ? 'text-sm line-through opacity-75' : 'font-bold'}>
                ${currentProduct.displayPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Guess buttons */}
      <div className="flex gap-4 w-full max-w-xs">
        <Button
          className={`flex-1 flex items-center justify-center gap-2 py-6 bg-red-500 hover:bg-red-600 text-white border-0
                     ${selectedGuess !== null ? 'opacity-50 cursor-not-allowed' : ''}
                     ${showActualPrice && selectedGuess === 'lower' 
                       ? isCorrect ? 'ring-2 ring-green-500' : 'ring-2 ring-red-700'
                       : ''
                     }`}
          onClick={() => selectedGuess === null && handleGuess('lower')}
          disabled={selectedGuess !== null}
        >
          <ArrowDown className="h-5 w-5" />
          <span className="font-medium">Lower</span>
        </Button>
        
        <Button
          className={`flex-1 flex items-center justify-center gap-2 py-6 bg-green-500 hover:bg-green-600 text-white border-0
                     ${selectedGuess !== null ? 'opacity-50 cursor-not-allowed' : ''}
                     ${showActualPrice && selectedGuess === 'higher' 
                       ? isCorrect ? 'ring-2 ring-green-500' : 'ring-2 ring-red-700'
                       : ''
                     }`}
          onClick={() => selectedGuess === null && handleGuess('higher')}
          disabled={selectedGuess !== null}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="font-medium">Higher</span>
        </Button>
      </div>
    </div>
  );
};

export default HigherLowerGame;
