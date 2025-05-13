
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface HighlightGameProps {
  data: any;
  onProgress: () => void;
}

const HighlightGame = ({ data, onProgress }: HighlightGameProps) => {
  const images = data?.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markers, setMarkers] = useState<Array<{ x: number, y: number, type: 'like' | 'dislike' }>>([]);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarkerType, setSelectedMarkerType] = useState<'like' | 'dislike'>('like');
  
  // Get current image
  const currentImage = images[currentIndex];
  
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    // Get click coordinates relative to the image container
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Add a new marker
    setMarkers([...markers, { x, y, type: selectedMarkerType }]);
  };
  
  const handleNext = () => {
    // Clear markers for the next image
    setMarkers([]);
    
    // Move to the next image or finish
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    // Report progress
    onProgress();
  };
  
  if (!currentImage) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No images to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <p className="text-lg font-medium">{currentImage.prompt}</p>
        <p className="text-sm text-muted-foreground">
          Tap on the image to place markers for what you like or dislike
        </p>
      </div>
      
      {/* Toggle for marker type */}
      <div className="flex bg-muted rounded-full p-1 mb-4">
        <Button
          variant="ghost"
          className={`px-4 rounded-full ${selectedMarkerType === 'like' 
            ? 'bg-white dark:bg-secondary text-bronze' 
            : 'text-muted-foreground'}`}
          onClick={() => setSelectedMarkerType('like')}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Like
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-full ${selectedMarkerType === 'dislike' 
            ? 'bg-white dark:bg-secondary text-bronze' 
            : 'text-muted-foreground'}`}
          onClick={() => setSelectedMarkerType('dislike')}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Dislike
        </Button>
      </div>
      
      {/* Image container */}
      <div 
        ref={imageContainerRef}
        onClick={handleImageClick}
        className="w-full relative rounded-lg overflow-hidden border border-border mb-4 cursor-crosshair"
      >
        <img 
          src={currentImage.image} 
          alt="Highlight this"
          className="w-full object-contain"
        />
        
        {/* Render markers */}
        {markers.map((marker, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute w-6 h-6 rounded-full flex items-center justify-center -ml-3 -mt-3
                       ${marker.type === 'like' 
                         ? 'bg-green-500 text-white' 
                         : 'bg-red-500 text-white'}`}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
            }}
          >
            {marker.type === 'like' ? (
              <ThumbsUp className="h-3 w-3" />
            ) : (
              <ThumbsDown className="h-3 w-3" />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-between w-full">
        <div className="text-sm text-muted-foreground">
          {markers.length} markers placed
        </div>
        <Button 
          onClick={handleNext}
          className="bg-bronze text-white hover:bg-bronze-dark"
        >
          {currentIndex < images.length - 1 ? "Next Image" : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default HighlightGame;
