import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brush, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/UserProvider";
import { useMicroReward } from "@/hooks/useMicroReward";
import MicroRewardAnimation from "./MicroRewardAnimation";

interface HighlightGameProps {
  data: any;
  onProgress: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface PolygonData {
  points: Point[];
  type: 'like' | 'dislike';
  timestamp: number;
}

const HighlightGame = ({ data, onProgress }: HighlightGameProps) => {
  const images = data?.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState<'like' | 'dislike'>('like');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { updateBalance } = useUser();
  const { showReward, rewardAmount, triggerReward } = useMicroReward();
  
  const currentImage = images[currentIndex];

  // Initialize and draw canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    // Set canvas size to match image
    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;

    // Redraw everything
    drawCanvas();
  }, [polygons, currentPoints, currentImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed polygons
    polygons.forEach((polygon) => {
      if (polygon.points.length < 2) return;

      ctx.beginPath();
      const firstPoint = denormalizePoint(polygon.points[0], canvas.width, canvas.height);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      polygon.points.slice(1).forEach((point) => {
        const denormalized = denormalizePoint(point, canvas.width, canvas.height);
        ctx.lineTo(denormalized.x, denormalized.y);
      });

      ctx.closePath();
      
      // Fill
      ctx.fillStyle = polygon.type === 'like' 
        ? 'rgba(34, 197, 94, 0.4)' 
        : 'rgba(239, 68, 68, 0.4)';
      ctx.fill();

      // Stroke
      ctx.strokeStyle = polygon.type === 'like' ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw current points being drawn
    if (currentPoints.length > 0) {
      const color = selectedMarkerType === 'like' ? '#22c55e' : '#ef4444';

      // Draw lines between points
      if (currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw starting point marker (larger circle)
      if (currentPoints.length > 0) {
        const firstPoint = currentPoints[0];
        ctx.beginPath();
        ctx.arc(firstPoint.x, firstPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  const normalizePoint = (point: Point, width: number, height: number): Point => ({
    x: (point.x / width) * 100,
    y: (point.y / height) * 100,
  });

  const denormalizePoint = (point: Point, width: number, height: number): Point => ({
    x: (point.x / 100) * width,
    y: (point.y / 100) * height,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add point to create smooth continuous line
    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentPoints.length >= 3) {
      completePolygon();
    } else {
      // Not enough points, clear the drawing
      setCurrentPoints([]);
    }
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  const completePolygon = async () => {
    const canvas = canvasRef.current;
    if (!canvas || currentPoints.length < 3) return;

    // Normalize points to percentages
    const normalizedPoints = currentPoints.map(p => 
      normalizePoint(p, canvas.width, canvas.height)
    );

    const newPolygon: PolygonData = {
      points: normalizedPoints,
      type: selectedMarkerType,
      timestamp: Date.now(),
    };

    setPolygons([...polygons, newPolygon]);
    setCurrentPoints([]);

    // Record response immediately for this polygon
    try {
      const { error } = await supabase.functions.invoke('record-response', {
        body: {
          game_type: 'highlight',
          action_type: `draw_polygon_${selectedMarkerType}`,
          response_data: { 
            image_id: currentImage.id,
            polygon: newPolygon
          },
          reward_amount: data.rewardPerAction
        }
      });

      if (error) throw error;

      // Show micro-reward animation
      triggerReward(data.rewardPerAction);

      // Update balance
      updateBalance(data.rewardPerAction);

      // Report progress
      onProgress();
    } catch (error) {
      console.error('Error recording response:', error);
    }
  };

  const handleUndo = () => {
    if (currentPoints.length > 0) {
      // Remove last point
      setCurrentPoints(currentPoints.slice(0, -1));
    } else if (polygons.length > 0) {
      // Remove last completed polygon
      setPolygons(polygons.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPolygons([]);
    setCurrentPoints([]);
  };

  const handleNext = () => {
    // Clear for next image
    setPolygons([]);
    setCurrentPoints([]);
    
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
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
    <div className="flex flex-col items-center max-w-2xl mx-auto px-4">
      <MicroRewardAnimation show={showReward} amount={rewardAmount} />
      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-6">{currentImage.prompt}</h2>
      
      {/* Image with canvas overlay */}
      <div 
        ref={containerRef}
        className="w-full max-w-md relative rounded-xl overflow-hidden mb-6 shadow-lg"
      >
        <img 
          ref={imageRef}
          src={currentImage.image} 
          alt="Highlight this"
          className="w-full object-contain"
          onLoad={() => {
            // Redraw canvas when image loads
            if (canvasRef.current && imageRef.current) {
              canvasRef.current.width = imageRef.current.offsetWidth;
              canvasRef.current.height = imageRef.current.offsetHeight;
              drawCanvas();
            }
          }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      
      {/* Icon Buttons Row */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Like Button */}
        <button
          onClick={() => setSelectedMarkerType('like')}
          disabled={isDrawing}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            selectedMarkerType === 'like'
              ? 'bg-[#22c55e] text-white shadow-lg scale-110'
              : 'bg-white text-[#22c55e] border-2 border-[#22c55e] hover:bg-[#22c55e]/10'
          } disabled:opacity-50`}
        >
          <Brush size={24} />
        </button>

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={polygons.length === 0 || isDrawing}
          className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-30"
        >
          <RotateCcw size={24} />
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => setSelectedMarkerType('dislike')}
          disabled={isDrawing}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            selectedMarkerType === 'dislike'
              ? 'bg-[#ef4444] text-white shadow-lg scale-110'
              : 'bg-white text-[#ef4444] border-2 border-[#ef4444] hover:bg-[#ef4444]/10'
          } disabled:opacity-50`}
        >
          <Brush size={24} />
        </button>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleNext}
        disabled={polygons.length === 0}
        className="w-full max-w-md h-12 text-base font-semibold bg-[#cd7f32] hover:bg-[#b8722d] text-white rounded-lg disabled:opacity-50"
      >
        Submit
      </Button>
    </div>
  );
};

export default HighlightGame;
