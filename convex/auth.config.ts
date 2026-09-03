import { AuthConfig } from "convex/server";
import { env } from "./_generated/server";

export default {
  providers: [
    // {
    //   domain: env.CONVEX_SITE_URL,
    //   applicationID: "convex",
    // },
    {
      type: "function",
      name: "password",
      path: "./auth"
    }
  ],
} 
