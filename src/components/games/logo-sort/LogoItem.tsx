
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDrag } from '@/hooks/use-drag';
import { Check } from 'lucide-react';

interface LogoItemProps {
  id: string;
  name: string;
  image: string;
  isSorted: boolean;
  sortedBinId?: string;
}

const LogoItem = ({ 
  id, 
  name, 
  image, 
  isSorted, 
  sortedBinId 
}: LogoItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom hook to handle drag functionality
  const { dragProps } = useDrag({
    id,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
    disabled: isSorted
  });

  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden border-2 ${
        isDragging 
          ? 'border-bronze shadow-lg z-10' 
          : isSorted 
            ? 'border-bronze/50 opacity-50' 
            : 'border-transparent hover:border-bronze/30'
      } transition-all`}
      whileTap={{ scale: isSorted ? 1 : 0.95 }}
      {...dragProps}
    >
      <div className="aspect-square relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain p-2" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium p-1 opacity-0 hover:opacity-100 transition-opacity">
          {name}
        </div>
      </div>
      
      {isSorted && (
        <div className="absolute top-0 right-0 bg-bronze rounded-bl-lg p-1">
          <Check size={16} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default LogoItem;
