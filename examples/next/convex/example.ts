import { query } from "./_generated/server";
import { betterAuthComponent, createAuth } from "./auth";
import { Id } from "./_generated/dataModel";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // This function shows the pure Better Auth way of:
    // - Getting the session
    // - Getting the Better Auth user (effectively metadata for the user)
    // - Merging the application user with metadata
    //
    // You can also use the convenience function from the component for getting
    // the user metadata: betterAuthComponent.getAuthUser(ctx)
    const auth = createAuth(ctx);
    const headers = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers,
    });
    if (!session) {
      return null;
    }
    const userMetadata = await ctx.db.get(session.user.id as Id<"users">);
    return { ...session.user, ...userMetadata };
  },
});
