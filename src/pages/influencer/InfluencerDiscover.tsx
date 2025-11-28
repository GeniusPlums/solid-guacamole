import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { campaignDiscoveryApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, Loader2, Building2, DollarSign, Calendar, Target, Users, TrendingUp } from "lucide-react";

const niches = [
  "Fashion", "Beauty", "Tech", "Gaming", "Fitness", "Food", "Travel",
  "Lifestyle", "Music", "Art", "Business", "Education", "Entertainment", "Finance"
];

function formatBudget(budget: number | null): string {
  if (!budget) return "Not specified";
  if (budget >= 1000) return `$${(budget / 1000).toFixed(0)}K`;
  return `$${budget}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export default function InfluencerDiscover() {
  const navigate = useNavigate();
  const { influencerProfile } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns-discover", searchQuery, selectedNiche],
    queryFn: () => campaignDiscoveryApi.getAll({
      search: searchQuery || undefined,
      niche: selectedNiche || undefined,
    }),
  });

  const CampaignCard = ({ campaign }: { campaign: any }) => (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/campaign/${campaign.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={campaign.brand?.logoUrl || campaign.brand?.profile?.avatarUrl || ""} />
              <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{campaign.title}</CardTitle>
              <CardDescription>{campaign.brand?.companyName || "Brand"}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {campaign.targetNiche?.slice(0, 3).map((n: string) => (
            <Badge key={n} variant="outline">{n}</Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="font-medium">{formatBudget(campaign.budget)}</span>
          </div>
          {campaign.targetEngagementRate && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>{campaign.targetEngagementRate}% min</span>
            </div>
          )}
          {campaign.minFollowers && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{formatNumber(campaign.minFollowers)}+ followers</span>
            </div>
          )}
          {campaign.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {campaign.targetPlatforms && campaign.targetPlatforms.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            {campaign.targetPlatforms.map((p: string) => (
              <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discover Campaigns</h1>
          <p className="text-muted-foreground">
            Find brand campaigns that match your niche and audience
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <Label className="mb-3 block">Filter by Niche</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedNiche === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNiche("")}
                  >
                    All
                  </Button>
                  {niches.map((niche) => (
                    <Button
                      key={niche}
                      variant={selectedNiche === niche ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedNiche(niche)}
                    >
                      {niche}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isLoading ? "Searching..." : `Available Campaigns (${campaigns?.length || 0})`}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedNiche
                    ? "Try adjusting your search or filters"
                    : "There are no active campaigns at the moment. Check back later!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

