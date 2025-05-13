
import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";

interface SwipeGameProps {
  data: any;
  onProgress: () => void;
}

const SwipeGame = ({ data, onProgress }: SwipeGameProps) => {
  const items = data?.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  // Get the current item
  const currentItem = items[currentIndex];
  
  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
  const leftOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped right (like)
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      // Swiped left (dislike)
      handleSwipe("left");
    }
  };

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);
    
    setTimeout(() => {
      // Reset direction and advance to next card
      setDirection(null);
      
      // Move to next item or complete if done
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      
      // Report progress
      onProgress();
      
      // Reset motion values
      x.set(0);
    }, 300);
  };

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-80 relative">
      {/* Indicators */}
      <div className="flex gap-20 absolute top-4 w-full justify-center">
        <motion.div 
          style={{ opacity: leftOpacity }}
          className="flex items-center gap-2 text-red-500 font-medium"
        >
          <X size={20} />
          <span>No</span>
        </motion.div>
        
        <motion.div 
          style={{ opacity: rightOpacity }}
          className="flex items-center gap-2 text-green-500 font-medium"
        >
          <span>Yes</span>
          <Check size={20} />
        </motion.div>
      </div>
      
      {/* Swipe Card */}
      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={direction === "left" 
          ? { x: -300, opacity: 0 }
          : direction === "right"
          ? { x: 300, opacity: 0 }
          : { x: 0 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute w-full max-w-xs bg-card shadow-xl rounded-xl cursor-grab active:cursor-grabbing"
      >
        <div className="aspect-[3/4] w-full overflow-hidden rounded-t-xl">
          <img 
            src={currentItem.image} 
            alt={currentItem.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold">{currentItem.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentItem.description}
          </p>
        </div>
      </motion.div>
      
      {/* Button controls */}
      <div className="absolute bottom-0 flex gap-4">
        <button 
          onClick={() => handleSwipe("left")} 
          className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center
                     hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400"
        >
          <X size={24} />
        </button>
        
        <button 
          onClick={() => handleSwipe("right")} 
          className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center
                     hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400"
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  );
};

export default SwipeGame;
