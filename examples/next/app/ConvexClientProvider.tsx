"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/app/auth-client";
import { ConvexProviderWithBetterAuth } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithBetterAuth client={convex} authClient={authClient}>
      {children}
    </ConvexProviderWithBetterAuth>
  );
}
