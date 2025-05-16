import { useState } from "react";
import { useUser } from "@/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTransactions } from "@/data/mockTransactions";
import WalletStats from "@/components/wallet/WalletStats";
import TransactionList from "@/components/wallet/TransactionList";
import { Building, TrendingUp, Heart } from "lucide-react";
const WalletPage = () => {
  const {
    user
  } = useUser();
  const {
    toast
  } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const handleTransferToBank = () => {
    if (user && user.balance < 5) {
      toast({
        title: "Minimum transfer not reached",
        description: "You need at least $5.00 to transfer to your bank.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Bank transfer requested",
        description: "Your money will arrive in 1-3 business days."
      });
    }, 1500);
  };
  const handleTransferToVenmo = () => {
    if (user && user.balance < 5) {
      toast({
        title: "Minimum transfer not reached",
        description: "You need at least $5.00 to transfer to Venmo.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Venmo transfer requested",
        description: "Your money will be sent to your Venmo account shortly."
      });
    }, 1500);
  };
  const handleInvest = () => {
    if (user && user.balance < 1) {
      toast({
        title: "Minimum investment not reached",
        description: "You need at least $1.00 to invest.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Investment processed",
        description: "Your money has been invested successfully."
      });
    }, 1500);
  };
  const handleDonate = () => {
    if (user && user.balance < 1) {
      toast({
        title: "Minimum donation not reached",
        description: "You need at least $1.00 to donate.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Donation processed",
        description: "Thank you for your generosity!"
      });
    }, 1500);
  };
  return <div className="py-4 space-y-6">
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
            {user && user.balance >= 5 ? "Available for withdrawal" : `$${(5 - (user?.balance || 0)).toFixed(2)} more needed to reach minimum cashout`}
          </div>
          
          
          
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleTransferToBank} disabled={!user || user.balance < 5 || isProcessing} className="w-full btn-bronze flex justify-center items-center">
              <Building className="mr-2" size={18} /> Transfer to Bank
            </Button>
            
            <Button onClick={handleTransferToVenmo} disabled={!user || user.balance < 5 || isProcessing} className="w-full btn-bronze flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-[18px] w-[18px]">
                <path d="M10.77 0c6.38 0 10.77 4.997 10.77 10.83 0 4.946-4.177 10.205-10.77 13.17C4.177 21.035 0 15.776 0 10.83 0 4.997 4.39 0 10.77 0zm1.279 9.206c-.214 1.095-1.332 6.189-1.332 6.189h-2.31s-1.355-5.458-1.419-5.695c-.064-.238-.097-.585-.892-.585H5.29l.028-.184c.607-.162 1.246-.335 1.876-.508.63-.173 1.05-.13 1.204.161.155.292 1.289 5.138 1.289 5.138.526-2.252.968-4.146 1.139-4.86.17-.715-.034-1.141-.794-1.341l.043-.238 2.36.147c.47.03.774.359.615.776z" />
              </svg> 
              Transfer to Venmo
            </Button>
            
            <Button onClick={handleInvest} disabled={!user || user.balance < 1 || isProcessing} className="w-full btn-bronze flex justify-center items-center">
              <TrendingUp className="mr-2" size={18} /> Invest
            </Button>
            
            <Button onClick={handleDonate} disabled={!user || user.balance < 1 || isProcessing} className="w-full btn-bronze flex justify-center items-center">
              <Heart className="mr-2" size={18} /> Donate
            </Button>
          </div>
        </CardContent>
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
          <TransactionList transactions={mockTransactions.filter(t => t.type === "earning")} />
        </TabsContent>
        <TabsContent value="cashouts">
          <TransactionList transactions={mockTransactions.filter(t => ["cashout", "bank-transfer", "venmo-transfer", "investment", "donation"].includes(t.type))} />
        </TabsContent>
      </Tabs>
    </div>;
};
export default WalletPage;