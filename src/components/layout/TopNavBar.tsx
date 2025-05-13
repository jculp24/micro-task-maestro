
import { useUser } from "@/providers/UserProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

const TopNavBar = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Determine the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Home";
    if (path.startsWith("/game")) return "Game";
    if (path === "/wallet") return "Wallet";
    if (path === "/profile") return "Profile";
    
    return "TwoCents";
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-sm z-10 border-b border-border">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">{getPageTitle()}</h1>
        
        <div className="flex items-center gap-3">
          <div className="coin text-sm font-medium">
            ${user?.balance.toFixed(2)}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon size={20} className="text-foreground" />
            ) : (
              <Sun size={20} className="text-foreground" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
