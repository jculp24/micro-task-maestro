
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserStats from "@/components/user/UserStats";
import { useUser } from "@/providers/UserProvider";
import { useToast } from "@/components/ui/use-toast";
import { Gamepad, CircleDollarSign, ArrowRight, Thermometer, Headphones, Image } from "lucide-react";
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
      description: "Rate items with simple swipe gestures",
      bgColor: "from-bronze/10 to-bronze/5",
    },
    {
      id: "thisthat",
      name: "This/That",
      icon: <ArrowRight className="h-8 w-8 text-bronze" />,
      description: "Choose between two options",
      bgColor: "from-teal/10 to-teal/5",
    },
    {
      id: "bracket",
      name: "Bracket",
      icon: <CircleDollarSign className="h-8 w-8 text-bronze" />,
      description: "Tournament style elimination voting",
      bgColor: "from-bronze/20 to-bronze/10",
    },
    {
      id: "higherlower",
      name: "Higher/Lower",
      icon: <Thermometer className="h-8 w-8 text-bronze" />,
      description: "Guess if prices are higher or lower",
      bgColor: "from-teal/20 to-teal/10",
    },
    {
      id: "soundbyte",
      name: "Sound Byte",
      icon: <Headphones className="h-8 w-8 text-bronze" />,
      description: "Rate audio clips and jingles",
      bgColor: "from-bronze/15 to-bronze/5",
    },
    {
      id: "highlight",
      name: "Highlight",
      icon: <Image className="h-8 w-8 text-bronze" />,
      description: "Mark what you like in images",
      bgColor: "from-teal/15 to-teal/5",
    }
  ];

  const handleGameSelect = (gameType) => {
    navigate(`/game/${gameType}`);
  };

  return (
    <div className="py-4 space-y-6">
      <UserStats />
      
      <h2 className="text-xl font-semibold">Choose a Game</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="h-36 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {games.map((game) => (
            <Card 
              key={game.id}
              className={`bg-gradient-to-br ${game.bgColor} border-bronze/20 hover:border-bronze/40 cursor-pointer transition-all hover:shadow-md`}
              onClick={() => handleGameSelect(game.id)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-white/50 p-3 mb-2">
                  {game.icon}
                </div>
                <h3 className="font-medium text-lg">{game.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
