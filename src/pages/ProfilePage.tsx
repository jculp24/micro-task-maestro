
import { useState } from "react";
import { useUser } from "@/providers/UserProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronRight,
  Moon
} from "lucide-react";

const ProfilePage = () => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  if (!user) return null;

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-bronze">
          <AvatarFallback className="bg-bronze text-xl">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{user.completedTasks}</p>
            <p className="text-sm text-muted-foreground">Tasks</p>
          </div>
          <div>
            <p className="text-2xl font-bold coin">${user.balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Balance</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={18} />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={18} />
              <span>Dark Mode</span>
            </div>
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={toggleTheme} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
          
          <Separator />
          
          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => {}}
          >
            <div className="flex items-center gap-3">
              <User size={18} />
              <span>Edit Profile</span>
            </div>
            <ChevronRight size={18} />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Logout</span>
            </div>
            <ChevronRight size={18} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
