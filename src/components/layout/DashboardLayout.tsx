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
  Briefcase,
  BarChart3,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  User,
  Search,
  Target,
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

  const isBrand = profile?.userType === "brand";

  const brandNavItems = [
    { path: "/brand/dashboard", icon: Home, label: "Dashboard" },
    { path: "/brand/discover", icon: Search, label: "Discover" },
    { path: "/brand/shortlist", icon: Heart, label: "Shortlist" },
    { path: "/brand/campaigns", icon: Target, label: "Campaigns" },
    { path: "/brand/collaborations", icon: Briefcase, label: "Collaborations" },
    { path: "/brand/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/brand/messages", icon: MessageSquare, label: "Messages" },
  ];

  // Calendar removed from influencer navigation
  const influencerNavItems = [
    { path: "/influencer/dashboard", icon: Home, label: "Dashboard" },
    { path: "/influencer/discover", icon: Search, label: "Discover" },
    { path: "/influencer/profile", icon: User, label: "Profile" },
    { path: "/influencer/collaborations", icon: Briefcase, label: "Collaborations" },
    { path: "/influencer/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/influencer/messages", icon: MessageSquare, label: "Messages" },
  ];

  const navItems = isBrand ? brandNavItems : influencerNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Apple-style Header */}
      <header className="apple-nav-blur border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate(isBrand ? "/brand/dashboard" : "/influencer/dashboard")}
            >
              <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-background text-sm font-bold">Fiery</span>
              </div>
            </div>

            {/* Desktop Navigation - Apple minimal style */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm font-normal rounded-lg transition-all duration-200",
                      isActive
                        ? "text-foreground bg-secondary/80"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-secondary/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatarUrl || ""} />
                    <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">
                      {profile?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-apple-lg border-border/50 p-1">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{profile?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={() => navigate(isBrand ? "/brand/profile" : "/influencer/profile")}
                  className="rounded-lg cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(isBrand ? "/brand/settings" : "/influencer/settings")}
                  className="rounded-lg cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content with generous padding */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
    </div>
  );
}

