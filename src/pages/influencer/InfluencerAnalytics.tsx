import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useInfluencerAnalytics } from "@/hooks/useAnalytics";
import { TrendingUp, DollarSign, Briefcase, Star, Users, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function InfluencerAnalytics() {
  const { data: analytics, isLoading } = useInfluencerAnalytics();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const summary = analytics?.summary || { totalFollowers: 0, engagementRate: 0, totalEarnings: 0, completedCollabs: 0, activeCollabs: 0, pendingCollabs: 0, rating: 0 };
  const monthlyData = analytics?.monthlyData || [];
  const platformDistribution = analytics?.platformDistribution || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and growth metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard title="Total Followers" value={summary.totalFollowers > 1000 ? `${(summary.totalFollowers / 1000).toFixed(1)}K` : summary.totalFollowers} icon={Users} description="Across all platforms" />
          <StatCard title="Engagement Rate" value={`${summary.engagementRate}%`} icon={TrendingUp} description="Average engagement" />
          <StatCard title="Total Earnings" value={`$${summary.totalEarnings.toLocaleString()}`} icon={DollarSign} description="From completed collabs" />
          <StatCard title="Completed Collabs" value={summary.completedCollabs} icon={Briefcase} description={`${summary.activeCollabs} active, ${summary.pendingCollabs} pending`} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>Monthly earnings from collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                      <Bar dataKey="earnings" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No earnings data yet. Complete collaborations to see earnings.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Collaborations</CardTitle>
              <CardDescription>Completed collaborations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="collaborations" stroke="#0088FE" strokeWidth={2} dot={{ fill: "#0088FE" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No collaboration data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Your followers by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {platformDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {platformDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Followers']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Add social media accounts in your profile to see distribution</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Your overall performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Rating</span>
                  <span className="font-bold flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{summary.rating > 0 ? summary.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Total Earnings</span>
                  <span className="font-bold text-green-600">${summary.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="font-bold">{summary.engagementRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Active Collaborations</span>
                  <span className="font-bold">{summary.activeCollabs}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

