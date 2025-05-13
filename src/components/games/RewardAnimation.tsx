
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RewardAnimationProps {
  amount: number;
  onFinish: () => void;
}

const RewardAnimation = ({ amount, onFinish }: RewardAnimationProps) => {
  const [showCoins, setShowCoins] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Sequence of animations
    const sequence = () => {
      setTimeout(() => setShowCoins(true), 500);
      setTimeout(() => setShowAmount(true), 1200);
      setTimeout(() => setShowButton(true), 2200);
    };
    
    sequence();
  }, []);

  // Generate random positions for coins
  const coinPositions = Array.from({ length: 12 }).map(() => ({
    x: Math.random() * 300 - 150,
    y: Math.random() * 200 - 250,
    scale: 0.5 + Math.random() * 0.5,
    duration: 0.7 + Math.random() * 0.5,
  }));

  return (
    <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
      {showCoins && (
        <>
          {coinPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute z-10 w-10 h-10 rounded-full bg-gradient-to-br from-bronze-light to-bronze-dark"
              initial={{ opacity: 0, scale: 0.2, y: 100 }}
              animate={{ 
                opacity: [0, 1, 1, 0.5], 
                scale: [0.2, pos.scale, pos.scale, 0], 
                y: [100, pos.y, pos.y - 50, pos.y - 100],
                x: [0, pos.x, pos.x, pos.x * 1.2]
              }}
              transition={{ duration: pos.duration, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      <div className="z-20">
        {showAmount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 space-y-3"
          >
            <h1 className="text-4xl font-bold">Well Done!</h1>
            <div className="coin text-3xl font-bold">
              +${amount.toFixed(2)}
            </div>
            <p className="text-muted-foreground">
              Added to your wallet
            </p>
          </motion.div>
        )}

        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              onClick={onFinish}
              className="btn-bronze px-8 py-2"
            >
              Continue
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RewardAnimation;
