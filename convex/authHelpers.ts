import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getAuthenticatedUser(
    ctx: QueryCtx | MutationCtx
): Promise<string> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    return identity.subject;
}

export async function getAuthenticatedUserId(
    ctx: QueryCtx | MutationCtx
): Promise<string> {
    return await getAuthenticatedUser(ctx);
}