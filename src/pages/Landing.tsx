import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Target, Zap, BarChart3, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description: "AI-powered algorithm connects brands with the perfect influencers based on niche, engagement, and campaign goals.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track campaign performance, engagement metrics, and ROI with comprehensive real-time analytics.",
    },
    {
      icon: Users,
      title: "Verified Profiles",
      description: "Every influencer is vetted and rated based on engagement, authenticity, and past campaign success.",
    },
    {
      icon: Shield,
      title: "Secure Collaboration",
      description: "Manage contracts, payments, and deliverables all in one secure platform.",
    },
    {
      icon: TrendingUp,
      title: "Growth Insights",
      description: "Data-driven recommendations help optimize your influencer marketing strategy.",
    },
    {
      icon: Zap,
      title: "Quick Discovery",
      description: "Find and connect with influencers in minutes, not weeks. Streamlined workflow for faster results.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
              <span className="text-xl font-bold">ICY Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Influencer Marketing
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Connect Brands with
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Influencers</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                The intelligent platform that matches brands with verified influencers using AI-driven insights. 
                Streamline collaborations, track performance, and maximize your marketing ROI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all"
                  onClick={() => navigate("/auth?type=brand")}
                >
                  I'm a Brand
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate("/auth?type=influencer")}
                >
                  I'm an Influencer
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-20 blur-3xl" />
              <img 
                src={heroImage} 
                alt="Platform Preview" 
                className="relative rounded-2xl shadow-xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make influencer marketing seamless, data-driven, and effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">10K+</div>
              <p className="text-muted-foreground">Verified Influencers</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">500+</div>
              <p className="text-muted-foreground">Active Brands</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">95%</div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of brands and influencers already using ICY Platform to create successful campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
              <span className="font-bold">ICY Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ICY Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;