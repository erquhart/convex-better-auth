"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";
import {
  AuthClient,
  AuthProvider,
  useAuth,
  type ConvexAuthClient,
} from "./client";

export function ConvexBetterAuthProvider({
  client,
  authClient,
  children,
}: PropsWithChildren<{
  client: ConvexReactClient;
  authClient: AuthClient;
}>) {
  const convexAuthClient = useMemo(
    () =>
      ({
        verbose: (client as any).options?.verbose,
        logger: client.logger,
      }) satisfies ConvexAuthClient,
    [client]
  );
  return (
    <AuthProvider client={convexAuthClient} authClient={authClient}>
      <ConvexProviderWithAuth client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </AuthProvider>
  );
}

// TODO: Remove, short-lived alias
export { ConvexBetterAuthProvider as ConvexProviderWithBetterAuth };
