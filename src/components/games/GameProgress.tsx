
import { Progress } from "@/components/ui/progress";

interface GameProgressProps {
  current: number;
  total: number;
}

const GameProgress = ({ current, total }: GameProgressProps) => {
  // When total is -1, it means infinite mode
  const isInfiniteMode = total === -1;
  
  // For infinite mode, we'll use a different calculation
  // that slowly increases but never reaches 100%
  const percentage = isInfiniteMode 
    ? Math.min(95, 50 + (current * 5) / (current + 1)) // Approaches but never reaches 100%
    : (current / total) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span>
          {isInfiniteMode ? `${current} responses` : `${current} of ${total}`}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default GameProgress;
