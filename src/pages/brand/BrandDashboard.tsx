import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { AIChatbot } from "@/components/shared/AIChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollaborations } from "@/hooks/useCollaborations";
import { useInfluencers } from "@/hooks/useInfluencers";
import { Search, TrendingUp, Users, Target, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
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
    if (isLoading) return;
    if (hasRedirected) return;

    if (!isAuthenticated || !user) {
      setHasRedirected(true);
      navigate("/auth?type=brand", { replace: true });
      return;
    }

    if (profile && profile.userType !== "brand") {
      setHasRedirected(true);
      navigate("/influencer/dashboard", { replace: true });
      return;
    }

    if (user && profile && !brandProfile) {
      setHasRedirected(true);
      navigate("/brand/onboarding", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, profile, brandProfile, navigate, hasRedirected]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter((c) => c.status === "active").length || 0;
  const pendingCollabs = collaborations?.filter((c) => c.status === "pending").length || 0;
  const activeCollabs = collaborations?.filter((c) => c.status === "accepted").length || 0;

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
      <div className="space-y-10 animate-fade-in">
        {/* Welcome Section - Apple style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Welcome back, {brandProfile?.company_name || profile?.full_name}
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage campaigns and discover new collaboration opportunities.
            </p>
          </div>
          <Button variant="apple" onClick={() => navigate("/brand/discover")}>
            <Search className="w-4 h-4 mr-2" />
            Find Creators
          </Button>
        </div>

        {/* Stats Grid - Apple minimal style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Campaigns"
            value={activeCampaigns}
            icon={Target}
            onClick={() => navigate("/brand/campaigns")}
          />
          <StatCard
            title="Collaborations"
            value={activeCollabs}
            icon={Users}
            onClick={() => navigate("/brand/collaborations")}
          />
          <StatCard
            title="Pending"
            value={pendingCollabs}
            icon={MessageSquare}
            onClick={() => navigate("/brand/collaborations")}
          />
          <StatCard
            title="Total Reach"
            value={formatReach(totalReach)}
            icon={TrendingUp}
            onClick={() => navigate("/brand/collaborations")}
          />
        </div>

        {/* Quick Actions - 3 column grid with AI Chat */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Assistant Card - Prominent placement */}
          <AIChatbot
            userType="brand"
            userName={brandProfile?.company_name || profile?.full_name}
            influencers={influencersForChat}
            brandInfo={brandProfile}
            variant="card"
          />

          <Card className="border-0 bg-foreground text-background overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">AI Discovery</h3>
                  <p className="text-background/70">Find your perfect match</p>
                </div>
              </div>
              <p className="text-background/80 mb-6 leading-relaxed">
                Our AI analyzes thousands of creators to find the perfect match for your campaign goals.
              </p>
              <Button
                className="w-full bg-background text-foreground hover:bg-background/90"
                onClick={() => navigate("/brand/discover")}
              >
                Start Discovery
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <Target className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Create Campaign</h3>
                  <p className="text-muted-foreground">Launch a new campaign</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Set up campaigns with goals, budget, and requirements. Manage partnerships easily.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/brand/campaigns")}
              >
                Create Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

