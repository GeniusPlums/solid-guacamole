import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { AIChatbot } from "@/components/shared/AIChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaborations } from "@/hooks/useCollaborations";
import { Star, Briefcase, DollarSign, BarChart3, ArrowRight, User, MessageSquare } from "lucide-react";

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const { user, profile, influencerProfile, isLoading, isAuthenticated } = useAuth();
  const { data: collaborations } = useCollaborations();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (hasRedirected) return;

    if (!isAuthenticated || !user) {
      setHasRedirected(true);
      navigate("/auth?type=influencer", { replace: true });
      return;
    }

    if (profile && profile.userType !== "influencer") {
      setHasRedirected(true);
      navigate("/brand/dashboard", { replace: true });
      return;
    }

    if (user && profile && !influencerProfile) {
      setHasRedirected(true);
      navigate("/influencer/onboarding", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, profile, influencerProfile, navigate, hasRedirected]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const activeCollabs = collaborations?.filter((c) => c.status === "accepted").length || 0;
  const pendingCollabs = collaborations?.filter((c) => c.status === "pending").length || 0;

  const calculateProfileCompletion = () => {
    if (!influencerProfile) return 0;
    let completed = 0;
    const total = 8;
    if (influencerProfile.bio) completed++;
    if (influencerProfile.niche && influencerProfile.niche.length > 0) completed++;
    if (influencerProfile.instagramHandle) completed++;
    if (influencerProfile.youtubeHandle) completed++;
    if (influencerProfile.portfolioImages && influencerProfile.portfolioImages.length > 0) completed++;
    if (influencerProfile.contentSamples && influencerProfile.contentSamples.length > 0) completed++;
    if (influencerProfile.location) completed++;
    if (influencerProfile.languages && influencerProfile.languages.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const totalEarnings = collaborations
    ?.filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (c.offered_amount || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Welcome Section - Apple style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Welcome back, {profile?.fullName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage collaborations and grow your influence.
            </p>
          </div>
          <Button variant="apple" onClick={() => navigate("/influencer/profile")}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats Grid - Apple minimal style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Rating"
            value={influencerProfile?.rating ? Number(influencerProfile.rating).toFixed(1) : "N/A"}
            icon={Star}
          />
          <StatCard
            title="Collaborations"
            value={activeCollabs}
            icon={Briefcase}
            onClick={() => navigate("/influencer/collaborations")}
          />
          <StatCard
            title="Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Engagement"
            value={`${influencerProfile?.engagement_rate || 0}%`}
            icon={BarChart3}
          />
        </div>

        {/* Main Content - Apple card style */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Completion Card */}
          <Card className={`border-0 ${profileCompletion < 100 ? 'bg-foreground text-background' : 'bg-secondary/30'}`}>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profileCompletion < 100 ? 'bg-background/10' : 'bg-foreground/5'}`}>
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Complete Your Profile</h3>
                  <p className={profileCompletion < 100 ? 'text-background/70' : 'text-muted-foreground'}>
                    Stand out to brands
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className={profileCompletion < 100 ? 'text-background/80' : ''}>Profile completion</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-1.5" />
              </div>

              <p className={`text-sm mb-6 leading-relaxed ${profileCompletion < 100 ? 'text-background/80' : 'text-muted-foreground'}`}>
                {profileCompletion < 100
                  ? "Add your portfolio, social handles, and content samples to increase visibility."
                  : "Your profile is complete! Brands can now discover you easily."}
              </p>

              <Button
                className={`w-full ${profileCompletion < 100 ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
                variant={profileCompletion < 100 ? 'default' : 'outline'}
                onClick={() => navigate("/influencer/profile")}
              >
                {profileCompletion < 100 ? "Complete Profile" : "View Profile"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Brand Opportunities</h3>
                  <p className="text-muted-foreground">Pending requests</p>
                </div>
              </div>

              {pendingCollabs > 0 ? (
                <>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    You have <span className="font-semibold text-foreground">{pendingCollabs}</span> pending
                    collaboration requests from brands.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/influencer/collaborations")}
                  >
                    View Requests
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center h-32 border border-dashed border-border/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AIChatbot
        userType="influencer"
        userName={profile?.fullName}
        influencerInfo={influencerProfile}
      />
    </DashboardLayout>
  );
}

