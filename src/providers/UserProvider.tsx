import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username: string;
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
  logout: () => Promise<void>;
  registerUser: (username: string, email: string, password: string) => Promise<void>;
  updateBalance: (amount: number) => void;
  completeTask: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Fetch user profile and stats
  const fetchUserData = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (statsError) throw statsError;

      setUser({
        id: profile.id,
        username: profile.username || profile.email.split('@')[0],
        email: profile.email,
        balance: Number(stats.balance) || 0,
        completedTasks: stats.tasks_completed || 0,
        earningsToday: Number(stats.earnings_today) || 0,
        streak: stats.current_streak || 0,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up realtime listener for user_stats
  useEffect(() => {
    if (!authUser?.id) return;

    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${authUser.id}`
        },
        (payload) => {
          const stats = payload.new as any;
          setUser(prev => prev ? {
            ...prev,
            balance: Number(stats.balance) || 0,
            completedTasks: stats.tasks_completed || 0,
            earningsToday: Number(stats.earnings_today) || 0,
            streak: stats.current_streak || 0,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) {
      await fetchUserData(data.user.id);
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setAuthUser(null);
  };

  const registerUser = async (username: string, email: string, password: string): Promise<void> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    if (data.user) {
      await fetchUserData(data.user.id);
    }
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
