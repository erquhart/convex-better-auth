import { BetterAuthClientPlugin, ClientOptions } from "better-auth/client";
import { jwtClient, oneTimeTokenClient } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import isNetworkError from "is-network-error";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ConvexAuthInternalContext = createContext<{
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: ({
    forceRefreshToken,
  }: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
}>(undefined as any);

export function useAuth() {
  return useContext(ConvexAuthInternalContext);
}

export const createAuthClient = <O extends ClientOptions>(
  options: O
): ReturnType<
  typeof createBetterAuthClient<
    O & {
      plugins: O["plugins"] extends BetterAuthClientPlugin[]
        ? [
            ...O["plugins"],
            ReturnType<typeof jwtClient>,
            ReturnType<typeof oneTimeTokenClient>,
          ]
        : [ReturnType<typeof jwtClient>, ReturnType<typeof oneTimeTokenClient>];
    }
  >
> => {
  if (!options?.baseURL) {
    throw new Error(
      `baseURL should be set to your Convex deployment site URL, which ends in "convex.site".`
    );
  }
  return createBetterAuthClient({
    ...options,
    plugins: (options.plugins ?? []).concat(jwtClient(), oneTimeTokenClient()),
  });
};

export function ConvexProviderWithBetterAuth({
  client,
  authClient,
  children,
}: {
  client: ConvexReactClient;
  authClient: ReturnType<typeof createAuthClient>;
  children: ReactNode;
}) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const verbose: boolean = (client as any).options?.verbose ?? false;
  const logVerbose = useCallback(
    (message: string) => {
      if (verbose) {
        console.debug(`${new Date().toISOString()} ${message}`);
        client.logger?.logVerbose(message);
      }
    },
    [verbose]
  );

  useEffect(() => {
    const listener = async (e: Event) => {
      if (isRefreshingToken) {
        // There are 3 different ways to trigger this pop up so just try all of
        // them.

        e.preventDefault();
        // This confirmation message doesn't actually appear in most modern
        // browsers but we tried.
        const confirmationMessage =
          "Are you sure you want to leave? Your changes may not be saved.";
        e.returnValue = true;
        return confirmationMessage;
      }
    };
    browserAddEventListener("beforeunload", listener);
    return () => {
      browserRemoveEventListener("beforeunload", listener);
    };
  });

  const fetchToken = useCallback(async () => {
    const initialBackoff = 100;
    const maxBackoff = 16000;
    let retries = 0;

    const nextBackoff = () => {
      const baseBackoff = initialBackoff * Math.pow(2, retries);
      retries += 1;
      const actualBackoff = Math.min(baseBackoff, maxBackoff);
      const jitter = actualBackoff * (Math.random() - 0.5);
      return actualBackoff + jitter;
    };

    const fetchWithRetry = async () => {
      try {
        const { data } = await authClient.token();
        return data?.token || null;
      } catch (e) {
        if (!isNetworkError(e)) {
          throw e;
        }
        const backoff = nextBackoff();
        logVerbose(
          `verifyCode failed with network error, attempting retrying in ${backoff}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry();
      }
    };

    return fetchWithRetry();
  }, [client]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        setIsRefreshingToken(true);
        const token = await fetchToken().finally(() => {
          setIsRefreshingToken(false);
        });
        logVerbose(`returning retrieved token`);
        return token;
      }
    },
    [fetchToken]
  );

  useEffect(
    () => {
      const token =
        typeof window?.location !== "undefined"
          ? new URLSearchParams(window.location.search).get("ott")
          : null;
      if (token) {
        authClient.oneTimeToken
          .verify({
            token,
          })
          .then((result: any) => {
            console.log("result", result);
          });
      }
    },
    // Explicitly chosen dependencies.
    // This effect should mostly only run once
    // on mount.
    [client]
  );

  const isAuthenticated = session !== null;
  const isLoading = isSessionPending;
  const authState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [fetchAccessToken, isLoading, isAuthenticated]
  );

  return (
    <ConvexAuthInternalContext.Provider value={authState}>
      <ConvexProviderWithAuth client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </ConvexAuthInternalContext.Provider>
  );
}

function browserAddEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  window.addEventListener?.(type, listener, options);
}

function browserRemoveEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | EventListenerOptions
): void {
  window.removeEventListener?.(type, listener, options);
}
