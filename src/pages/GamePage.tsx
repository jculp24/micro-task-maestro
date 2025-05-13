
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import GameHeader from "@/components/games/GameHeader";
import GameProgress from "@/components/games/GameProgress";
import RewardAnimation from "@/components/games/RewardAnimation";
import SwipeGame from "@/components/games/SwipeGame";
import BracketGame from "@/components/games/BracketGame";
import ThisThatGame from "@/components/games/ThisThatGame";
import SoundByteGame from "@/components/games/SoundByteGame";
import HigherLowerGame from "@/components/games/HigherLowerGame";
import HighlightGame from "@/components/games/HighlightGame";
import { mockGameData } from "@/data/mockGameData";

const GamePage = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { completeTask } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [reward, setReward] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    // Reset game state when game type changes
    setIsGameCompleted(false);
    setProgress(0);
    setShowReward(false);
    
    // Get mock data for the selected game
    const data = mockGameData[gameType || "swipe"];
    if (data) {
      setGameData(data);
      setSteps(data.steps || 5);
      setReward(data.reward || 0.02);
    } else {
      navigate("/");
      toast({
        title: "Game not found",
        description: "This game type doesn't exist.",
        variant: "destructive",
      });
    }
  }, [gameType]);

  const handleProgress = () => {
    const newProgress = progress + 1;
    setProgress(newProgress);
    
    if (newProgress >= steps) {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    setIsGameCompleted(true);
    setTimeout(() => {
      setShowReward(true);
      completeTask(reward);
    }, 500);
  };

  const handleExitGame = () => {
    if (progress > 0 && !isGameCompleted) {
      if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  const handleFinish = () => {
    navigate("/");
    toast({
      title: "Task completed!",
      description: `You earned $${reward.toFixed(2)}.`,
    });
  };

  const renderGame = () => {
    if (!gameData) return null;

    switch (gameType) {
      case "swipe":
        return <SwipeGame data={gameData} onProgress={handleProgress} />;
      case "bracket":
        return <BracketGame data={gameData} onProgress={handleProgress} />;
      case "thisthat":
        return <ThisThatGame data={gameData} onProgress={handleProgress} />;
      case "soundbyte":
        return <SoundByteGame data={gameData} onProgress={handleProgress} />;
      case "higherlower":
        return <HigherLowerGame data={gameData} onProgress={handleProgress} />;
      case "highlight":
        return <HighlightGame data={gameData} onProgress={handleProgress} />;
      default:
        return <div>Game not found</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {showReward ? (
        <RewardAnimation amount={reward} onFinish={handleFinish} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleExitGame} 
              className="rounded-full"
            >
              <X size={24} />
            </Button>
            <div className="earning-tag">
              ${reward.toFixed(2)}
            </div>
          </div>
          
          <GameHeader 
            gameType={gameType || ""}
            title={gameData?.title || ""}
            description={gameData?.description || ""}
          />
          
          <GameProgress current={progress} total={steps} />
          
          <div className="flex-1 game-container mt-4">
            {renderGame()}
            
            {isGameCompleted && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Completed!</h2>
                  <p className="text-muted-foreground mb-4">Processing your feedback...</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GamePage;
