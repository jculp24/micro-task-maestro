
import { Progress } from "@/components/ui/progress";

interface GameProgressProps {
  current: number;
  total: number;
}

const GameProgress = ({ current, total }: GameProgressProps) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span>{current} of {total}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default GameProgress;
