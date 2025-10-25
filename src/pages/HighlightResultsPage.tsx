import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
// @ts-ignore - Fabric.js v5 has complex type definitions
import fabric from "fabric";
import { useToast } from "@/hooks/use-toast";

interface PolygonData {
  points: Array<{ x: number; y: number }>;
  type: 'like' | 'dislike';
  timestamp: number;
}

interface ResponseData {
  image_id: string;
  polygon?: PolygonData;
  polygons?: PolygonData[];
}

const HighlightResultsPage = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResponses: 0,
    likePolygons: 0,
    dislikePolygons: 0,
    totalPolygons: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [canvas, setCanvas] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [imageId]);

  const loadData = async () => {
    try {
      // Fetch image details
      const { data: imageData, error: imageError } = await supabase
        .from('highlight_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (imageError) throw imageError;

      setImageUrl(imageData.image_url);
      setPrompt(imageData.prompt);

      // Fetch all responses for this image
      const { data: responsesData, error: responsesError } = await supabase
        .from('individual_responses')
        .select('response_data, created_at, user_id')
        .eq('game_type', 'highlight')
        .eq('response_data->>image_id', imageId);

      if (responsesError) throw responsesError;

      const allResponses = responsesData.map(r => r.response_data as unknown as ResponseData);
      setResponses(allResponses);

      // Calculate stats
      let likeCount = 0;
      let dislikeCount = 0;
      let totalPolygonCount = 0;

      allResponses.forEach((resp) => {
        // Handle both old single polygon format and new array format
        const polygonArray = resp.polygons || (resp.polygon ? [resp.polygon] : []);
        polygonArray.forEach((poly: PolygonData) => {
          totalPolygonCount++;
          if (poly.type === 'like') likeCount++;
          else dislikeCount++;
        });
      });

      setStats({
        totalResponses: responsesData.length,
        likePolygons: likeCount,
        dislikePolygons: dislikeCount,
        totalPolygons: totalPolygonCount,
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading results",
        description: "Failed to load highlight results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize canvas when image loads
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageUrl) return;

    const img = imageRef.current;

    const initCanvas = () => {
      // @ts-ignore
      const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
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
  }, [imageUrl]);

  // Render polygons when canvas and responses are ready
  useEffect(() => {
    if (!canvas || responses.length === 0) return;

    // Clear existing polygons
    canvas.getObjects().forEach(obj => canvas.remove(obj));

    // Render all polygons
    responses.forEach((response: ResponseData) => {
      // Handle both old single polygon format and new array format
      const polygonArray = response.polygons || (response.polygon ? [response.polygon] : []);
      
      polygonArray.forEach((polygonData: PolygonData) => {
        // Denormalize points from percentages
        const points = polygonData.points.map(p => ({
          x: (p.x / 100) * canvas.width!,
          y: (p.y / 100) * canvas.height!,
        }));

        // @ts-ignore
        const polygon = new fabric.Polygon(points, {
          fill: polygonData.type === 'like' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          stroke: polygonData.type === 'like' ? '#22c55e' : '#ef4444',
          strokeWidth: 1,
          selectable: false,
          hoverCursor: 'default',
        });

        canvas.add(polygon);
      });
    });

    canvas.renderAll();
  }, [canvas, responses]);

  const handleDownload = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = `highlight-results-${imageId}.png`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Downloaded",
      description: "Results image saved to your device",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Results
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Aggregated Feedback Heatmap</CardTitle>
                <p className="text-sm text-muted-foreground">{prompt}</p>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    ref={imageRef}
                    src={imageUrl}
                    alt="Highlight results"
                    className="w-full object-contain"
                  />
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0"
                  />
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 opacity-40 rounded"></div>
                    <span>Liked areas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 opacity-40 rounded"></div>
                    <span>Disliked areas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-3xl font-bold">{stats.totalResponses}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Polygons</p>
                  <p className="text-3xl font-bold">{stats.totalPolygons}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-green-600 font-medium">Likes</span>
                    <span className="text-sm font-bold">{stats.likePolygons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-600 font-medium">Dislikes</span>
                    <span className="text-sm font-bold">{stats.dislikePolygons}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Darker areas indicate more responses. Use this heatmap to identify patterns in user preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightResultsPage;
