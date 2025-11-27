import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCollaborations, useUpdateCollaboration } from "@/hooks/useCollaborations";
import { Calendar, DollarSign, Loader2, MessageSquare, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function InfluencerCollaborations() {
  const navigate = useNavigate();
  const { data: collaborations, isLoading } = useCollaborations();
  const updateCollaboration = useUpdateCollaboration();

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const pendingCollabs = collaborations?.filter((c) => c.status === "pending") || [];
  const activeCollabs = collaborations?.filter((c) => c.status === "accepted") || [];
  const completedCollabs = collaborations?.filter((c) => c.status === "completed") || [];

  const handleAccept = (id: string) => updateCollaboration.mutate({ id, status: "accepted" });
  const handleReject = (id: string) => updateCollaboration.mutate({ id, status: "rejected" });

  const CollaborationCard = ({ collab, showActions = false }: { collab: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={collab.brand_profiles?.logo_url || ""} />
              <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{collab.brand_profiles?.company_name}</CardTitle>
              <CardDescription>{collab.campaigns?.title}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusBadge(collab.status || "pending")}>
            <span className="capitalize">{collab.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {collab.deliverables && (
          <div>
            <p className="text-sm font-medium mb-1">Deliverables:</p>
            <p className="text-sm text-muted-foreground">{collab.deliverables}</p>
          </div>
        )}
        {collab.notes && (
          <div>
            <p className="text-sm font-medium mb-1">Notes from brand:</p>
            <p className="text-sm text-muted-foreground">{collab.notes}</p>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">${collab.offered_amount?.toLocaleString() || "TBD"}</span>
          </div>
          {collab.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{format(new Date(collab.deadline), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {showActions ? (
            <>
              <Button
                className="flex-1 bg-gradient-primary"
                onClick={() => handleAccept(collab.id)}
                disabled={updateCollaboration.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleReject(collab.id)}
                disabled={updateCollaboration.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
              {collab.status === "accepted" && (
                <Button
                  size="sm"
                  onClick={() => updateCollaboration.mutate({ id: collab.id, status: "completed" })}
                >
                  Mark Complete
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Collaborations</h1>
          <p className="text-muted-foreground">Manage your brand partnerships and requests</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {pendingCollabs.length > 0 && (
                  <Badge className="ml-2 bg-primary">{pendingCollabs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">Active ({activeCollabs.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCollabs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingCollabs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingCollabs.map((collab) => (
                    <CollaborationCard key={collab.id} collab={collab} showActions />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending collaboration requests
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeCollabs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeCollabs.map((collab) => (
                    <CollaborationCard key={collab.id} collab={collab} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No active collaborations
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCollabs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {completedCollabs.map((collab) => (
                    <CollaborationCard key={collab.id} collab={collab} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No completed collaborations yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

