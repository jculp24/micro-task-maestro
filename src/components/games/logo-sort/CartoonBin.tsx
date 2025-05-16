
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CartoonBinProps {
  id: string;
  label: string;
  onDrop: (logoId: string) => void;
}

const CartoonBin = ({ id, label, onDrop }: CartoonBinProps) => {
  const [isOver, setIsOver] = useState(false);
  
  // Pulse animation for the label
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Animated label */}
      <motion.div
        className="font-bold text-bronze mb-2 text-center"
        variants={pulseVariants}
        animate="pulse"
      >
        {label}
      </motion.div>
      
      {/* Bin visual */}
      <motion.div
        className={`w-24 h-24 rounded-lg flex items-center justify-center p-2
          ${isOver ? 'bg-bronze/30 border-bronze' : 'bg-bronze/10 border-bronze/30'}
          border-2 transition-colors overflow-hidden relative`}
        onHoverStart={() => setIsOver(true)}
        onHoverEnd={() => setIsOver(false)}
        data-bin-id={id}
      >
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-bronze/20 rounded-b-lg"></div>
        
        {/* Bin inner content */}
        {isOver && (
          <div className="text-bronze text-xs font-medium text-center">
            Drop Here
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartoonBin;
