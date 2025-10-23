import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
import AdLibGame from "@/components/games/AdLibGame";
import LogoSortGame from "@/components/games/LogoSortGame";
import { mockGameData } from "@/data/mockGameData";
const GamePage = () => {
  const {
    gameType
  } = useParams<{
    gameType: string;
  }>();
  const {
    completeTask
  } = useUser();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [reward, setReward] = useState(0);
  useEffect(() => {
    // Reset game state when game type changes
    setIsGameCompleted(false);
    setProgress(0);

    // Get mock data for the selected game
    const data = mockGameData[gameType || "swipe"];
    if (data) {
      setGameData(data);
      setReward(data.reward || 0.02);
    } else {
      navigate("/");
      toast({
        title: "Game not found",
        description: "This game type doesn't exist.",
        variant: "destructive"
      });
    }
  }, [gameType]);

  // Update to track progress without completion
  const handleProgress = () => {
    const newProgress = progress + 1;
    setProgress(newProgress);
  };

  // Exit game handler
  const handleFinishGame = () => {
    navigate("/");
    toast({
      title: "Game completed!",
      description: `You provided ${progress} responses.`
    });
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
      case "adlibpro":
        return <AdLibGame data={gameData} onProgress={handleProgress} />;
      case "logosort":
        return <LogoSortGame data={gameData} onProgress={handleProgress} />;
      default:
        return <div>Game not found</div>;
    }
  };
  return <div className="h-full flex flex-col">
      <>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={handleExitGame} className="rounded-full">
            <X size={24} />
          </Button>
          
        </div>
        
        <GameHeader gameType={gameType || ""} title={gameData?.title || ""} description={gameData?.description || ""} />
        
        <GameProgress current={progress} total={-1} />
        
        <div className="flex-1 game-container mt-2 pb-2 min-h-0">
          {renderGame()}
        </div>

        {/* Exit button */}
        <Button 
          onClick={handleFinishGame} 
          variant="outline" 
          className="mt-2 mb-4 w-full border-bronze text-bronze hover:bg-bronze hover:text-white shrink-0"
        >
          {progress > 0 ? `Exit Game (${progress} responses)` : "Exit Game"}
        </Button>
      </>
    </div>;
};
export default GamePage;
