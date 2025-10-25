import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Undo, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/UserProvider";
import { Canvas as FabricCanvas, Polygon as FabricPolygon, Circle as FabricCircle, Line as FabricLine } from "fabric";

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
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { updateBalance } = useUser();
  
  const currentImage = images[currentIndex];

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    // Wait for image to load
    const initCanvas = () => {
      const fabricCanvas = new FabricCanvas(canvasRef.current!, {
        width: img.offsetWidth,
        height: img.offsetHeight,
        selection: false,
      });

      setCanvas(fabricCanvas);
    };

    if (img.complete) {
      initCanvas();
    } else {
      img.onload = initCanvas;
    }

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [currentImage]);

  // Handle canvas click to add points
  const handleCanvasClick = (e: any) => {
    if (!canvas) return;

    const pointer = canvas.getScenePoint(e.e);
    const newPoint = { x: pointer.x, y: pointer.y };

    // Add point marker
    const circle = new FabricCircle({
      left: newPoint.x,
      top: newPoint.y,
      radius: 4,
      fill: selectedMarkerType === 'like' ? '#22c55e' : '#ef4444',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hoverCursor: 'default',
    });
    canvas.add(circle);

    // Draw line from previous point
    if (currentPoints.length > 0) {
      const prevPoint = currentPoints[currentPoints.length - 1];
      const line = new FabricLine([prevPoint.x, prevPoint.y, newPoint.x, newPoint.y], {
        stroke: selectedMarkerType === 'like' ? '#22c55e' : '#ef4444',
        strokeWidth: 2,
        selectable: false,
        hoverCursor: 'default',
      });
      canvas.add(line);
    }

    setCurrentPoints([...currentPoints, newPoint]);
  };

  // Complete polygon on double click
  const handleCanvasDoubleClick = () => {
    if (currentPoints.length < 3) {
      toast({
        title: "Need more points",
        description: "Draw at least 3 points to create a polygon",
        variant: "destructive",
      });
      return;
    }

    completePolygon();
  };

  const completePolygon = async () => {
    if (!canvas || currentPoints.length < 3) return;

    // Normalize points to percentages
    const normalizedPoints = currentPoints.map(p => ({
      x: (p.x / canvas.width!) * 100,
      y: (p.y / canvas.height!) * 100,
    }));

    // Create final polygon
    const polygon = new FabricPolygon(currentPoints, {
      fill: selectedMarkerType === 'like' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      stroke: selectedMarkerType === 'like' ? '#22c55e' : '#ef4444',
      strokeWidth: 2,
      selectable: false,
      hoverCursor: 'default',
    });

    // Clear temporary markers
    canvas.getObjects().forEach(obj => {
      if (obj instanceof FabricCircle || obj instanceof FabricLine) {
        canvas.remove(obj);
      }
    });

    // Add final polygon
    canvas.add(polygon);

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
    if (!canvas) return;

    if (currentPoints.length > 0) {
      // Remove last point and its line
      const objects = canvas.getObjects();
      const toRemove = objects.slice(-2); // Last circle and line
      toRemove.forEach(obj => canvas.remove(obj));
      setCurrentPoints(currentPoints.slice(0, -1));
    } else if (polygons.length > 0) {
      // Remove last completed polygon
      const objects = canvas.getObjects();
      const lastPolygon = objects[objects.length - 1];
      if (lastPolygon instanceof FabricPolygon) {
        canvas.remove(lastPolygon);
        setPolygons(polygons.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    if (!canvas) return;
    canvas.getObjects().forEach(obj => canvas.remove(obj));
    setPolygons([]);
    setCurrentPoints([]);
  };

  const handleNext = () => {
    // Clear for next image
    if (canvas) {
      canvas.getObjects().forEach(obj => canvas.remove(obj));
    }
    setPolygons([]);
    setCurrentPoints([]);
    
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    onProgress();
  };

  useEffect(() => {
    if (!canvas) return;

    canvas.on('mouse:down', handleCanvasClick);
    canvas.on('mouse:dblclick', handleCanvasDoubleClick);

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
      canvas.off('mouse:dblclick', handleCanvasDoubleClick);
    };
  }, [canvas, currentPoints, selectedMarkerType, polygons]);

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
          Draw polygons on areas you like (green) or dislike (red). Double-click to complete each shape.
        </p>
      </div>
      
      {/* Toggle for marker type */}
      <div className="flex bg-muted rounded-full p-1 mb-4">
        <Button
          variant="ghost"
          className={`px-4 rounded-full ${selectedMarkerType === 'like' 
            ? 'bg-background text-foreground' 
            : 'text-muted-foreground'}`}
          onClick={() => setSelectedMarkerType('like')}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Like
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-full ${selectedMarkerType === 'dislike' 
            ? 'bg-background text-foreground' 
            : 'text-muted-foreground'}`}
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
          disabled={polygons.length === 0 && currentPoints.length === 0}
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={polygons.length === 0 && currentPoints.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={completePolygon}
          disabled={currentPoints.length < 3}
        >
          Complete Shape
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
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
        />
      </div>
      
      <div className="flex justify-between w-full">
        <div className="text-sm text-muted-foreground">
          {polygons.length} polygon{polygons.length !== 1 ? 's' : ''} drawn
          {currentPoints.length > 0 && ` (${currentPoints.length} points in progress)`}
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
