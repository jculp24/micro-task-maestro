
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

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
  
  // Get current product
  const currentProduct = products[currentIndex];
  
  const handleGuess = (guess: 'higher' | 'lower') => {
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
    
    // Move to next product after a delay
    setTimeout(() => {
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedGuess(null);
        setShowActualPrice(false);
        setIsCorrect(null);
      }
      
      // Report progress
      onProgress();
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
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <p className="text-lg font-medium">Is the actual price higher or lower?</p>
        <p className="text-sm text-muted-foreground">
          Guess whether the real price is higher or lower than shown
        </p>
      </div>
      
      {/* Product card */}
      <div className="w-full bg-card rounded-lg overflow-hidden border border-border mb-8">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={currentProduct.image} 
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
          
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
        
        <div className="p-4">
          <h3 className="font-semibold">{currentProduct.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentProduct.description}
          </p>
        </div>
      </div>
      
      {/* Guess buttons */}
      <div className="flex gap-4 w-full max-w-xs">
        <Button
          variant="outline"
          className={`flex-1 flex items-center justify-center gap-2 py-6
                     ${selectedGuess !== null ? 'opacity-50 cursor-not-allowed' : ''}
                     ${showActualPrice && selectedGuess === 'higher' 
                       ? isCorrect ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                       : 'border-bronze'
                     }`}
          onClick={() => selectedGuess === null && handleGuess('higher')}
          disabled={selectedGuess !== null}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="font-medium">Higher</span>
        </Button>
        
        <Button
          variant="outline"
          className={`flex-1 flex items-center justify-center gap-2 py-6
                     ${selectedGuess !== null ? 'opacity-50 cursor-not-allowed' : ''}
                     ${showActualPrice && selectedGuess === 'lower' 
                       ? isCorrect ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                       : 'border-bronze'
                     }`}
          onClick={() => selectedGuess === null && handleGuess('lower')}
          disabled={selectedGuess !== null}
        >
          <ArrowDown className="h-5 w-5" />
          <span className="font-medium">Lower</span>
        </Button>
      </div>
    </div>
  );
};

export default HigherLowerGame;
