import { useUser } from "@/providers/UserProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const WalletStats = () => {
  const {
    user
  } = useUser();
  if (!user) return null;
  return <Card className="bg-gradient-to-r from-bronze/10 to-bronze/5 border-bronze/20 overflow-hidden">
      
      
    </Card>;
};
export default WalletStats;