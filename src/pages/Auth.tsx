import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "brand";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, profile, setUserFromLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect authenticated users away from auth page
  useEffect(() => {
    // Wait for auth loading to complete before checking
    if (authLoading) {
      return;
    }

    setIsCheckingAuth(false);

    // If user is authenticated, redirect to appropriate dashboard
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

      if (!result.success) {
        throw new Error('Failed to create account');
      }

      // Update auth context with the new user before navigation
      await setUserFromLogin(result.session?.user);

      toast({
        title: "Success!",
        description: "Account created successfully.",
      });

      // Navigate to onboarding
      if (type === "brand") {
        navigate("/brand/onboarding", { replace: true });
      } else {
        navigate("/influencer/onboarding", { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

      if (!result.success) {
        throw new Error('Invalid credentials');
      }

      // Update auth context with the new user and profiles before navigation
      // This avoids an extra API call to fetch profiles
      await setUserFromLogin(result.session?.user, result.brandProfile, result.influencerProfile);

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      // Navigate based on user type
      const loginUserType = result.session?.user?.profile?.userType;
      if (loginUserType === "brand") {
        navigate("/brand/dashboard", { replace: true });
      } else if (loginUserType === "influencer") {
        navigate("/influencer/dashboard", { replace: true });
      } else {
        // Default to brand dashboard if type unknown
        navigate("/brand/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication status
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message (this should be brief)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome to ICY Platform</CardTitle>
          <CardDescription className="text-center">
            {userType === "brand" ? "Find the perfect influencers for your brand" : "Connect with brands and grow your influence"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
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
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={(e) => handleSignUp(e, userType)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
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
                  <Label htmlFor="signup-email">Email</Label>
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
                  <Label htmlFor="signup-password">Password</Label>
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
                <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    `Sign Up as ${userType === "brand" ? "Brand" : "Influencer"}`
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground"
            >
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;