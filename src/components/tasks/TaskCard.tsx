
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { 
  Card, 
  CardContent, 
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Gamepad } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();

  const handleStartTask = () => {
    navigate(`/game/${task.gameType}`);
  };

  // Map game type to display name
  const getGameTypeDisplay = (type: string) => {
    switch (type) {
      case "swipe": return "Swipe";
      case "bracket": return "Bracket";
      case "thisthat": return "This or That";
      case "soundbyte": return "Sound Byte";
      case "higherlower": return "Higher or Lower";
      case "highlight": return "Highlight";
      case "adlibpro": return "Ad Lib Pro";
      default: return type;
    }
  };

  return (
    <Card className="task-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          <div className="earning-tag font-semibold">${task.reward.toFixed(2)}</div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Gamepad size={14} />
            <span>{getGameTypeDisplay(task.gameType)}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{task.timeEstimate}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex justify-end">
        <Button 
          onClick={handleStartTask} 
          variant="outline"
          className="border-bronze text-bronze hover:bg-bronze hover:text-white"
        >
          Start Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
