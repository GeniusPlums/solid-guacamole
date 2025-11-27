import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { profilesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Building2, Globe, Target, Users } from "lucide-react";

const industries = ["Technology", "Fashion & Apparel", "Beauty & Cosmetics", "Food & Beverage", "Health & Fitness", "Travel & Tourism", "Entertainment", "Finance", "Education", "E-commerce", "Gaming", "Automotive", "Real Estate", "Other"];
const targetAudiences = ["Gen Z (18-24)", "Millennials (25-40)", "Gen X (41-56)", "Baby Boomers (57+)", "Parents", "Students", "Professionals", "Entrepreneurs", "Gamers", "Fitness Enthusiasts"];
const campaignGoals = ["Brand Awareness", "Product Launch", "Sales/Conversions", "Lead Generation", "Community Building", "Content Creation", "Event Promotion", "App Downloads"];

export default function BrandProfile() {
  const { profile, brandProfile, refreshProfiles } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [formData, setFormData] = useState({ companyName: "", description: "", industry: "", website: "", logoUrl: "" });

  useEffect(() => {
    if (brandProfile) {
      setFormData({
        companyName: brandProfile.companyName || "",
        description: brandProfile.description || "",
        industry: brandProfile.industry || "",
        website: brandProfile.website || "",
        logoUrl: brandProfile.logoUrl || "",
      });
    }
  }, [brandProfile]);

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await profilesApi.saveBrandProfile({
        companyName: formData.companyName,
        description: formData.description || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        logoUrl: formData.logoUrl || undefined,
      });
      await refreshProfiles();
      toast({ title: "Profile updated", description: "Your brand profile has been saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Brand Profile</h1>
            <p className="text-muted-foreground">Manage your brand information and campaign preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-primary">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.logoUrl || profile?.avatarUrl || ""} />
                <AvatarFallback className="text-2xl"><Building2 className="w-10 h-10" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{formData.companyName || "Your Company"}</h2>
                <p className="text-muted-foreground">{formData.industry || "Industry not set"}</p>
                {formData.website && (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="w-4 h-4" />{formData.website}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="targeting">Target Audience</TabsTrigger>
            <TabsTrigger value="goals">Campaign Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input placeholder="Your Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{industries.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input type="url" placeholder="https://yourcompany.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>About Your Brand</Label>
                  <Textarea placeholder="Tell influencers about your brand..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Target Audience</CardTitle>
                <CardDescription>Select the audience demographics you typically want to reach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {targetAudiences.map((a) => (<Button key={a} type="button" variant={selectedAudiences.includes(a) ? "default" : "outline"} size="sm" onClick={() => toggleItem(a, selectedAudiences, setSelectedAudiences)}>{a}</Button>))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Campaign Goals</CardTitle>
                <CardDescription>What do you typically want to achieve with influencer campaigns?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {campaignGoals.map((g) => (<Button key={g} type="button" variant={selectedGoals.includes(g) ? "default" : "outline"} size="sm" onClick={() => toggleItem(g, selectedGoals, setSelectedGoals)}>{g}</Button>))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

