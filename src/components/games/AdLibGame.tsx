
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AdLibGameProps {
  data: any;
  onProgress: () => void;
}

const AdLibGame = ({ data, onProgress }: AdLibGameProps) => {
  const { toast } = useToast();
  const templates = data?.templates || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMethod, setInputMethod] = useState<"text" | "voice">("text");
  const [response, setResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current template
  const currentTemplate = templates[currentIndex % templates.length];
  
  // Word counter
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  
  // Parse template to identify blanks
  const promptParts = currentTemplate?.prompt.split('___') || [];
  
  useEffect(() => {
    // Reset states when template changes
    setResponse("");
    setIsRecording(false);
    setRecordingTime(0);
    setSelectedSuggestion(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [currentIndex]);
  
  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Max 20 seconds
          if (prev >= 20) {
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  const startRecording = () => {
    // In a real app, this would use actual browser or native recording APIs
    setIsRecording(true);
    setRecordingTime(0);
    toast({
      title: "Recording started",
      description: "Speak your response clearly (max 20 seconds)"
    });
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    // In a real app, this would process the actual recording
    // For now we just simulate having recorded something
    if (recordingTime > 0) {
      setResponse(`[Voice recording: ${recordingTime} seconds]`);
      toast({
        title: "Recording saved",
        description: `${recordingTime} second recording captured`
      });
    }
  };
  
  const toggleInputMethod = () => {
    if (inputMethod === "text") {
      setInputMethod("voice");
    } else {
      setInputMethod("text");
      if (isRecording) {
        stopRecording();
      }
    }
    setResponse("");
  };
  
  const addSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    const currentText = response.trim();
    setResponse(currentText ? `${currentText} ${suggestion}` : suggestion);
  };
  
  // Calculate payout based on input method and length
  const calculatePayout = () => {
    if (inputMethod === "text") {
      return wordCount <= 25 ? 0.75 : 1.00;
    } else {
      return recordingTime <= 15 ? 1.25 : 1.50;
    }
  };
  
  const handleSubmit = () => {
    if (inputMethod === "text" && wordCount < 10) {
      toast({
        title: "Too short",
        description: "Please provide at least 10 words for your response",
        variant: "destructive"
      });
      return;
    }
    
    if (inputMethod === "voice" && recordingTime < 5) {
      toast({
        title: "Too short",
        description: "Voice response should be at least 5 seconds",
        variant: "destructive"
      });
      return;
    }
    
    // Show success and move to the next template or complete
    const payout = calculatePayout();
    toast({
      title: "Response submitted!",
      description: `Great pitch! You earned $${payout.toFixed(2)}`
    });
    
    // Move to next template or complete
    onProgress();
    if (currentIndex < templates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Start over from the first template
      setCurrentIndex(0);
    }
  };
  
  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-muted-foreground">No templates available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] relative">
      {/* Product/Ad Image */}
      <div className="w-full mb-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
          <img 
            src={currentTemplate.image} 
            alt={currentTemplate.productName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h3 className="font-medium">{currentTemplate.productName}</h3>
            <span className="text-xs text-bronze">{currentTemplate.category}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Template {currentIndex + 1} of {templates.length}
          </span>
        </div>
      </div>
      
      {/* Prompt with blanks highlighted */}
      <div className="mb-4 text-lg">
        {promptParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < promptParts.length - 1 && (
              <span className="inline-block px-1 mx-1 rounded bg-bronze/20 border border-bronze/40 text-bronze">
                blank {index + 1}
              </span>
            )}
          </span>
        ))}
      </div>
      
      {/* Input Method Toggle */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={inputMethod === "text" ? "default" : "outline"} 
          size="sm"
          onClick={() => setInputMethod("text")}
          className={inputMethod === "text" ? "bg-bronze text-white" : ""}
        >
          Text
        </Button>
        <Button
          variant={inputMethod === "voice" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMethod("voice")}
          className={inputMethod === "voice" ? "bg-bronze text-white" : ""}
        >
          Voice ({recordingTime}s)
        </Button>
      </div>
      
      {/* Text Input Method */}
      {inputMethod === "text" && (
        <>
          <Textarea
            placeholder="Type your response here..."
            className="min-h-[100px] resize-none border-bronze/30 focus-visible:ring-bronze"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <div className="flex justify-between text-sm mt-1 text-muted-foreground">
            <span>{wordCount} words</span>
            <span>${wordCount <= 25 ? "0.75" : "1.00"}</span>
          </div>
          
          {/* Word Suggestions */}
          <div className="mt-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Suggestions (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {currentTemplate.suggestions.map((suggestion: string) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => addSuggestion(suggestion)}
                  className={`text-xs px-2 py-1 h-7 ${selectedSuggestion === suggestion ? 'bg-bronze/20 border-bronze' : ''}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Voice Input Method */}
      {inputMethod === "voice" && (
        <div className="flex-1 flex flex-col items-center justify-center mb-4 border rounded-md p-4 bg-card">
          {isRecording ? (
            <>
              <div className="w-full h-20 mb-4 flex items-center justify-center">
                {/* Voice waveform animation */}
                <div className="flex items-center justify-center gap-1 h-16">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-bronze animate-pulse rounded-full"
                      style={{ 
                        height: `${Math.random() * 70 + 20}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-bronze">{recordingTime}s</div>
                <p className="text-sm text-muted-foreground">Recording...</p>
              </div>
              <Button 
                onClick={stopRecording} 
                variant="destructive"
                className="rounded-full w-14 h-14 p-0"
              >
                <MicOff className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                {response ? (
                  <>
                    <Volume2 className="mx-auto h-12 w-12 text-bronze mb-2" />
                    <p className="text-lg">{response}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      ${recordingTime <= 15 ? "1.25" : "1.50"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-1">Tap to start recording</p>
                    <p className="text-sm text-muted-foreground">
                      (5-20 seconds)
                    </p>
                  </>
                )}
              </div>
              <Button 
                onClick={startRecording} 
                variant="outline"
                className="rounded-full w-14 h-14 p-0 border-bronze text-bronze hover:bg-bronze hover:text-white"
              >
                <Mic className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      )}
      
      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={inputMethod === "text" ? wordCount < 10 : recordingTime < 5}
        className="mt-auto bg-bronze hover:bg-bronze-dark text-white shadow-md"
      >
        <Send className="mr-2 h-4 w-4" /> Pitch It!
      </Button>
    </div>
  );
};

export default AdLibGame;
