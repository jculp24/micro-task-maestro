import { useUser } from "@/providers/UserProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const WalletStats = () => {
  const {
    user
  } = useUser();
  if (!user) return null;
  return <Card className="bg-gradient-to-r from-bronze/10 to-bronze/5 border-bronze/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Balance</CardTitle>
        <CardDescription>
          Available to cash out or keep earning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-4xl font-bold coin">
            ${user.balance.toFixed(2)}
          </div>
          
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-xl font-semibold coin">
              ${user.earningsToday.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-xl font-semibold coin">
              ${(user.earningsToday * 3).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default WalletStats;