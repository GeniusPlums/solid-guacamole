import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Instagram, Youtube, Twitter, Save, Star, Users, TrendingUp } from "lucide-react";

const niches = ["Fashion", "Beauty", "Tech", "Gaming", "Fitness", "Food", "Travel", "Lifestyle", "Music", "Art", "Business", "Education"];

export default function InfluencerProfile() {
  const { user, profile, influencerProfile, refreshProfiles } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(influencerProfile?.niche || []);
  const [formData, setFormData] = useState({
    bio: influencerProfile?.bio || "",
    instagram_handle: influencerProfile?.instagram_handle || "",
    instagram_followers: influencerProfile?.instagram_followers?.toString() || "",
    youtube_handle: influencerProfile?.youtube_handle || "",
    youtube_subscribers: influencerProfile?.youtube_subscribers?.toString() || "",
    twitter_handle: influencerProfile?.twitter_handle || "",
    twitter_followers: influencerProfile?.twitter_followers?.toString() || "",
    tiktok_handle: influencerProfile?.tiktok_handle || "",
    tiktok_followers: influencerProfile?.tiktok_followers?.toString() || "",
    engagement_rate: influencerProfile?.engagement_rate?.toString() || "",
    location: influencerProfile?.location || "",
  });

  useEffect(() => {
    if (influencerProfile) {
      setSelectedNiches(influencerProfile.niche || []);
      setFormData({
        bio: influencerProfile.bio || "",
        instagram_handle: influencerProfile.instagram_handle || "",
        instagram_followers: influencerProfile.instagram_followers?.toString() || "",
        youtube_handle: influencerProfile.youtube_handle || "",
        youtube_subscribers: influencerProfile.youtube_subscribers?.toString() || "",
        twitter_handle: influencerProfile.twitter_handle || "",
        twitter_followers: influencerProfile.twitter_followers?.toString() || "",
        tiktok_handle: influencerProfile.tiktok_handle || "",
        tiktok_followers: influencerProfile.tiktok_followers?.toString() || "",
        engagement_rate: influencerProfile.engagement_rate?.toString() || "",
        location: influencerProfile.location || "",
      });
    }
  }, [influencerProfile]);

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) => prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]);
  };

  const handleSave = async () => {
    if (!influencerProfile) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("influencer_profiles")
        .update({
          bio: formData.bio || null,
          niche: selectedNiches,
          instagram_handle: formData.instagram_handle || null,
          instagram_followers: formData.instagram_followers ? parseInt(formData.instagram_followers) : null,
          youtube_handle: formData.youtube_handle || null,
          youtube_subscribers: formData.youtube_subscribers ? parseInt(formData.youtube_subscribers) : null,
          twitter_handle: formData.twitter_handle || null,
          twitter_followers: formData.twitter_followers ? parseInt(formData.twitter_followers) : null,
          tiktok_handle: formData.tiktok_handle || null,
          tiktok_followers: formData.tiktok_followers ? parseInt(formData.tiktok_followers) : null,
          engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
          location: formData.location || null,
        })
        .eq("id", influencerProfile.id);

      if (error) throw error;
      await refreshProfiles();
      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const totalFollowers = (influencerProfile?.instagram_followers || 0) + (influencerProfile?.youtube_subscribers || 0) + (influencerProfile?.twitter_followers || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your influencer profile and social media presence</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-primary">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                <p className="text-muted-foreground">{influencerProfile?.location || "Location not set"}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNiches.map((niche) => (
                    <Badge key={niche} variant="secondary">{niche}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-yellow-500" /><span className="text-2xl font-bold">{influencerProfile?.rating?.toFixed(1) || "N/A"}</span></div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1"><Users className="w-4 h-4 text-blue-500" /><span className="text-2xl font-bold">{(totalFollowers / 1000).toFixed(0)}K</span></div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-2xl font-bold">{influencerProfile?.engagement_rate || 0}%</span></div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList><TabsTrigger value="basic">Basic Info</TabsTrigger><TabsTrigger value="social">Social Media</TabsTrigger><TabsTrigger value="portfolio">Portfolio</TabsTrigger></TabsList>
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>About You</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Bio</Label><Textarea placeholder="Tell brands about yourself..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} /></div>
                <div className="space-y-2"><Label>Content Niches</Label><div className="flex flex-wrap gap-2">{niches.map((niche) => (<Button key={niche} type="button" variant={selectedNiches.includes(niche) ? "default" : "outline"} size="sm" onClick={() => toggleNiche(niche)}>{niche}</Button>))}</div></div>
                <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Location</Label><Input placeholder="City, Country" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div><div className="space-y-2"><Label>Engagement Rate (%)</Label><Input type="number" step="0.1" placeholder="4.5" value={formData.engagement_rate} onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })} /></div></div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Social Media Accounts</CardTitle><CardDescription>Connect your social media profiles</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="flex items-center gap-2"><Instagram className="w-4 h-4" />Instagram</Label><Input placeholder="@username" value={formData.instagram_handle} onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Instagram Followers</Label><Input type="number" placeholder="50000" value={formData.instagram_followers} onChange={(e) => setFormData({ ...formData, instagram_followers: e.target.value })} /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="flex items-center gap-2"><Youtube className="w-4 h-4" />YouTube</Label><Input placeholder="Channel name" value={formData.youtube_handle} onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value })} /></div>
                  <div className="space-y-2"><Label>YouTube Subscribers</Label><Input type="number" placeholder="100000" value={formData.youtube_subscribers} onChange={(e) => setFormData({ ...formData, youtube_subscribers: e.target.value })} /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="portfolio"><Card><CardHeader><CardTitle>Portfolio</CardTitle><CardDescription>Showcase your best work</CardDescription></CardHeader><CardContent><div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">Portfolio upload coming soon. Add links to your best content samples.</div></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

