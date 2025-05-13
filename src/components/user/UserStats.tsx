
import { useUser } from "@/providers/UserProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const UserStats = () => {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <Card className="bg-gradient-to-r from-bronze/10 to-bronze/5 border-bronze/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Today's Earnings</p>
            <p className="text-2xl font-semibold coin">
              ${user.earningsToday.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Daily Streak</p>
              <div className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span>
                <span className="font-semibold">{user.streak}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Next reward</span>
                <span className="font-medium">+$0.50</span>
              </div>
              <Progress value={(user.streak % 5) * 20} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {5 - (user.streak % 5)} more days for bonus
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
