// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { VSCodeLayout } from "@/components/layout/VSCodeLayout";
import { WelcomeScreen } from "@/components/auth/WelcomeScreen";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vscode-dark flex items-center justify-center">
        <div className="text-vscode-text">Loading...</div>
      </div>
    );
  }

  // Show welcome screen if not authenticated
  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  // Show main app if authenticated
  return <VSCodeLayout />;
}