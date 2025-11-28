import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUserFromLogin: (sessionUser: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfiles = useCallback(async () => {
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
  }, []);

  const refreshProfiles = useCallback(async () => {
    if (user?.id) {
      await fetchProfiles();
    }
  }, [user?.id, fetchProfiles]);

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setInfluencerProfile(null);
      setBrandProfile(null);
      setIsAuthenticated(false);
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
        setIsAuthenticated(true);
        await fetchProfiles();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfiles]);

  // Set user directly after login (to avoid race condition with navigation)
  const setUserFromLogin = useCallback(async (sessionUser: any) => {
    if (sessionUser) {
      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        user_metadata: sessionUser.profile ? {
          name: sessionUser.profile.fullName,
          user_type: sessionUser.profile.userType,
        } : undefined,
      });
      setIsAuthenticated(true);
      setIsLoading(false);
      // Fetch profiles in background
      fetchProfiles();
    }
  }, [fetchProfiles]);

  useEffect(() => {
    // Check for existing session on mount
    refreshSession();
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    setProfile(null);
    setInfluencerProfile(null);
    setBrandProfile(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        influencerProfile,
        brandProfile,
        isLoading,
        isAuthenticated,
        signOut,
        refreshProfiles,
        refreshSession,
        setUserFromLogin,
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

