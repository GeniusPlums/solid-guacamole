import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCampaigns, useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Target, Calendar, DollarSign, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

const niches = ["Fashion", "Beauty", "Tech", "Gaming", "Fitness", "Food", "Travel", "Lifestyle"];

export default function BrandCampaigns() {
  const navigate = useNavigate();
  const { brandProfile } = useAuth();
  const { data: campaigns, isLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    target_niche: [] as string[],
    target_platforms: [] as string[],
    min_followers: "",
    start_date: "",
    end_date: "",
  });

  const handleCreateCampaign = async () => {
    if (!brandProfile) return;

    await createCampaign.mutateAsync({
      brand_id: brandProfile.id,
      title: formData.title,
      description: formData.description || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      target_niche: formData.target_niche,
      target_platforms: formData.target_platforms,
      min_followers: formData.min_followers ? parseInt(formData.min_followers) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: "draft",
    });

    setIsDialogOpen(false);
    setFormData({
      title: "", description: "", budget: "", target_niche: [],
      target_platforms: [], min_followers: "", start_date: "", end_date: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "paused": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your influencer marketing campaigns</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new influencer marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Campaign Title *</Label>
                  <Input
                    placeholder="Summer Product Launch"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your campaign goals and requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Followers</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={formData.min_followers}
                      onChange={(e) => setFormData({ ...formData, min_followers: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-primary"
                  onClick={handleCreateCampaign}
                  disabled={!formData.title || createCampaign.isPending}
                >
                  {createCampaign.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <Badge className={getStatusColor(campaign.status || "draft")}>{campaign.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{campaign.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${campaign.budget?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.min_followers?.toLocaleString() || "Any"}+</span>
                    </div>
                  </div>
                  {campaign.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(campaign.start_date), "MMM d, yyyy")}</span>
                      {campaign.end_date && <span>- {format(new Date(campaign.end_date), "MMM d, yyyy")}</span>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/brand/discover")}>
                      Find Influencers
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => updateCampaign.mutate({ id: campaign.id, status: campaign.status === "active" ? "paused" : "active" })}
                    >
                      {campaign.status === "active" ? "Pause" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No campaigns yet. Create your first campaign to get started!</p></CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}

