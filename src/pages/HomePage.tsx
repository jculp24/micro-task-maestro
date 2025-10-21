
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserStats from "@/components/user/UserStats";
import { useUser } from "@/providers/UserProvider";
import { useToast } from "@/components/ui/use-toast";
import { 
  Gamepad, 
  CircleDollarSign, 
  ArrowRight, 
  Thermometer, 
  Headphones, 
  Image,
  MessageCircle,
  Grid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    // Show welcome toast when the component mounts
    toast({
      title: "Welcome back!",
      description: `You've earned $${user?.earningsToday.toFixed(2)} today.`,
      duration: 3000,
    });
  }, []);

  const games = [
    {
      id: "swipe",
      name: "Swipe",
      icon: <Gamepad className="h-8 w-8 text-bronze" />,
      description: "Flick your way to fortune! Swipe hot or not on trending products",
    },
    {
      id: "thisthat",
      name: "This/That",
      icon: <ArrowRight className="h-8 w-8 text-bronze" />,
      description: "Quick choice, big impact! Pick winners in head-to-head battles",
    },
    {
      id: "bracket",
      name: "Bracket",
      icon: <CircleDollarSign className="h-8 w-8 text-bronze" />,
      description: "Tournament champion! Eliminate options to crown the best",
    },
    {
      id: "higherlower",
      name: "Higher/Lower",
      icon: <Thermometer className="h-8 w-8 text-bronze" />,
      description: "Test your price wisdom! Guess values and rack up coins",
    },
    {
      id: "soundbyte",
      name: "Sound Byte",
      icon: <Headphones className="h-8 w-8 text-bronze" />,
      description: "Golden ears challenge! Rate audio that makes brands pop",
    },
    {
      id: "highlight",
      name: "Highlight",
      icon: <Image className="h-8 w-8 text-bronze" />,
      description: "Spot what shines! Mark the magic in ad campaigns",
    },
    {
      id: "adlibpro",
      name: "Ad Lib Pro",
      icon: <MessageCircle className="h-8 w-8 text-bronze" />,
      description: "Word wizard wanted! Craft catchy phrases that sell",
    },
    {
      id: "logosort",
      name: "Logo Sort",
      icon: <Grid className="h-8 w-8 text-bronze" />,
      description: "Brand mastermind! Organize logos and earn instant cash",
    }
  ];

  const handleGameSelect = (gameType) => {
    navigate(`/game/${gameType}`);
  };

  return (
    <div className="p-6 space-y-6">
      <UserStats />
      
      <h2 className="text-xl font-semibold">Choose a Game</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-5">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="h-36 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="game-card bg-gradient-to-br from-[#2D2D2D] to-[#222] border-bronze/20 hover:border-bronze/60 
                cursor-pointer transition-all hover:shadow-lg transform hover:scale-[1.03] 
                hover:translate-y-[-2px] aspect-square"
              onClick={() => handleGameSelect(game.id)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                <div className="rounded-full bg-gradient-to-br from-bronze/30 to-bronze/10 p-3 mb-3">
                  {game.icon}
                </div>
                <h3 className="font-medium text-lg text-white mb-1">{game.name}</h3>
                <p className="text-xs text-gray-300 leading-tight">{game.description}</p>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-bronze rounded-full">
                    <span className="text-[10px] font-bold text-white">$</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
