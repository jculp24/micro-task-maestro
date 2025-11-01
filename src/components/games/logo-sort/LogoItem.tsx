
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
  onDragEnd?: (info: any) => void;
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
  
  const handleDragStart = (event: any, info: any) => {
    if (isSorted) return;
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };
  
  const handleDragEnd = (event: any, info: any) => {
    if (isSorted) return;
    setIsDragging(false);
    if (onDragEnd) onDragEnd(info);
  };

  // Don't render if already sorted
  if (isSorted) {
    return null;
  }

  return (
    <motion.div
      className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-bronze/30 bg-background"
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ 
        scale: 1.15, 
        rotate: 3,
        zIndex: 100,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        cursor: "grabbing"
      }}
      drag={true}
      dragSnapToOrigin={true}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: 'grab', zIndex: isDragging ? 100 : 1 }}
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
    </motion.div>
  );
};

export default LogoItem;
