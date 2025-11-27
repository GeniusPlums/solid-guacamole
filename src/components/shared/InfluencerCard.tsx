import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Instagram, Youtube, Twitter, Heart, Loader2 } from "lucide-react";
import { InfluencerWithProfile } from "@/hooks/useInfluencers";
import { useIsShortlisted, useAddToShortlist, useRemoveFromShortlist } from "@/hooks/useShortlists";
import { useAuth } from "@/contexts/AuthContext";
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
  const { profile } = useAuth();
  const isBrand = profile?.userType === "brand";
  const { data: shortlistData } = useIsShortlisted(isBrand ? influencer.id : undefined);
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const isShortlisted = shortlistData?.isShortlisted || false;
  const isShortlistLoading = addToShortlist.isPending || removeFromShortlist.isPending;

  const totalFollowers =
    (influencer.instagram_followers || 0) +
    (influencer.youtube_subscribers || 0) +
    (influencer.twitter_followers || 0) +
    (influencer.tiktok_followers || 0);

  const displayName = influencer.profiles?.full_name || influencer.instagram_handle || "Influencer";
  const avatarUrl = influencer.profiles?.avatar_url || "";

  const handleShortlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShortlisted) {
      removeFromShortlist.mutate(influencer.id);
    } else {
      addToShortlist.mutate({ influencerId: influencer.id });
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
              <span className="font-semibold">{influencer.rating?.toFixed(1) || "N/A"}</span>
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
            <p className="font-semibold">{influencer.engagement_rate || 0}%</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {influencer.instagram_handle && (
            <Badge variant="secondary" className="text-xs">
              <Instagram className="w-3 h-3 mr-1" />
              {formatNumber(influencer.instagram_followers || 0)}
            </Badge>
          )}
          {influencer.youtube_handle && (
            <Badge variant="secondary" className="text-xs">
              <Youtube className="w-3 h-3 mr-1" />
              {formatNumber(influencer.youtube_subscribers || 0)}
            </Badge>
          )}
          {influencer.twitter_handle && (
            <Badge variant="secondary" className="text-xs">
              <Twitter className="w-3 h-3 mr-1" />
              {formatNumber(influencer.twitter_followers || 0)}
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
          {onContact && (
            <Button variant="outline" onClick={onContact}>
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

