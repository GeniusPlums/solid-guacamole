import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Instagram, Youtube, Twitter, Heart, Loader2, Send } from "lucide-react";
import { InfluencerWithProfile } from "@/hooks/useInfluencers";
import { useIsShortlisted, useAddToShortlist, useRemoveFromShortlist } from "@/hooks/useShortlists";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCreateCollaboration } from "@/hooks/useCollaborations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InfluencerCardProps {
  influencer: InfluencerWithProfile;
  onViewProfile?: () => void;
  onContact?: () => void;
  showScore?: boolean;
  score?: number;
  matchReasons?: string[];
  showShortlistButton?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function InfluencerCard({
  influencer,
  onViewProfile,
  onContact,
  showScore,
  score,
  matchReasons,
  showShortlistButton = true,
}: InfluencerCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, brandProfile } = useAuth();
  const isBrand = profile?.userType === "brand";
  const { data: shortlistData } = useIsShortlisted(isBrand ? influencer.id : undefined);
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const isShortlisted = shortlistData?.isShortlisted || false;
  const isShortlistLoading = addToShortlist.isPending || removeFromShortlist.isPending;

  // Collaboration dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collabForm, setCollabForm] = useState({
    campaignId: "",
    offeredAmount: "",
    deliverables: "",
    deadline: "",
    notes: "",
  });
  const { data: campaigns } = useCampaigns();
  const createCollaboration = useCreateCollaboration();
  const hasCampaigns = campaigns && campaigns.length > 0;

  // Support both camelCase (from API) and snake_case (legacy) field names
  const totalFollowers =
    (influencer.instagramFollowers || influencer.instagram_followers || 0) +
    (influencer.youtubeSubscribers || influencer.youtube_subscribers || 0) +
    (influencer.twitterFollowers || influencer.twitter_followers || 0) +
    (influencer.tiktokFollowers || influencer.tiktok_followers || 0);

  // Support both naming conventions for profile data
  const displayName = influencer.profile?.fullName || influencer.profiles?.full_name || influencer.instagramHandle || influencer.instagram_handle || "Influencer";
  const avatarUrl = influencer.profile?.avatarUrl || influencer.profiles?.avatar_url || "";

  const handleShortlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShortlisted) {
      removeFromShortlist.mutate(influencer.id);
    } else {
      addToShortlist.mutate({ influencerId: influencer.id });
    }
  };

  const handleSendRequest = async () => {
    if (!collabForm.campaignId) {
      toast({ title: "Error", description: "Please select a campaign", variant: "destructive" });
      return;
    }

    try {
      await createCollaboration.mutateAsync({
        campaignId: collabForm.campaignId,
        influencerId: influencer.id,
        offeredAmount: collabForm.offeredAmount ? parseFloat(collabForm.offeredAmount) : undefined,
        deliverables: collabForm.deliverables || undefined,
        deadline: collabForm.deadline || undefined,
        notes: collabForm.notes || undefined,
      });

      toast({ title: "Request sent!", description: `Collaboration request sent to ${displayName}` });
      setIsDialogOpen(false);
      setCollabForm({ campaignId: "", offeredAmount: "", deliverables: "", deadline: "", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <CardDescription>{influencer.niche?.join(", ") || "No niche set"}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isBrand && showShortlistButton && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isShortlisted && "text-red-500")}
                onClick={handleShortlistToggle}
                disabled={isShortlistLoading}
              >
                {isShortlistLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={cn("w-4 h-4", isShortlisted && "fill-current")} />
                )}
              </Button>
            )}
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{influencer.rating ? Number(influencer.rating).toFixed(1) : "N/A"}</span>
            </div>
          </div>
        </div>
        {showScore && score !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Match Score</span>
              <span className="font-bold text-primary">{score}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )}
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
            <p className="font-semibold">{influencer.engagementRate || influencer.engagement_rate || 0}%</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {(influencer.instagramHandle || influencer.instagram_handle) && (
            <Badge variant="secondary" className="text-xs">
              <Instagram className="w-3 h-3 mr-1" />
              {formatNumber(influencer.instagramFollowers || influencer.instagram_followers || 0)}
            </Badge>
          )}
          {(influencer.youtubeHandle || influencer.youtube_handle) && (
            <Badge variant="secondary" className="text-xs">
              <Youtube className="w-3 h-3 mr-1" />
              {formatNumber(influencer.youtubeSubscribers || influencer.youtube_subscribers || 0)}
            </Badge>
          )}
          {(influencer.twitterHandle || influencer.twitter_handle) && (
            <Badge variant="secondary" className="text-xs">
              <Twitter className="w-3 h-3 mr-1" />
              {formatNumber(influencer.twitterFollowers || influencer.twitter_followers || 0)}
            </Badge>
          )}
        </div>

        {matchReasons && matchReasons.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Why this match:</p>
            <ul className="text-xs space-y-1">
              {matchReasons.slice(0, 2).map((reason, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-gradient-primary" onClick={onViewProfile}>
            View Profile
          </Button>
          {isBrand && brandProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-1" />
                  Reach Out
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Collaboration Request</DialogTitle>
                  <DialogDescription>Invite {displayName} to collaborate on a campaign</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Select Campaign *</Label>
                    <Select
                      value={collabForm.campaignId}
                      onValueChange={(v) => setCollabForm({ ...collabForm, campaignId: v })}
                      disabled={!hasCampaigns}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={hasCampaigns ? "Choose a campaign" : "No campaigns available"} />
                      </SelectTrigger>
                      <SelectContent>
                        {hasCampaigns ? (
                          campaigns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            <p>No campaigns yet.</p>
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => {
                                setIsDialogOpen(false);
                                navigate("/brand/campaigns/new");
                              }}
                            >
                              Create your first campaign
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Offered Amount ($)</Label>
                    <Input
                      type="number"
                      value={collabForm.offeredAmount}
                      onChange={(e) => setCollabForm({ ...collabForm, offeredAmount: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deliverables</Label>
                    <Input
                      value={collabForm.deliverables}
                      onChange={(e) => setCollabForm({ ...collabForm, deliverables: e.target.value })}
                      placeholder="e.g., 2 Instagram posts, 1 story"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={collabForm.deadline}
                      onChange={(e) => setCollabForm({ ...collabForm, deadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message to Influencer</Label>
                    <Textarea
                      value={collabForm.notes}
                      onChange={(e) => setCollabForm({ ...collabForm, notes: e.target.value })}
                      placeholder="Tell them about your campaign..."
                    />
                  </div>
                  <Button
                    className="w-full bg-gradient-primary"
                    onClick={handleSendRequest}
                    disabled={!collabForm.campaignId || createCollaboration.isPending}
                  >
                    {createCollaboration.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Send Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

