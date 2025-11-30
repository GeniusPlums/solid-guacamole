import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "brand";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, profile, setUserFromLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    setIsCheckingAuth(false);

    if (isAuthenticated && user) {
      const userProfileType = profile?.userType;
      if (userProfileType === "brand") {
        navigate("/brand/dashboard", { replace: true });
      } else if (userProfileType === "influencer") {
        navigate("/influencer/dashboard", { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, profile, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const result = await authApi.signUp({
        email,
        password,
        name,
        userType: type as 'brand' | 'influencer',
      });

      if (!result.success) throw new Error('Failed to create account');
      await setUserFromLogin(result.session?.user);

      toast({ title: "Success!", description: "Account created successfully." });

      if (type === "brand") {
        navigate("/brand/onboarding", { replace: true });
      } else {
        navigate("/influencer/onboarding", { replace: true });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await authApi.signIn({ email, password });
      if (!result.success) throw new Error('Invalid credentials');

      await setUserFromLogin(result.session?.user, result.brandProfile, result.influencerProfile);
      toast({ title: "Welcome back!", description: "Successfully signed in." });

      const loginUserType = result.session?.user?.profile?.userType;
      if (loginUserType === "brand") {
        navigate("/brand/dashboard", { replace: true });
      } else if (loginUserType === "influencer") {
        navigate("/influencer/dashboard", { replace: true });
      } else {
        navigate("/brand/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isCheckingAuth || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-background text-xl font-bold">ICY</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Welcome to ICY
          </h1>
          <p className="text-muted-foreground">
            {userType === "brand"
              ? "Find the perfect creators for your brand"
              : "Connect with brands and grow your influence"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-secondary/30 rounded-2xl p-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-5 mt-0">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  variant="apple"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5 mt-0">
              <form onSubmit={(e) => handleSignUp(e, userType)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  variant="apple"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating account..."
                    : `Sign Up as ${userType === "brand" ? "Brand" : "Creator"}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;