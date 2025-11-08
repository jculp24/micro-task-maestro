import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface MicroRewardAnimationProps {
  show: boolean;
  amount: number;
  onComplete?: () => void;
}

const MicroRewardAnimation = ({ show, amount, onComplete }: MicroRewardAnimationProps) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  // Generate 6 coins with random positions
  const coinPositions = Array.from({ length: 6 }).map((_, i) => ({
    x: (Math.random() - 0.5) * 150,
    y: -50 - Math.random() * 50,
    delay: i * 0.05,
    scale: 0.6 + Math.random() * 0.4,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          
          {/* Coin burst */}
          <div className="relative">
            {coinPositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-bronze-light to-bronze-dark shadow-lg"
                initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, pos.scale, pos.scale, 0],
                  x: [0, pos.x],
                  y: [0, pos.y],
                }}
                transition={{
                  duration: 0.8,
                  delay: pos.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Amount text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 1],
              y: [0, 0, 0, -20],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.2, 0.53, 1],
              ease: "easeOut",
            }}
            className="relative z-10"
          >
            <div className="text-5xl font-bold coin drop-shadow-2xl">
              +${amount.toFixed(2)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MicroRewardAnimation;
