import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "@convex-dev/better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  plugins: [magicLinkClient(), emailOTPClient(), twoFactorClient()],
});
