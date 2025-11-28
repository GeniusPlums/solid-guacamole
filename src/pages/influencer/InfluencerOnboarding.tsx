import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const niches = [
  "Fashion", "Beauty", "Tech", "Gaming", "Fitness", "Food",
  "Travel", "Lifestyle", "Music", "Art", "Business", "Education", "Finance"
];

export default function InfluencerOnboarding() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, refreshProfiles, influencerProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    bio: "",
    instagram_handle: "",
    youtube_handle: "",
    twitter_handle: "",
    tiktok_handle: "",
    location: "",
  });

  // Redirect logic - must wait for auth loading to complete
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (hasRedirected) {
      return;
    }

    // Not authenticated - redirect to auth
    if (!isAuthenticated || !user) {
      setHasRedirected(true);
      navigate("/auth?type=influencer", { replace: true });
      return;
    }

    // Already has influencer profile - redirect to dashboard
    if (influencerProfile) {
      setHasRedirected(true);
      navigate("/influencer/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, user, influencerProfile, navigate, hasRedirected]);

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedNiches.length === 0) {
      toast({
        title: "Select at least one niche",
        description: "Please select at least one content niche.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your profile setup.",
        variant: "destructive",
      });
      navigate("/auth?type=influencer");
      return;
    }

    setIsLoading(true);
    try {
      await profilesApi.saveInfluencerProfile({
        bio: formData.bio || null,
        niche: selectedNiches,
        instagramHandle: formData.instagram_handle || null,
        youtubeHandle: formData.youtube_handle || null,
        twitterHandle: formData.twitter_handle || null,
        tiktokHandle: formData.tiktok_handle || null,
        location: formData.location || null,
      });

      await refreshProfiles();

      toast({
        title: "Welcome aboard!",
        description: "Your influencer profile has been created successfully.",
      });

      navigate("/influencer/dashboard", { replace: true });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Influencer Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to get discovered by brands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Your Niches *</Label>
              <div className="flex flex-wrap gap-2">
                {niches.map((niche) => (
                  <Button
                    key={niche}
                    type="button"
                    variant={selectedNiches.includes(niche) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNiche(niche)}
                    disabled={isLoading}
                  >
                    {niche}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@username"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  placeholder="Channel name"
                  value={formData.youtube_handle}
                  onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={formData.twitter_handle}
                  onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating profile...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

