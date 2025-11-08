
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/providers/UserProvider";

// Pages
import HomePage from "@/pages/HomePage";
import GamePage from "@/pages/GamePage";
import WalletPage from "@/pages/WalletPage";
import ProfilePage from "@/pages/ProfilePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import HighlightResultsPage from "@/pages/HighlightResultsPage";

// Layout
import AppLayout from "@/layouts/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="game/:gameType" element={<GamePage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="results/highlight/:imageId" element={<HighlightResultsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
