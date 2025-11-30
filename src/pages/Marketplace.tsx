import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, Star, Instagram, Youtube, Twitter, Home, Filter, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInfluencers } from "@/hooks/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { useAddToShortlist, useRemoveFromShortlist, useIsShortlisted } from "@/hooks/useShortlists";
import { cn } from "@/lib/utils";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minEngagement, setMinEngagement] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const isBrand = profile?.userType === "brand";

  const { data: influencers, isLoading } = useInfluencers({
    search: searchQuery,
    niche: niche !== "all" ? niche : undefined,
    platform: platform !== "all" ? platform : undefined,
    minFollowers: minFollowers > 0 ? minFollowers : undefined,
    minEngagement: minEngagement > 0 ? minEngagement : undefined,
    sortBy,
  });

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You have been successfully signed out." });
    navigate("/");
  };

  const handleGoHome = () => {
    if (profile?.userType === "brand") {
      navigate("/brand/dashboard");
    } else if (profile?.userType === "influencer") {
      navigate("/influencer/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Apple-style Header */}
      <header className="apple-nav-blur border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleGoHome}>
              <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background text-sm font-bold">ICY</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <button
                  onClick={handleGoHome}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Discover Creators</h1>
          <p className="text-lg text-muted-foreground">
            Find and connect with verified creators across all niches
          </p>
        </div>

        {/* Filters - Apple minimal style */}
        <div className="mb-8 p-6 rounded-2xl bg-secondary/30">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
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
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="justify-between"
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
            </Button>
          </div>
          {showAdvanced && (
            <div className="grid md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Min Followers: {minFollowers > 0 ? formatNumber(minFollowers) : "Any"}</Label>
                <Slider value={[minFollowers]} onValueChange={([v]) => setMinFollowers(v)} min={0} max={1000000} step={10000} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Min Engagement: {minEngagement > 0 ? `${minEngagement}%` : "Any"}</Label>
                <Slider value={[minEngagement]} onValueChange={([v]) => setMinEngagement(v)} min={0} max={15} step={0.5} />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Creator Grid - Apple style cards */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : influencers && influencers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {influencers.map((influencer) => {
              const totalFollowers = (influencer.instagramFollowers || 0) + (influencer.youtubeSubscribers || 0) + (influencer.twitterFollowers || 0);
              const displayName = influencer.profiles?.fullName || influencer.profile?.fullName || influencer.instagramHandle || "Creator";
              const avatarUrl = influencer.profiles?.avatarUrl || influencer.profile?.avatarUrl || "";
              return (
                <Card
                  key={influencer.id}
                  className="border-0 bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/influencer/${influencer.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-background">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="bg-foreground/5 text-lg">{displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{displayName}</h3>
                          <p className="text-sm text-muted-foreground">{influencer.niche?.slice(0, 2).join(", ") || "Creator"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{influencer.rating || "—"}</span>
                      </div>
                    </div>

                    {influencer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{influencer.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Followers</p>
                        <p className="text-xl font-semibold tracking-tight">{formatNumber(totalFollowers)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                        <p className="text-xl font-semibold tracking-tight">{influencer.engagementRate || 0}%</p>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      {influencer.instagramHandle && (
                        <Badge variant="outline" className="text-xs">
                          <Instagram className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.instagramFollowers || 0)}
                        </Badge>
                      )}
                      {influencer.youtubeHandle && (
                        <Badge variant="outline" className="text-xs">
                          <Youtube className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.youtubeSubscribers || 0)}
                        </Badge>
                      )}
                      {influencer.twitterHandle && (
                        <Badge variant="outline" className="text-xs">
                          <Twitter className="w-3 h-3 mr-1" />
                          {formatNumber(influencer.twitterFollowers || 0)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No creators found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;