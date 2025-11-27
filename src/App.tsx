import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

// Brand pages
import BrandDashboard from "./pages/brand/BrandDashboard";
import BrandDiscover from "./pages/brand/BrandDiscover";
import BrandCampaigns from "./pages/brand/BrandCampaigns";
import BrandCollaborations from "./pages/brand/BrandCollaborations";
import BrandAnalytics from "./pages/brand/BrandAnalytics";
import BrandMessages from "./pages/brand/BrandMessages";
import BrandOnboarding from "./pages/brand/BrandOnboarding";

// Influencer pages
import InfluencerDashboard from "./pages/influencer/InfluencerDashboard";
import InfluencerProfile from "./pages/influencer/InfluencerProfile";
import InfluencerCollaborations from "./pages/influencer/InfluencerCollaborations";
import InfluencerCalendar from "./pages/influencer/InfluencerCalendar";
import InfluencerAnalytics from "./pages/influencer/InfluencerAnalytics";
import InfluencerMessages from "./pages/influencer/InfluencerMessages";
import InfluencerOnboarding from "./pages/influencer/InfluencerOnboarding";

// Shared pages
import InfluencerProfileView from "./pages/shared/InfluencerProfileView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/influencer/:id" element={<InfluencerProfileView />} />

            {/* Brand Routes */}
            <Route path="/brand/dashboard" element={<BrandDashboard />} />
            <Route path="/brand/discover" element={<BrandDiscover />} />
            <Route path="/brand/campaigns" element={<BrandCampaigns />} />
            <Route path="/brand/collaborations" element={<BrandCollaborations />} />
            <Route path="/brand/analytics" element={<BrandAnalytics />} />
            <Route path="/brand/messages" element={<BrandMessages />} />
            <Route path="/brand/onboarding" element={<BrandOnboarding />} />

            {/* Influencer Routes */}
            <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
            <Route path="/influencer/profile" element={<InfluencerProfile />} />
            <Route path="/influencer/collaborations" element={<InfluencerCollaborations />} />
            <Route path="/influencer/calendar" element={<InfluencerCalendar />} />
            <Route path="/influencer/analytics" element={<InfluencerAnalytics />} />
            <Route path="/influencer/messages" element={<InfluencerMessages />} />
            <Route path="/influencer/onboarding" element={<InfluencerOnboarding />} />

            {/* Legacy routes redirect */}
            <Route path="/brand-dashboard" element={<BrandDashboard />} />
            <Route path="/influencer-dashboard" element={<InfluencerDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
