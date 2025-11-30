import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Target, Zap, BarChart3, Shield, ArrowRight, Sparkles, Check } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithms find the perfect influencer-brand partnerships based on audience, engagement, and goals.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track every metric that matters. From reach to ROI, get insights that drive smarter decisions.",
    },
    {
      icon: Users,
      title: "Verified Creators",
      description: "Every influencer is authenticated and rated. Work with creators you can trust.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for your campaigns, contracts, and communications.",
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description: "Data-driven recommendations to scale your influencer marketing strategy.",
    },
    {
      icon: Zap,
      title: "Instant Discovery",
      description: "Find and connect with the right influencers in minutes, not weeks.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Verified Creators" },
    { value: "500+", label: "Active Brands" },
    { value: "95%", label: "Success Rate" },
    { value: "$50M+", label: "Campaign Value" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Apple-style Navigation */}
      <nav className="apple-nav-blur border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background text-sm font-bold">ICY</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/marketplace")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Marketplace
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </button>
              <Button
                variant="apple"
                size="sm"
                onClick={() => navigate("/auth")}
                className="h-8 px-4"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Apple style with large typography */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1]">
              Influencer marketing.
              <br />
              <span className="text-muted-foreground">Reimagined.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The intelligent platform that connects brands with creators.
              Powered by AI. Built for results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="apple"
                size="lg"
                onClick={() => navigate("/auth?type=brand")}
                className="text-base"
              >
                Start as Brand
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth?type=influencer")}
                className="text-base"
              >
                Join as Creator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal Apple style */}
      <section className="py-16 border-t border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-1">
                <div className="text-4xl md:text-5xl font-semibold tracking-tight">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Large cards with ample whitespace */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Everything you need.
              <br />
              <span className="text-muted-foreground">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools designed with simplicity in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Apple-style numbered steps */}
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              How it works.
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: "01", title: "Create Profile", desc: "Sign up and tell us about your brand or creator profile." },
              { step: "02", title: "Discover & Match", desc: "Our AI finds the perfect partnerships for your goals." },
              { step: "03", title: "Collaborate", desc: "Connect, create campaigns, and track results in real-time." },
            ].map((item, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="text-5xl font-light text-muted-foreground/40 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section - Clean and minimal */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-foreground text-background p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Join thousands of brands and creators building successful partnerships on ICY.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                  onClick={() => navigate("/auth")}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-70">
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Free to start</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> No credit card</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal Apple style */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
                <span className="text-background text-xs font-bold">ICY</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 ICY Platform. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;