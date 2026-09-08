import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {getAuthUserId} from "@convex-dev/auth/server";

export async function getAuthenticatedUser(
    ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
    try {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        return userId;
    } catch (error) {
        console.error("Error getting authenticated user: ", error);
        return null;
    }
    
}

export async function getAuthenticatedUserOrThrow(
    ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
    const userId = await getAuthenticatedUser(ctx);
    if (!userId) {
        throw new Error("Not authenticated");
    }
    return userId;
}

export async function getAuthenticatedUserId(
    ctx: QueryCtx | MutationCtx
): Promise<string | null> {
    const userId = await getAuthenticatedUser(ctx);
    return userId ?? null;
}