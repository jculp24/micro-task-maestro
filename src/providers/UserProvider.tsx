
import { createContext, useContext, useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  completedTasks: number;
  earningsToday: number;
  streak: number;
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  updateBalance: (amount: number) => void;
  completeTask: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for demonstration
const DEMO_USER: UserProfile = {
  id: "user123",
  name: "Alex Johnson",
  email: "alex@example.com",
  balance: 12.46,
  completedTasks: 47,
  earningsToday: 1.28,
  streak: 5,
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER); // Start logged in for demo

  const login = async (email: string, password: string): Promise<void> => {
    // Mock login - would be replaced with real auth
    setUser(DEMO_USER);
  };

  const logout = (): void => {
    setUser(null);
  };

  const registerUser = async (name: string, email: string, password: string): Promise<void> => {
    // Mock registration - would be replaced with real auth
    setUser({
      ...DEMO_USER,
      name,
      email,
    });
  };

  const updateBalance = (amount: number): void => {
    if (user) {
      setUser({
        ...user,
        balance: parseFloat((user.balance + amount).toFixed(2)),
        earningsToday: parseFloat((user.earningsToday + amount).toFixed(2)),
      });
    }
  };

  const completeTask = (amount: number): void => {
    if (user) {
      setUser({
        ...user,
        completedTasks: user.completedTasks + 1,
        balance: parseFloat((user.balance + amount).toFixed(2)),
        earningsToday: parseFloat((user.earningsToday + amount).toFixed(2)),
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        registerUser,
        updateBalance,
        completeTask,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
