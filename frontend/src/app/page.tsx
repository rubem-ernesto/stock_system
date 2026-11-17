"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getStoredTokens } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const { accessToken } = getStoredTokens();
      if (accessToken || user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [loading, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">A carregar o Stock System...</p>
      </div>
    </div>
  );
}
