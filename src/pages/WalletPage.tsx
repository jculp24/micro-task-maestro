
import { useState } from "react";
import { useUser } from "@/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { mockTransactions } from "@/data/mockTransactions";
import WalletStats from "@/components/wallet/WalletStats";
import TransactionList from "@/components/wallet/TransactionList";

const WalletPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCashout = () => {
    if (user && user.balance < 5) {
      toast({
        title: "Minimum cashout not reached",
        description: "You need at least $5.00 to cash out.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Cashout requested",
        description: "Your money will arrive in 1-3 business days.",
      });
    }, 1500);
  };

  return (
    <div className="py-4 space-y-6">
      <WalletStats />
      
      <Card className="border-bronze/20">
        <CardHeader>
          <CardTitle className="text-xl">Cash Out</CardTitle>
          <CardDescription>
            Transfer your earnings to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2 coin">
            ${user?.balance.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {user && user.balance >= 5 
              ? "Available for withdrawal" 
              : `$${(5 - (user?.balance || 0)).toFixed(2)} more needed to reach minimum cashout`
            }
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-bronze h-2 rounded-full" 
              style={{ 
                width: `${Math.min((user?.balance || 0) / 5 * 100, 100)}%` 
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCashout}
            disabled={!user || user.balance < 5 || isProcessing}
            className="w-full btn-bronze"
          >
            {isProcessing ? "Processing..." : "Cash Out"}
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="cashouts">Cashouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TransactionList transactions={mockTransactions} />
        </TabsContent>
        <TabsContent value="earnings">
          <TransactionList 
            transactions={mockTransactions.filter(t => t.type === "earning")} 
          />
        </TabsContent>
        <TabsContent value="cashouts">
          <TransactionList 
            transactions={mockTransactions.filter(t => t.type === "cashout")} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
