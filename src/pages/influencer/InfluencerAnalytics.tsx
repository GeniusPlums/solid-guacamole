import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaborations } from "@/hooks/useCollaborations";
import { TrendingUp, DollarSign, Briefcase, Star, Users, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Sample engagement data
const engagementTrend = [
  { month: "Jan", engagement: 3.2, followers: 45000 },
  { month: "Feb", engagement: 3.5, followers: 48000 },
  { month: "Mar", engagement: 4.1, followers: 52000 },
  { month: "Apr", engagement: 3.8, followers: 55000 },
  { month: "May", engagement: 4.5, followers: 61000 },
  { month: "Jun", engagement: 4.8, followers: 68000 },
];

const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1800 },
  { month: "Mar", earnings: 2400 },
  { month: "Apr", earnings: 1600 },
  { month: "May", earnings: 3200 },
  { month: "Jun", earnings: 2800 },
];

const platformDistribution = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "YouTube", value: 30, color: "#FF0000" },
  { name: "TikTok", value: 20, color: "#000000" },
  { name: "Twitter", value: 5, color: "#1DA1F2" },
];

export default function InfluencerAnalytics() {
  const { influencerProfile } = useAuth();
  const { data: collaborations } = useCollaborations();

  const completedCollabs = collaborations?.filter((c) => c.status === "completed") || [];
  const totalEarnings = completedCollabs.reduce((sum, c) => sum + (c.offered_amount || 0), 0);
  const totalFollowers = (influencerProfile?.instagram_followers || 0) + (influencerProfile?.youtube_subscribers || 0) + (influencerProfile?.twitter_followers || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and growth metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Total Followers"
            value={`${(totalFollowers / 1000).toFixed(1)}K`}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Engagement Rate"
            value={`${influencerProfile?.engagement_rate || 0}%`}
            icon={TrendingUp}
            trend={{ value: 0.3, isPositive: true }}
          />
          <StatCard
            title="Total Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            description="From all collaborations"
          />
          <StatCard
            title="Completed Collabs"
            value={completedCollabs.length}
            icon={Briefcase}
            description="Successful partnerships"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Your engagement rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#0088FE" strokeWidth={2} dot={{ fill: "#0088FE" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>Monthly earnings from collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform & Follower Growth */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Where your audience comes from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
              <CardDescription>Your audience growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="followers" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

