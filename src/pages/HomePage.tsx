
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
  MessageCircle 
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
      description: "Rate items with simple swipe gestures",
    },
    {
      id: "thisthat",
      name: "This/That",
      icon: <ArrowRight className="h-8 w-8 text-bronze" />,
      description: "Choose between two options",
    },
    {
      id: "bracket",
      name: "Bracket",
      icon: <CircleDollarSign className="h-8 w-8 text-bronze" />,
      description: "Tournament style elimination voting",
    },
    {
      id: "higherlower",
      name: "Higher/Lower",
      icon: <Thermometer className="h-8 w-8 text-bronze" />,
      description: "Guess if prices are higher or lower",
    },
    {
      id: "soundbyte",
      name: "Sound Byte",
      icon: <Headphones className="h-8 w-8 text-bronze" />,
      description: "Rate audio clips and jingles",
    },
    {
      id: "highlight",
      name: "Highlight",
      icon: <Image className="h-8 w-8 text-bronze" />,
      description: "Mark what you like in images",
    },
    {
      id: "adlibpro",
      name: "Ad Lib Pro",
      icon: <MessageCircle className="h-8 w-8 text-bronze" />,
      description: "Fill in the blanks to create ad messages",
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
          {[...Array(7)].map((_, i) => (
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
              className="bg-[#2D2D2D] border-bronze/20 hover:border-bronze/40 cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleGameSelect(game.id)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-400/20 p-3 mb-2">
                  {game.icon}
                </div>
                <h3 className="font-medium text-lg text-white">{game.name}</h3>
                <p className="text-xs text-gray-300 mt-1">{game.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
