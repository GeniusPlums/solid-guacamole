import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type InfluencerProfile = Tables<"influencer_profiles">;
type BrandProfile = Tables<"brand_profiles">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  influencerProfile: InfluencerProfile | null;
  brandProfile: BrandProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async (userId: string) => {
    // Fetch base profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Fetch type-specific profile
      if (profileData.user_type === "influencer") {
        const { data: influencerData } = await supabase
          .from("influencer_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();
        setInfluencerProfile(influencerData);
        setBrandProfile(null);
      } else if (profileData.user_type === "brand") {
        const { data: brandData } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();
        setBrandProfile(brandData);
        setInfluencerProfile(null);
      }
    }
  };

  const refreshProfiles = async () => {
    if (user?.id) {
      await fetchProfiles(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfiles(session.user.id);
        } else {
          setProfile(null);
          setInfluencerProfile(null);
          setBrandProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setInfluencerProfile(null);
    setBrandProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        influencerProfile,
        brandProfile,
        isLoading,
        signOut,
        refreshProfiles,
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

