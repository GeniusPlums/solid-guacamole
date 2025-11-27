import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollaborations } from "@/hooks/useCollaborations";
import { BarChart3, TrendingUp, Users, DollarSign, Target, Eye } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Sample data for charts
const engagementData = [
  { month: "Jan", engagement: 2.4, reach: 45000 },
  { month: "Feb", engagement: 3.1, reach: 52000 },
  { month: "Mar", engagement: 2.8, reach: 48000 },
  { month: "Apr", engagement: 3.5, reach: 61000 },
  { month: "May", engagement: 4.2, reach: 78000 },
  { month: "Jun", engagement: 3.8, reach: 69000 },
];

const campaignPerformance = [
  { name: "Summer Launch", roi: 340, spend: 5000 },
  { name: "Holiday Promo", roi: 280, spend: 8000 },
  { name: "Brand Awareness", roi: 420, spend: 3000 },
  { name: "Product Review", roi: 380, spend: 4500 },
];

const nicheDistribution = [
  { name: "Fashion", value: 35, color: "#0088FE" },
  { name: "Tech", value: 25, color: "#00C49F" },
  { name: "Lifestyle", value: 20, color: "#FFBB28" },
  { name: "Fitness", value: 15, color: "#FF8042" },
  { name: "Other", value: 5, color: "#8884D8" },
];

export default function BrandAnalytics() {
  const { data: campaigns } = useCampaigns();
  const { data: collaborations } = useCollaborations();

  const totalSpend = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
  const completedCollabs = collaborations?.filter((c) => c.status === "completed").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your influencer marketing performance and ROI</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Total Campaigns"
            value={campaigns?.length || 0}
            icon={Target}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Completed Collabs"
            value={completedCollabs}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Spend"
            value={`$${totalSpend.toLocaleString()}`}
            icon={DollarSign}
            description="Across all campaigns"
          />
          <StatCard
            title="Avg. Engagement"
            value="3.8%"
            icon={TrendingUp}
            trend={{ value: 0.5, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Average engagement rate across campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="engagement" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Campaign ROI */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign ROI</CardTitle>
              <CardDescription>Return on investment by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="roi" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Niche Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Influencer Niche Distribution</CardTitle>
              <CardDescription>Breakdown by content category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nicheDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {nicheDistribution.map((entry, index) => (
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
              <CardTitle>Reach & Impressions</CardTitle>
              <CardDescription>Monthly reach across campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="reach" stroke="#FF8042" fill="#FF8042" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

