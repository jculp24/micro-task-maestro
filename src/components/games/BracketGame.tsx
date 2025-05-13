
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BracketGameProps {
  data: any;
  onProgress: () => void;
}

const BracketGame = ({ data, onProgress }: BracketGameProps) => {
  const initialItems = data?.items || [];
  
  // Create initial bracket structure
  const [rounds, setRounds] = useState<any[][]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [winner, setWinner] = useState<any>(null);
  
  // Initialize the bracket when component mounts
  useEffect(() => {
    if (initialItems.length > 0) {
      // Start with the initial items in the first round
      setRounds([initialItems]);
    }
  }, [initialItems]);
  
  const handleSelectWinner = (item: any) => {
    // Add the winner to the next round
    const nextRound = rounds[currentRound + 1] || [];
    const updatedNextRound = [...nextRound, item];
    
    // Update the rounds array
    const updatedRounds = [...rounds];
    updatedRounds[currentRound + 1] = updatedNextRound;
    setRounds(updatedRounds);
    
    // Move to the next match
    if (currentMatch < Math.floor(rounds[currentRound].length / 2) - 1) {
      setCurrentMatch(currentMatch + 1);
    } else {
      // Move to the next round
      if (currentRound + 1 < Math.log2(initialItems.length)) {
        setCurrentRound(currentRound + 1);
        setCurrentMatch(0);
      } else {
        // We have a final winner
        setWinner(item);
      }
    }
    
    // Report progress
    onProgress();
  };
  
  // If no items, show a placeholder
  if (initialItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }
  
  // If we have a winner, show the final result
  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Winner!</div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 mx-auto mb-4 overflow-hidden rounded-xl border-4 border-bronze"
          >
            <img 
              src={winner.image} 
              alt={winner.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h3 className="font-semibold">{winner.title}</h3>
        </div>
      </div>
    );
  }
  
  // Get the current match-up
  const startIdx = currentMatch * 2;
  const itemA = rounds[currentRound][startIdx];
  const itemB = rounds[currentRound][startIdx + 1];
  
  // If we don't have a valid match-up, show a loading state
  if (!itemA || !itemB) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">Loading bracket...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-center mb-4">
        <span className="font-medium">Round {currentRound + 1}</span>
        <span className="text-muted-foreground"> • Match {currentMatch + 1} of {Math.floor(rounds[currentRound].length / 2)}</span>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-lg font-medium">Which do you prefer?</p>
        <p className="text-sm text-muted-foreground">Tap to select the winner</p>
      </div>
      
      <div className="flex justify-between gap-4 w-full">
        {/* Item A */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelectWinner(itemA)}
          className="flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-bronze/50 transition-colors"
        >
          <div className="aspect-square overflow-hidden">
            <img 
              src={itemA.image} 
              alt={itemA.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium">{itemA.title}</h3>
          </div>
        </motion.div>
        
        {/* VS Indicator */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze flex items-center justify-center text-sm font-bold">
            VS
          </div>
        </div>
        
        {/* Item B */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelectWinner(itemB)}
          className="flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-bronze/50 transition-colors"
        >
          <div className="aspect-square overflow-hidden">
            <img 
              src={itemB.image} 
              alt={itemB.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium">{itemB.title}</h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BracketGame;
