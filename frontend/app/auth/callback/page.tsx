"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      console.log("✅ Storing token and updating auth state");
      login(token); // This updates the global auth state
      router.push("/");
    } else {
      router.push("/?error=no_token");
    }
  }, [searchParams, router, login]);

  return <LoadingState message="Completing authentication..." />;
}