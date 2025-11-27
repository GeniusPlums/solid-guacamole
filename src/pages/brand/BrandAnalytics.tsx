import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useBrandAnalytics } from "@/hooks/useAnalytics";
import { TrendingUp, Users, DollarSign, Target, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function BrandAnalytics() {
  const { data: analytics, isLoading, error } = useBrandAnalytics();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="text-lg mb-2">Unable to load analytics</p>
          <p className="text-sm">Please make sure the server is running</p>
        </div>
      </DashboardLayout>
    );
  }

  const summary = analytics?.summary || { totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0, activeCollabs: 0, pendingCollabs: 0, completedCollabs: 0, totalCollabs: 0 };
  const monthlyData = analytics?.monthlyData || [];
  const nicheDistribution = analytics?.nicheDistribution || [];
  const campaignPerformance = analytics?.campaignPerformance || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your influencer marketing performance and ROI</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard title="Total Campaigns" value={summary.totalCampaigns} icon={Target} description={`${summary.activeCampaigns} active`} />
          <StatCard title="Active Collabs" value={summary.activeCollabs} icon={Users} description={`${summary.pendingCollabs} pending`} />
          <StatCard title="Total Spend" value={`$${summary.totalSpend.toLocaleString()}`} icon={DollarSign} description="Completed collaborations" />
          <StatCard title="Completed Collabs" value={summary.completedCollabs} icon={TrendingUp} description="Successful partnerships" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spend</CardTitle>
              <CardDescription>Collaboration spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Spend']} />
                      <Area type="monotone" dataKey="spend" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No spending data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Budget allocation by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {campaignPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Budget']} />
                      <Bar dataKey="spend" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No campaigns yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Influencer Niche Distribution</CardTitle>
              <CardDescription>Breakdown by content category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {nicheDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={nicheDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {nicheDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No niche data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Collaborations</CardTitle>
              <CardDescription>Number of collaborations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="collaborations" fill="#FF8042" name="Total" />
                      <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No collaboration data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

