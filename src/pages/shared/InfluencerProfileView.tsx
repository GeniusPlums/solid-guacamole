import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInfluencer } from "@/hooks/useInfluencers";
import { useCampaigns, useCreateCampaign } from "@/hooks/useCampaigns";
import { useCreateCollaboration } from "@/hooks/useCollaborations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Instagram, Youtube, Twitter, MapPin, Users, TrendingUp, ArrowLeft, MessageSquare, Send, Loader2, Heart, ExternalLink, Link } from "lucide-react";
import { useIsShortlisted, useAddToShortlist, useRemoveFromShortlist } from "@/hooks/useShortlists";
import { cn } from "@/lib/utils";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function InfluencerProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, brandProfile } = useAuth();
  const { data: influencer, isLoading } = useInfluencer(id || "");
  const { data: campaigns } = useCampaigns();
  const isBrand = profile?.userType === "brand";
  const { data: shortlistData } = useIsShortlisted(isBrand && id ? id : undefined);
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const isShortlisted = shortlistData?.isShortlisted || false;
  const isShortlistLoading = addToShortlist.isPending || removeFromShortlist.isPending;
  const createCollaboration = useCreateCollaboration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collabForm, setCollabForm] = useState({
    campaignId: "",
    offeredAmount: "",
    deliverables: "",
    deadline: "",
    notes: "",
  });

  // Check if there are any campaigns available
  const hasCampaigns = campaigns && campaigns.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Influencer not found</p>
      </div>
    );
  }

  // Support both camelCase (from API) and snake_case (legacy) field names
  const totalFollowers =
    (influencer.instagramFollowers || influencer.instagram_followers || 0) +
    (influencer.youtubeSubscribers || influencer.youtube_subscribers || 0) +
    (influencer.twitterFollowers || influencer.twitter_followers || 0);

  // Handle demo profiles that don't have linked profiles table entry - support both naming conventions
  const displayName = influencer.profile?.fullName || influencer.profiles?.full_name || influencer.instagramHandle || influencer.instagram_handle || "Influencer";
  const avatarUrl = influencer.profile?.avatarUrl || influencer.profiles?.avatar_url || "";

  const handleSendRequest = async () => {
    if (!brandProfile || !collabForm.campaignId) return;

    try {
      await createCollaboration.mutateAsync({
        campaignId: collabForm.campaignId,
        influencerId: influencer.id,
        offeredAmount: collabForm.offeredAmount ? parseFloat(collabForm.offeredAmount) : undefined,
        deliverables: collabForm.deliverables || undefined,
        deadline: collabForm.deadline || undefined,
        notes: collabForm.notes || undefined,
      });

      toast({ title: "Request sent!", description: "The influencer will be notified of your collaboration request." });
      setIsDialogOpen(false);
      setCollabForm({ campaignId: "", offeredAmount: "", deliverables: "", deadline: "", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-4xl">{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
                    {influencer.location && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {influencer.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isBrand && (
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(isShortlisted && "text-red-500 border-red-500")}
                        onClick={() => isShortlisted ? removeFromShortlist.mutate(influencer.id) : addToShortlist.mutate({ influencerId: influencer.id })}
                        disabled={isShortlistLoading}
                      >
                        {isShortlistLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", isShortlisted && "fill-current")} />}
                      </Button>
                    )}
                    <div className="flex items-center gap-1 text-xl">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{influencer.rating ? Number(influencer.rating).toFixed(1) : "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {influencer.niche?.map((n) => (<Badge key={n} variant="secondary">{n}</Badge>))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1"><Users className="w-4 h-4" /></div>
                    <p className="text-2xl font-bold">{formatNumber(totalFollowers)}</p>
                    <p className="text-xs text-muted-foreground">Total Followers</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1"><TrendingUp className="w-4 h-4" /></div>
                    <p className="text-2xl font-bold">{influencer.engagementRate || influencer.engagement_rate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{influencer.totalCollaborations || influencer.total_collaborations || 0}</p>
                    <p className="text-xs text-muted-foreground">Collaborations</p>
                  </div>
                </div>
                {profile?.userType === "brand" && brandProfile && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full md:w-auto bg-gradient-primary"><Send className="w-4 h-4 mr-2" />Send Collaboration Request</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Collaboration Request</DialogTitle>
                        <DialogDescription>Invite {displayName} to collaborate</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Select Campaign *</Label>
                          <Select value={collabForm.campaignId} onValueChange={(v) => setCollabForm({ ...collabForm, campaignId: v })} disabled={!hasCampaigns}>
                            <SelectTrigger><SelectValue placeholder={hasCampaigns ? "Choose a campaign" : "No campaigns available"} /></SelectTrigger>
                            <SelectContent>
                              {hasCampaigns ? (
                                campaigns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))
                              ) : (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                  No campaigns available. Create a campaign first.
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {!hasCampaigns && (
                            <p className="text-xs text-muted-foreground">
                              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate("/brand/campaigns")}>Create a campaign</Button> to send collaboration requests.
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Offer Amount ($)</Label><Input type="number" value={collabForm.offeredAmount} onChange={(e) => setCollabForm({ ...collabForm, offeredAmount: e.target.value })} placeholder="5000" /></div>
                          <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={collabForm.deadline} onChange={(e) => setCollabForm({ ...collabForm, deadline: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label>Deliverables</Label><Textarea value={collabForm.deliverables} onChange={(e) => setCollabForm({ ...collabForm, deliverables: e.target.value })} placeholder="2 Instagram posts, 1 Story..." /></div>
                        <div className="space-y-2"><Label>Message to Influencer</Label><Textarea value={collabForm.notes} onChange={(e) => setCollabForm({ ...collabForm, notes: e.target.value })} placeholder="Tell them about your campaign..." /></div>
                        <Button className="w-full bg-gradient-primary" onClick={handleSendRequest} disabled={!collabForm.campaignId || createCollaboration.isPending}>{createCollaboration.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Send Request</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Social */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{influencer.bio || "No bio provided"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(influencer.instagramHandle || influencer.instagram_handle) && (<div className="flex items-center justify-between p-2 rounded-lg bg-muted"><div className="flex items-center gap-2"><Instagram className="w-5 h-5 text-pink-500" /><span>@{influencer.instagramHandle || influencer.instagram_handle}</span></div><span className="font-medium">{formatNumber(influencer.instagramFollowers || influencer.instagram_followers || 0)}</span></div>)}
              {(influencer.youtubeHandle || influencer.youtube_handle) && (<div className="flex items-center justify-between p-2 rounded-lg bg-muted"><div className="flex items-center gap-2"><Youtube className="w-5 h-5 text-red-500" /><span>{influencer.youtubeHandle || influencer.youtube_handle}</span></div><span className="font-medium">{formatNumber(influencer.youtubeSubscribers || influencer.youtube_subscribers || 0)}</span></div>)}
              {(influencer.twitterHandle || influencer.twitter_handle) && (<div className="flex items-center justify-between p-2 rounded-lg bg-muted"><div className="flex items-center gap-2"><Twitter className="w-5 h-5 text-blue-500" /><span>@{influencer.twitterHandle || influencer.twitter_handle}</span></div><span className="font-medium">{formatNumber(influencer.twitterFollowers || influencer.twitter_followers || 0)}</span></div>)}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Links */}
        {influencer.content_samples && influencer.content_samples.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {influencer.content_samples.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-primary truncate">{link}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

