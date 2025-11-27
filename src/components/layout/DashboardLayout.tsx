import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Users,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Search,
  Target,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const isBrand = profile?.user_type === "brand";
  const isInfluencer = profile?.user_type === "influencer";

  const brandNavItems = [
    { path: "/brand/dashboard", icon: Home, label: "Dashboard" },
    { path: "/brand/discover", icon: Search, label: "Discover" },
    { path: "/brand/campaigns", icon: Target, label: "Campaigns" },
    { path: "/brand/collaborations", icon: Briefcase, label: "Collaborations" },
    { path: "/brand/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/brand/messages", icon: MessageSquare, label: "Messages" },
  ];

  const influencerNavItems = [
    { path: "/influencer/dashboard", icon: Home, label: "Dashboard" },
    { path: "/influencer/profile", icon: User, label: "Profile" },
    { path: "/influencer/collaborations", icon: Briefcase, label: "Collaborations" },
    { path: "/influencer/calendar", icon: Calendar, label: "Calendar" },
    { path: "/influencer/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/influencer/messages", icon: MessageSquare, label: "Messages" },
  ];

  const navItems = isBrand ? brandNavItems : influencerNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate(isBrand ? "/brand/dashboard" : "/influencer/dashboard")}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
              <span className="text-xl font-bold">ICY Platform</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(isActive && "bg-primary/10 text-primary")}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(isBrand ? "/brand/settings" : "/influencer/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

