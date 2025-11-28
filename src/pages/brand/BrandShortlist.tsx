import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useShortlists, useRemoveFromShortlist } from "@/hooks/useShortlists";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCreateCollaboration } from "@/hooks/useCollaborations";
import { useToast } from "@/hooks/use-toast";
import { Star, Users, TrendingUp, Trash2, Send, Loader2, Search, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BrandShortlist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: shortlists, isLoading } = useShortlists();
  const removeFromShortlist = useRemoveFromShortlist();
  const { data: campaigns } = useCampaigns();
  const createCollaboration = useCreateCollaboration();
  const hasCampaigns = campaigns && campaigns.length > 0;

  // Dialog state for each influencer
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [collabForm, setCollabForm] = useState({
    campaignId: "",
    offeredAmount: "",
    deliverables: "",
    deadline: "",
    notes: "",
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleSendRequest = async (influencerId: string, displayName: string) => {
    if (!collabForm.campaignId) {
      toast({ title: "Error", description: "Please select a campaign", variant: "destructive" });
      return;
    }

    try {
      await createCollaboration.mutateAsync({
        campaignId: collabForm.campaignId,
        influencerId,
        offeredAmount: collabForm.offeredAmount ? parseFloat(collabForm.offeredAmount) : undefined,
        deliverables: collabForm.deliverables || undefined,
        deadline: collabForm.deadline || undefined,
        notes: collabForm.notes || undefined,
      });

      toast({ title: "Request sent!", description: `Collaboration request sent to ${displayName}` });
      setOpenDialogId(null);
      setCollabForm({ campaignId: "", offeredAmount: "", deliverables: "", deadline: "", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shortlisted Influencers</h1>
            <p className="text-muted-foreground">
              Your saved influencers for potential collaborations
            </p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => navigate("/brand/discover")}>
            <Search className="w-4 h-4 mr-2" />
            Find More
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : shortlists && shortlists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlists.map((item) => {
              const influencer = item.influencer;
              const totalFollowers = (influencer.instagramFollowers || 0) + (influencer.youtubeSubscribers || 0);
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={influencer.profile?.avatarUrl || ""} />
                          <AvatarFallback>{influencer.profile?.fullName?.charAt(0) || "I"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{influencer.profile?.fullName}</CardTitle>
                          <CardDescription className="flex flex-wrap gap-1 mt-1">
                            {influencer.niche?.slice(0, 2).map((n) => (
                              <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
                            ))}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromShortlist.mutate(influencer.id)}
                        disabled={removeFromShortlist.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {influencer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{influencer.bio}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted rounded-lg p-2">
                        <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-semibold">{formatFollowers(totalFollowers)}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-semibold">{influencer.engagementRate || 0}%</p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                        <p className="text-sm font-semibold">{influencer.rating ? Number(influencer.rating).toFixed(1) : "N/A"}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/influencer/${influencer.id}`)}>
                        View Profile
                      </Button>
                      <Dialog
                        open={openDialogId === influencer.id}
                        onOpenChange={(open) => {
                          setOpenDialogId(open ? influencer.id : null);
                          if (!open) {
                            setCollabForm({ campaignId: "", offeredAmount: "", deliverables: "", deadline: "", notes: "" });
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1 bg-gradient-primary">
                            <Send className="w-4 h-4 mr-1" />
                            Reach Out
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Collaboration Request</DialogTitle>
                            <DialogDescription>Invite {influencer.profile?.fullName || "this influencer"} to collaborate</DialogDescription>
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
                                          setOpenDialogId(null);
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
                              onClick={() => handleSendRequest(influencer.id, influencer.profile?.fullName || "this influencer")}
                              disabled={!collabForm.campaignId || createCollaboration.isPending}
                            >
                              {createCollaboration.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Send Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Shortlisted Influencers</h3>
              <p className="text-muted-foreground mb-4">
                Start discovering and saving influencers for your campaigns
              </p>
              <Button className="bg-gradient-primary" onClick={() => navigate("/brand/discover")}>
                <Search className="w-4 h-4 mr-2" />
                Discover Influencers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

