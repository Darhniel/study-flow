import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./authHelpers";

export const viewer = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthenticatedUser(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        if (!user) return null;
        return {
            _id: user._id,
            email: user.email,
            name: user.name,
        };
    },
});
