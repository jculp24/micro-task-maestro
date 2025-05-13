
import { Progress } from "@/components/ui/progress";

interface GameProgressProps {
  current: number;
  total: number;
}

const GameProgress = ({
  current,
  total
}: GameProgressProps) => {
  // When total is -1, it means infinite mode
  const isInfiniteMode = total === -1;

  // For infinite mode, we'll use a different calculation
  // that slowly increases but never reaches 100%
  const percentage = isInfiniteMode 
    ? Math.min(95, 50 + current * 5 / (current + 1)) // Approaches but never reaches 100%
    : current / total * 100;

  return (
    <Progress value={percentage} className="h-2 w-full" />
  );
};

export default GameProgress;
