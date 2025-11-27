import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, Instagram, Youtube, Twitter, LogOut, Loader2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useInfluencers } from "@/hooks/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [niche, setNiche] = useState("all");
  const [platform, setPlatform] = useState("all");

  const { data: influencers, isLoading } = useInfluencers({
    search: searchQuery,
    niche: niche !== "all" ? niche : undefined,
    platform: platform !== "all" ? platform : undefined,
  });

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const handleGoHome = () => {
    if (profile?.user_type === "brand") {
      navigate("/brand/dashboard");
    } else if (profile?.user_type === "influencer") {
      navigate("/influencer/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleGoHome}>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
              <span className="text-xl font-bold">ICY Platform</span>
            </div>
            <div className="flex items-center gap-2">
              {profile && (
                <Button variant="ghost" size="sm" onClick={handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Influencer Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and connect with verified influencers across all niches
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Influencer Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : influencers && influencers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => {
              const totalFollowers = (influencer.instagram_followers || 0) + (influencer.youtube_subscribers || 0) + (influencer.twitter_followers || 0);
              const displayName = influencer.profiles?.full_name || influencer.instagram_handle || "Influencer";
              const avatarUrl = influencer.profiles?.avatar_url || "";
              return (
                <Card key={influencer.id} className="hover:shadow-lg transition-all overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{displayName}</CardTitle>
                          <CardDescription>{influencer.niche?.join(", ") || "No niche"}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{influencer.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {influencer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{influencer.bio}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Followers</p>
                        <p className="font-semibold">{formatNumber(totalFollowers)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{influencer.engagement_rate || 0}%</p>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      {influencer.instagram_handle && (
                        <Badge variant="secondary">
                          <Instagram className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.instagram_followers || 0)}
                        </Badge>
                      )}
                      {influencer.youtube_handle && (
                        <Badge variant="secondary">
                          <Youtube className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.youtube_subscribers || 0)}
                        </Badge>
                      )}
                      {influencer.twitter_handle && (
                        <Badge variant="secondary">
                          <Twitter className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.twitter_followers || 0)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="w-full bg-gradient-primary"
                      onClick={() => navigate(`/influencer/${influencer.id}`)}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No influencers found. Try adjusting your filters or check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Marketplace;