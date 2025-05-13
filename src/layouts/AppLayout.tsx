
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "@/providers/UserProvider";
import { useEffect } from "react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TopNavBar from "@/components/layout/TopNavBar";

const AppLayout = () => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-hidden">
      <TopNavBar />
      <main className="flex-1 overflow-auto pb-20 pt-16">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
