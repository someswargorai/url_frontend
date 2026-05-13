import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import axios from "axios";
import { DefaultSession, NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";

export const dynamic = "force-dynamic";

type UserType = {
    id: string;
    name: string;
    email: string;
    access_token: string;
};

type CustomToken = {
    email?: string;
    name?: string;
    id?: string;
    access_token: string;
};

export interface CustomSession extends DefaultSession {
    email?: string;
    name?: string;
    id?: string;
    access_token: string;
}

async function loginToBackend(payload_email: string, payload_name: string): Promise<UserType> {
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        { email: payload_email, name: payload_name }
    );

    if (!res?.data?.success) {
        throw new Error("Backend login failed");
    }

    console.log("response", res?.data);
    const { id, name, email, access_token } = res.data.user;

    return {
        id,
        name,
        email,
        access_token,
    };
}

export const authOptions: NextAuthOptions = {
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    return await loginToBackend(profile.email, profile.name);
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        throw new Error(err?.response?.data?.message ?? "Google login failed");
                    }
                    throw err;
                }
            },
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    if (!profile.email) {
                        throw new Error("No email found on GitHub account. Make sure your email is public.");
                    }
                    return await loginToBackend(profile.email, `${profile?.given_name} ${profile?.family_name}`);
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        throw new Error(err?.response?.data?.message ?? "GitHub login failed");
                    }
                    throw err;
                }
            },
        }),

        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    return await loginToBackend(profile.email, profile.name);
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        throw new Error(err?.response?.data?.message ?? "LinkedIn login failed");
                    }
                    throw err;
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as UserType;
                token.access_token = u.access_token;
                token.id = u.id;
                token.name = u.name;
                token.email = u.email;
            }
            return token;
        },

        async session({ session, token }) {
            const customSession = session as CustomSession;
            const customToken = token as CustomToken;

            customSession.access_token = customToken.access_token;
            customSession.id = customToken.id;
            customSession.name = customToken.name;
            customSession.email = customToken.email;

            return customSession;
        },
    },

    pages: {
        signIn: "/login",
        error: "/auth-error",
    },

    debug: process.env.NODE_ENV === "development",
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };