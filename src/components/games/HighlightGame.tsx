import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Undo, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/UserProvider";

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

      // Show earning feedback
      toast({
        title: `+$${data.rewardPerAction.toFixed(2)}`,
        description: `Polygon drawn`,
        duration: 1500,
      });

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
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <p className="text-lg font-medium">{currentImage.prompt}</p>
        <p className="text-sm text-muted-foreground">
          Click and drag to draw custom shapes around areas you like or dislike. Release to complete.
        </p>
      </div>
      
      {/* Toggle for marker type */}
      <div className="flex bg-muted rounded-full p-1 mb-4">
        <Button
          variant="ghost"
          className={`px-4 rounded-full transition-colors ${
            selectedMarkerType === 'like' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setSelectedMarkerType('like')}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Like
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-full transition-colors ${
            selectedMarkerType === 'dislike' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setSelectedMarkerType('dislike')}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Dislike
        </Button>
      </div>

      {/* Drawing controls */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={polygons.length === 0 || isDrawing}
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={polygons.length === 0 || isDrawing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
      
      {/* Image with canvas overlay */}
      <div 
        ref={containerRef}
        className="w-full relative rounded-lg overflow-hidden border border-border mb-4"
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
      
      <div className="flex justify-between w-full">
        <div className="text-sm text-muted-foreground">
          {polygons.length} shape{polygons.length !== 1 ? 's' : ''} drawn
          {isDrawing && ' (drawing...)'}
        </div>
        <Button 
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {currentIndex < images.length - 1 ? "Next Image" : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default HighlightGame;
