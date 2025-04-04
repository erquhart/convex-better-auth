import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { useCallback, useMemo, useRef } from "react";

export const createAuthClient = (
  options: Parameters<typeof createBetterAuthClient>[0]
) => {
  if (!options?.baseURL) {
    throw new Error(
      `baseURL should be set to your Convex deployment site URL, which ends in "convex.site".`
    );
  }
  return createBetterAuthClient({
    ...options,
    plugins: [...(options?.plugins || []), jwtClient()],
  });
};

export const useBetterAuth = (
  authClient: ReturnType<typeof createAuthClient>
): (() => {
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: (args: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
}) => {
  return () => {
    const { data: session, isPending: isSessionPending } =
      authClient.useSession();
    const tokenRef = useRef<string | null>(null);
    const fetchAccessToken = useCallback(
      async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        if (forceRefreshToken) {
          const { data } = await authClient.token();
          tokenRef.current = data?.token || null;
          return data?.token || null;
        }
        return tokenRef.current;
      },
      []
    );
    return useMemo(
      () => ({
        isLoading: isSessionPending,
        isAuthenticated: Boolean(session),
        fetchAccessToken,
      }),
      [isSessionPending, session, fetchAccessToken]
    );
  };
};
