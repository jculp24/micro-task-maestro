
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface LogoItemProps {
  id: string;
  name: string;
  image: string;
  isSorted: boolean;
  sortedBinId?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const LogoItem = ({ 
  id, 
  name, 
  image, 
  isSorted, 
  sortedBinId,
  onDragStart,
  onDragEnd
}: LogoItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // We'll use Framer Motion's own drag handlers instead of our custom hook
  const handleDragStart = () => {
    if (isSorted) return;
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };
  
  const handleDragEnd = (event: any, info: any) => {
    if (isSorted) return;
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
    
    // Here we could add custom logic for detecting which bin the logo was dropped on
    // based on the final position using info.point.x and info.point.y
  };

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
      drag={!isSorted}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: isSorted ? 'default' : 'grab' }}
      // We'll store the logo ID in the data attribute so we can identify it when dropped
      data-logo-id={id}
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
