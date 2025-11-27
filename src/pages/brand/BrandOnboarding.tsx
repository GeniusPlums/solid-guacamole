import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";

const industries = [
  "Technology",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Beverage",
  "Health & Fitness",
  "Travel & Tourism",
  "Entertainment",
  "Finance",
  "Education",
  "E-commerce",
  "Gaming",
  "Automotive",
  "Real Estate",
  "Other",
];

export default function BrandOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfiles } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("brand_profiles").insert({
        user_id: user.id,
        company_name: formData.company_name,
        industry: formData.industry,
        website: formData.website || null,
        description: formData.description || null,
      });

      if (error) throw error;

      await refreshProfiles();
      
      toast({
        title: "Welcome aboard!",
        description: "Your brand profile has been created successfully.",
      });

      navigate("/brand/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Brand Profile</CardTitle>
          <CardDescription>
            Tell us about your brand to get personalized influencer recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="Acme Inc."
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
                required
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Brand</Label>
              <Textarea
                id="description"
                placeholder="Tell us what your brand does and what you're looking for in influencer partnerships..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating profile...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

