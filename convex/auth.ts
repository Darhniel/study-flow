import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signUp, store } = convexAuth({
    providers: [
        Password({
            profileParams: {
                email: {required: true},
                password: {required: true}
            },
            enableSignUp: true
        }) 
    ],
});