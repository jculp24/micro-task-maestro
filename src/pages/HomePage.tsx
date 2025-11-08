
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
      icon: <Gamepad className="h-7 w-7 text-bronze" />,
      description: "Rate & Earn",
    },
    {
      id: "thisthat",
      name: "This/That",
      icon: <ArrowRight className="h-7 w-7 text-bronze" />,
      description: "Choose Winner",
    },
    {
      id: "bracket",
      name: "Bracket",
      icon: <CircleDollarSign className="h-7 w-7 text-bronze" />,
      description: "Tournament Mode",
    },
    {
      id: "higherlower",
      name: "Higher/Lower",
      icon: <Thermometer className="h-7 w-7 text-bronze" />,
      description: "Guess Values",
    },
    {
      id: "highlight",
      name: "Highlight",
      icon: <Image className="h-7 w-7 text-bronze" />,
      description: "Mark Magic",
    },
    {
      id: "logosort",
      name: "Logo Sort",
      icon: <Grid className="h-7 w-7 text-bronze" />,
      description: "Organize Brands",
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
          {[...Array(6)].map((_, i) => (
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
              <CardContent className="p-5 flex flex-col items-center text-center h-full justify-center gap-2">
                <div className="rounded-full bg-gradient-to-br from-bronze/30 to-bronze/10 p-2.5">
                  {game.icon}
                </div>
                <h3 className="font-semibold text-base text-white">{game.name}</h3>
                <p className="text-xs text-gray-400">{game.description}</p>
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
