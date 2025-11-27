import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaborations } from "@/hooks/useCollaborations";
import { Star, Briefcase, DollarSign, BarChart3, ArrowRight, User, MessageSquare } from "lucide-react";

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const { user, profile, influencerProfile, isLoading } = useAuth();
  const { data: collaborations } = useCollaborations();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth?type=influencer");
      return;
    }
    if (!isLoading && profile?.userType !== "influencer") {
      navigate("/brand/dashboard");
      return;
    }
    if (!isLoading && user && profile && !influencerProfile) {
      navigate("/influencer/onboarding");
    }
  }, [isLoading, user, profile, influencerProfile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeCollabs = collaborations?.filter((c) => c.status === "accepted").length || 0;
  const pendingCollabs = collaborations?.filter((c) => c.status === "pending").length || 0;
  const completedCollabs = collaborations?.filter((c) => c.status === "completed").length || 0;

  // Calculate profile completion percentage
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
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.fullName}!
            </h1>
            <p className="text-muted-foreground">
              Manage your collaborations and grow your influence.
            </p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => navigate("/influencer/profile")}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Profile Rating"
            value={influencerProfile?.rating?.toFixed(1) || "N/A"}
            description="Based on brand reviews"
            icon={Star}
          />
          <StatCard
            title="Active Collaborations"
            value={activeCollabs}
            description="Currently ongoing"
            icon={Briefcase}
            onClick={() => navigate("/influencer/collaborations")}
          />
          <StatCard
            title="Total Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            description="From completed projects"
            icon={DollarSign}
          />
          <StatCard
            title="Engagement Rate"
            value={`${influencerProfile?.engagement_rate || 0}%`}
            description="Across platforms"
            icon={BarChart3}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Completion Card */}
          <Card className={profileCompletion < 100 ? "border-primary/20" : ""}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>Stand out to brands with a comprehensive profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Profile completion</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {profileCompletion < 100
                  ? "Add your portfolio, social media handles, niche, and content samples to increase visibility."
                  : "Your profile is complete! Brands can now discover you easily."}
              </p>
              <Button
                className="w-full bg-gradient-primary"
                onClick={() => navigate("/influencer/profile")}
              >
                {profileCompletion < 100 ? "Complete Profile" : "View Profile"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle>Brand Opportunities</CardTitle>
                  <CardDescription>Pending collaboration requests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingCollabs > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    You have <span className="font-bold text-primary">{pendingCollabs}</span> pending
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
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

