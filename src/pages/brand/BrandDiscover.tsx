import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InfluencerCard } from "@/components/shared/InfluencerCard";
import { useInfluencers } from "@/hooks/useInfluencers";
import { useAIMatching, useNaturalLanguageSearch } from "@/hooks/useAI";
import { CampaignRequirements } from "@/lib/aiRecommendation";
import { Search, Sparkles, Filter, Loader2, Bot, Wand2 } from "lucide-react";

const niches = [
  "Fashion", "Beauty", "Tech", "Gaming", "Fitness", "Food", "Travel",
  "Lifestyle", "Music", "Art", "Business", "Education", "Entertainment"
];

const platforms = ["Instagram", "YouTube", "TikTok", "Twitter"];

export default function BrandDiscover() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState([10000, 1000000]);
  const [minEngagement, setMinEngagement] = useState(2);

  const { data: influencers, isLoading } = useInfluencers({
    search: searchQuery,
    niche: selectedNiches[0] || undefined,
    platform: selectedPlatforms[0] || undefined,
    minFollowers: followerRange[0],
    minEngagement,
  });

  const { results: aiResults, isAnalyzing, analyzeAndMatch, isAIEnabled } = useAIMatching();
  const naturalLanguageSearch = useNaturalLanguageSearch();

  const handleAISearch = async () => {
    if (!influencers) return;

    const requirements: CampaignRequirements = {
      niche: selectedNiches.length > 0 ? selectedNiches : ["Lifestyle"],
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["instagram"],
      minFollowers: followerRange[0],
      maxFollowers: followerRange[1],
      targetEngagement: minEngagement,
      budget: 10000,
      contentType: "mixed",
      targetAudience: "general",
      campaignGoal: "awareness",
    };

    await analyzeAndMatch(influencers, requirements);
  };

  const handleNaturalLanguageSearch = async () => {
    if (!aiQuery.trim() || !influencers) return;

    try {
      const parsed = await naturalLanguageSearch.mutateAsync(aiQuery);
      const requirements: CampaignRequirements = {
        niche: parsed.niche || ["Lifestyle"],
        platforms: parsed.platforms || ["instagram"],
        minFollowers: parsed.minFollowers || 10000,
        maxFollowers: parsed.maxFollowers || 1000000,
        targetEngagement: parsed.targetEngagement || 3,
        budget: parsed.budget || 10000,
        contentType: "mixed",
        targetAudience: "general",
        campaignGoal: parsed.campaignGoal || "awareness",
      };

      // Update filters based on AI parsing
      if (parsed.niche) setSelectedNiches(parsed.niche);
      if (parsed.minFollowers && parsed.maxFollowers) {
        setFollowerRange([parsed.minFollowers, parsed.maxFollowers]);
      }
      if (parsed.targetEngagement) setMinEngagement(parsed.targetEngagement);

      await analyzeAndMatch(influencers, requirements);
      setShowAIChat(false);
    } catch (error) {
      console.error("AI search error:", error);
    }
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Influencers</h1>
            <p className="text-muted-foreground">
              Find the perfect influencers for your brand using AI-powered matching
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, niche, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={() => setShowAIChat(!showAIChat)}>
                <Bot className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
              <Button className="bg-gradient-primary" onClick={handleAISearch} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AI Match
              </Button>
            </div>

            {/* AI Chat Interface */}
            {showAIChat && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">AI Assistant</p>
                    <p className="text-sm text-muted-foreground">
                      Describe what you're looking for in natural language. For example: "I need fashion influencers with 50k-200k followers for a summer collection launch"
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Describe your ideal influencer match..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleNaturalLanguageSearch}
                    disabled={naturalLanguageSearch.isPending || !aiQuery.trim()}
                    className="bg-gradient-primary"
                  >
                    {naturalLanguageSearch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="mt-6 pt-6 border-t space-y-6">
                <div>
                  <Label className="mb-3 block">Niches</Label>
                  <div className="flex flex-wrap gap-2">
                    {niches.map((niche) => (
                      <Button
                        key={niche}
                        variant={selectedNiches.includes(niche) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleNiche(niche)}
                      >
                        {niche}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-3 block">
                      Followers: {(followerRange[0] / 1000).toFixed(0)}K - {(followerRange[1] / 1000).toFixed(0)}K
                    </Label>
                    <Slider
                      value={followerRange}
                      onValueChange={setFollowerRange}
                      min={1000}
                      max={10000000}
                      step={10000}
                    />
                  </div>
                  <div>
                    <Label className="mb-3 block">Min Engagement Rate: {minEngagement}%</Label>
                    <Slider
                      value={[minEngagement]}
                      onValueChange={(v) => setMinEngagement(v[0])}
                      min={0}
                      max={15}
                      step={0.5}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Match Results */}
        {aiResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">AI-Recommended Matches</h2>
              <span className="text-muted-foreground">({aiResults.length} found)</span>
              {isAIEnabled && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Gemini AI</span>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiResults.slice(0, 9).map((scored) => (
                <Card key={scored.influencer.id} className="hover:shadow-lg transition-all overflow-hidden">
                  <InfluencerCard
                    influencer={scored.influencer}
                    showScore
                    score={scored.overallScore}
                    matchReasons={scored.aiExplanation ? [scored.aiExplanation] : scored.matchReasons}
                    onViewProfile={() => navigate(`/influencer/${scored.influencer.id}`)}
                  />
                  {scored.isLoadingExplanation && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Generating AI insight...</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Results */}
        {aiResults.length === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? "Searching..." : `All Influencers (${influencers?.length || 0})`}
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : influencers && influencers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onViewProfile={() => navigate(`/influencer/${influencer.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No influencers found. Try adjusting your filters or search criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

