import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import LogoItem from './logo-sort/LogoItem';
import CartoonBin from './logo-sort/CartoonBin';
import { Button } from '@/components/ui/button';

interface LogoSortProps {
  data: any;
  onProgress: () => void;
}

interface Logo {
  id: string;
  name: string;
  image: string;
}

interface Bin {
  id: string;
  label: string;
}

const LogoSortGame = ({ data, onProgress }: LogoSortProps) => {
  const [logos, setLogos] = useState<Logo[]>(data?.logos || []);
  const [bins, setBins] = useState<Bin[]>(data?.bins || []);
  const [sortedLogos, setSortedLogos] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState<number>(20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [activeDragLogo, setActiveDragLogo] = useState<string | null>(null);
  
  // References to bin elements for collision detection
  const binRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Handle timer
  useEffect(() => {
    if (!isTimerRunning) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Check if enough logos have been sorted
  const sortedCount = Object.keys(sortedLogos).length;
  const minSortedRequired = Math.min(10, logos.length); // At least 10 or all logos if less than 10
  const canSubmit = sortedCount >= minSortedRequired || timer === 0;
  
  // Handle drag start
  const handleDragStart = (logoId: string) => {
    setActiveDragLogo(logoId);
  };
  
  // Handle drag end - check if logo is over a bin
  const handleDragEnd = (logoId: string, event: MouseEvent) => {
    if (!activeDragLogo) return;
    
    // Get all bin elements
    const binElements = document.querySelectorAll('[data-bin-id]');
    
    // Check if the logo was dropped on a bin
    for (const binElement of binElements) {
      const rect = binElement.getBoundingClientRect();
      
      // Check if the mouse position is inside the bin's rectangle
      if (
        event.clientX >= rect.left && 
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        // Found a bin that the logo was dropped on
        const binId = binElement.getAttribute('data-bin-id');
        if (binId) {
          handleDrop(logoId, binId);
          break;
        }
      }
    }
    
    setActiveDragLogo(null);
  };

  // Handle logo drop into bin
  const handleDrop = (logoId: string, binId: string) => {
    // Play haptic feedback simulation (we'll use visual feedback for now)
    setSortedLogos((prev) => ({
      ...prev,
      [logoId]: binId,
    }));
  };

  // Submit results
  const handleSubmit = () => {
    // Call onProgress to update game state and trigger reward
    onProgress();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timer */}
      <div className="bg-bronze/10 rounded-lg p-2 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className="text-lg font-bold text-bronze">
          {timer} seconds
        </span>
      </div>

      {/* Bins */}
      <div className="flex justify-around mb-4">
        {bins.map((bin) => (
          <CartoonBin 
            key={bin.id} 
            id={bin.id} 
            label={bin.label} 
            onDrop={(logoId) => handleDrop(logoId, bin.id)}
          />
        ))}
      </div>

      {/* Logos */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {logos.map((logo) => {
            const isSorted = sortedLogos[logo.id] !== undefined;
            return (
              <LogoItem 
                key={logo.id}
                id={logo.id}
                name={logo.name}
                image={logo.image}
                isSorted={isSorted}
                sortedBinId={sortedLogos[logo.id]}
                onDragStart={() => handleDragStart(logo.id)}
                onDragEnd={() => handleDragEnd(logo.id, event as unknown as MouseEvent)}
              />
            );
          })}
        </div>
      </div>

      {/* Submit button */}
      <Button 
        className="mt-4 border-bronze text-bronze hover:bg-bronze hover:text-white"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {timer === 0 ? "Time's Up! Submit" : `Sort ${sortedCount}/${minSortedRequired} Logos`}
        {canSubmit && <Check size={16} className="ml-1" />}
      </Button>
    </div>
  );
};

export default LogoSortGame;
