
import { NavLink } from "react-router-dom";
import { Home, Wallet, User } from "lucide-react";

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-sm z-10 border-t border-border">
      <div className="grid grid-cols-3 h-full max-w-md mx-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center ${isActive ? 'text-bronze' : 'text-muted-foreground'}`
          }
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        
        <NavLink 
          to="/wallet" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center ${isActive ? 'text-bronze' : 'text-muted-foreground'}`
          }
        >
          <Wallet size={22} />
          <span className="text-xs mt-1">Wallet</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center ${isActive ? 'text-bronze' : 'text-muted-foreground'}`
          }
        >
          <User size={22} />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNavigation;
