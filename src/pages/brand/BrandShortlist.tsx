import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useShortlists, useRemoveFromShortlist } from "@/hooks/useShortlists";
import { Star, Users, TrendingUp, Trash2, MessageSquare, Loader2, Search, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BrandShortlist() {
  const navigate = useNavigate();
  const { data: shortlists, isLoading } = useShortlists();
  const removeFromShortlist = useRemoveFromShortlist();

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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
                      <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => navigate("/brand/messages")}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
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

