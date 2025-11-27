import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Star, Instagram, Youtube, Twitter, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [niche, setNiche] = useState("all");
  const [platform, setPlatform] = useState("all");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  // Mock influencer data - will be replaced with real data from database
  const mockInfluencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      niche: "Fashion",
      followers: "150K",
      engagement: "4.8%",
      rating: 4.9,
      platforms: ["instagram", "youtube"],
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      name: "Mike Chen",
      niche: "Tech",
      followers: "320K",
      engagement: "5.2%",
      rating: 4.8,
      platforms: ["youtube", "twitter"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      name: "Emma Williams",
      niche: "Lifestyle",
      followers: "580K",
      engagement: "6.1%",
      rating: 5.0,
      platforms: ["instagram", "youtube", "twitter"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/brand-dashboard")}>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
              <span className="text-xl font-bold">ICY Platform</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
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
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Influencer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockInfluencers.map((influencer) => (
            <Card key={influencer.id} className="hover:shadow-lg transition-all overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={influencer.image}
                  alt={influencer.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{influencer.name}</CardTitle>
                    <CardDescription>{influencer.niche}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{influencer.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Followers</p>
                    <p className="font-semibold">{influencer.followers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engagement</p>
                    <p className="font-semibold">{influencer.engagement}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {influencer.platforms.includes("instagram") && (
                    <Badge variant="secondary">
                      <Instagram className="w-3 h-3 mr-1" />
                      IG
                    </Badge>
                  )}
                  {influencer.platforms.includes("youtube") && (
                    <Badge variant="secondary">
                      <Youtube className="w-3 h-3 mr-1" />
                      YT
                    </Badge>
                  )}
                  {influencer.platforms.includes("twitter") && (
                    <Badge variant="secondary">
                      <Twitter className="w-3 h-3 mr-1" />
                      X
                    </Badge>
                  )}
                </div>
                <Button className="w-full bg-gradient-primary">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;