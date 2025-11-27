import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, profilesApi, getToken } from "@/lib/api";
import type { Profile, InfluencerProfile, BrandProfile } from "@/db/types";

// User type for JWT auth (simplified from Supabase User)
interface User {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  user_metadata?: {
    name?: string;
    user_type?: string;
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  influencerProfile: InfluencerProfile | null;
  brandProfile: BrandProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const data = await profilesApi.getMe();

      if (data.profile) {
        setProfile(data.profile);

        if (data.influencerProfile) {
          setInfluencerProfile(data.influencerProfile);
          setBrandProfile(null);
        } else if (data.brandProfile) {
          setBrandProfile(data.brandProfile);
          setInfluencerProfile(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    }
  };

  const refreshProfiles = async () => {
    if (user?.id) {
      await fetchProfiles();
    }
  };

  const refreshSession = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const session = await authApi.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.profile ? {
            name: session.user.profile.fullName,
            user_type: session.user.profile.userType,
          } : undefined,
        });
        await fetchProfiles();
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    refreshSession();
  }, []);

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setProfile(null);
    setInfluencerProfile(null);
    setBrandProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        influencerProfile,
        brandProfile,
        isLoading,
        signOut,
        refreshProfiles,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook to set user after sign in/up (called from Auth.tsx)
export function useSetAuthUser() {
  const context = useContext(AuthContext);
  return (user: User | null, profile?: Profile | null) => {
    // This is a workaround - in production you'd want a proper state update mechanism
    // For now, we'll refresh the page which will trigger the useEffect
    window.location.reload();
  };
}

