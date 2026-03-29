"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/supabase-client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.hash);
      
      if (error) {
        console.error("Auth callback error:", error);
        router.push('/?error=auth_failed');
        return;
      }

      // Get user and check if they have an organization
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .limit(1);

        if (!orgs || orgs.length === 0) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
