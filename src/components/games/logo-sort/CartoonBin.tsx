
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CartoonBinProps {
  id: string;
  label: string;
  onDrop: (logoId: string) => void;
}

const CartoonBin = ({ id, label, onDrop }: CartoonBinProps) => {
  const [isOver, setIsOver] = useState(false);
  
  return (
    <div className="flex flex-col items-center">
      {/* Label */}
      <motion.div
        className="font-bold text-bronze mb-2 text-center text-sm"
        animate={isOver ? { scale: 1.1 } : { scale: 1 }}
      >
        {label}
      </motion.div>
      
      {/* Bin visual - larger and more touch-friendly */}
      <motion.div
        className={`w-32 h-32 rounded-xl flex items-center justify-center p-3
          ${isOver ? 'bg-bronze/40 border-bronze' : 'bg-bronze/10 border-bronze/30'}
          border-3 overflow-hidden relative`}
        style={{ zIndex: 0 }}
        animate={isOver ? { 
          scale: 1.1,
          boxShadow: "0 0 20px rgba(205, 127, 50, 0.5)"
        } : { 
          scale: 1,
          boxShadow: "0 0 0px rgba(205, 127, 50, 0)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onHoverStart={() => setIsOver(true)}
        onHoverEnd={() => setIsOver(false)}
        data-bin-id={id}
      >
        {/* Bottom fill indicator */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-bronze/20 rounded-b-xl"></div>
        
        {/* Drop indicator */}
        <div className={`text-bronze text-xs font-medium text-center transition-opacity ${isOver ? 'opacity-100' : 'opacity-0'}`}>
          Drop Here
        </div>
      </motion.div>
    </div>
  );
};

export default CartoonBin;
