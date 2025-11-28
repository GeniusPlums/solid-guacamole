import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { AIChatbot } from "@/components/shared/AIChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollaborations } from "@/hooks/useCollaborations";
import { useInfluencers } from "@/hooks/useInfluencers";
import { Search, TrendingUp, Users, Target, MessageSquare, Zap, ArrowRight } from "lucide-react";
import type { InfluencerData } from "@/lib/gemini";

export default function BrandDashboard() {
  const navigate = useNavigate();
  const { user, profile, brandProfile, isLoading, isAuthenticated } = useAuth();
  const { data: campaigns } = useCampaigns();
  const { data: collaborations } = useCollaborations();
  const { data: influencersData } = useInfluencers();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Transform influencers data for chatbot context
  const influencersForChat: InfluencerData[] = (influencersData || []).map((inf) => ({
    id: inf.id,
    name: inf.profile?.fullName || inf.profiles?.fullName || 'Unknown',
    bio: inf.bio || '',
    niche: inf.niche || [],
    instagramFollowers: inf.instagramFollowers || 0,
    youtubeSubscribers: inf.youtubeSubscribers || 0,
    twitterFollowers: inf.twitterFollowers || 0,
    tiktokFollowers: inf.tiktokFollowers || 0,
    engagementRate: inf.engagementRate || 0,
    rating: inf.rating || 0,
    location: inf.location || '',
    languages: inf.languages || [],
  }));

  useEffect(() => {
    // Wait for auth loading to complete before making any redirect decisions
    if (isLoading) {
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      return;
    }

    // Not authenticated - redirect to auth
    if (!isAuthenticated || !user) {
      setHasRedirected(true);
      navigate("/auth?type=brand", { replace: true });
      return;
    }

    // Wrong user type - redirect to influencer dashboard
    if (profile && profile.userType !== "brand") {
      setHasRedirected(true);
      navigate("/influencer/dashboard", { replace: true });
      return;
    }

    // Redirect to onboarding if brand profile not complete
    if (user && profile && !brandProfile) {
      setHasRedirected(true);
      navigate("/brand/onboarding", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, profile, brandProfile, navigate, hasRedirected]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter((c) => c.status === "active").length || 0;
  const pendingCollabs = collaborations?.filter((c) => c.status === "pending").length || 0;
  const activeCollabs = collaborations?.filter((c) => c.status === "accepted").length || 0;

  // Calculate total reach from active/accepted collaborations
  const totalReach = collaborations
    ?.filter((c) => c.status === "accepted" || c.status === "completed")
    .reduce((sum, collab) => {
      const influencer = collab.influencer_profiles || collab.influencer;
      if (influencer) {
        const reach = (influencer.instagramFollowers || influencer.instagram_followers || 0) +
                      (influencer.youtubeSubscribers || influencer.youtube_subscribers || 0) +
                      (influencer.twitterFollowers || influencer.twitter_followers || 0) +
                      (influencer.tiktokFollowers || influencer.tiktok_followers || 0);
        return sum + reach;
      }
      return sum;
    }, 0) || 0;

  const formatReach = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {brandProfile?.company_name || profile?.full_name}!
            </h1>
            <p className="text-muted-foreground">
              Manage your influencer campaigns and discover new collaboration opportunities.
            </p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => navigate("/brand/discover")}>
            <Search className="w-4 h-4 mr-2" />
            Find Influencers
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Active Campaigns"
            value={activeCampaigns}
            description="Currently running campaigns"
            icon={Target}
            onClick={() => navigate("/brand/campaigns")}
          />
          <StatCard
            title="Active Collaborations"
            value={activeCollabs}
            description="Ongoing partnerships"
            icon={Users}
            onClick={() => navigate("/brand/collaborations")}
          />
          <StatCard
            title="Pending Requests"
            value={pendingCollabs}
            description="Awaiting response"
            icon={MessageSquare}
            onClick={() => navigate("/brand/collaborations")}
          />
          <StatCard
            title="Total Reach"
            value={formatReach(totalReach)}
            description="Combined influencer reach"
            icon={TrendingUp}
            onClick={() => navigate("/brand/collaborations")}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>AI-Powered Discovery</CardTitle>
                  <CardDescription>Let AI find your perfect influencer match</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Answer a few questions about your campaign goals, target audience, and budget.
                Our AI will analyze thousands of influencers to find the perfect match.
              </p>
              <Button className="w-full bg-gradient-primary" onClick={() => navigate("/brand/discover")}>
                Start AI Discovery
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle>Create Campaign</CardTitle>
                  <CardDescription>Launch a new influencer marketing campaign</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set up a new campaign with specific goals, budget, and requirements.
                Track performance and manage multiple influencer partnerships.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/brand/campaigns")}>
                Create New Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot
        userType="brand"
        userName={brandProfile?.company_name || profile?.full_name}
        influencers={influencersForChat}
        brandInfo={brandProfile}
      />
    </DashboardLayout>
  );
}

