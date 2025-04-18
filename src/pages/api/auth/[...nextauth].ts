/* eslint-disable @typescript-eslint/no-unused-vars */


import NextAuth, { AuthOptions, Session, User } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

// Extend the JWT token type
interface ExtendedToken extends JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string;
    error?: string;
}

// Extend the Session type
interface ExtendedSession extends Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

// Refresh the access token when expired
async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
    try {
        const url = "https://accounts.spotify.com/api/token";

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw new Error(refreshedTokens.error_description || "Failed to refresh token");
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Failed to refresh access token:", error);

        return {
            ...token,
            accessToken: "",
            error: "RefreshAccessTokenError",
        };
    }
}

// Strongly typed AuthOptions
export const authOptions: AuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization:
                "https://accounts.spotify.com/authorize?scope=playlist-read-private,playlist-read-collaborative,user-library-read,user-read-private,user-read-email,user-read-playback-state,user-modify-playback-state,user-read-recently-played,user-top-read,user-follow-read,playlist-modify-private,playlist-modify-public",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }): Promise<ExtendedToken> {
            // Initial sign-in
            if (account) {
                return {
                    ...token,
                    accessToken: account.access_token!,
                    refreshToken: account.refresh_token!,
                    accessTokenExpires: Date.now() + Number(account.expires_in) * 1000,
                    userId: account.providerAccountId!,
                };
            }

            // Token not expired yet
            if (Date.now() < (token as ExtendedToken).accessTokenExpires) {
                return token as ExtendedToken;
            }

            // Token expired, refresh it
            return refreshAccessToken(token as ExtendedToken);
        },

        async session({ session, token }): Promise<ExtendedSession> {
            const extendedToken = token as ExtendedToken;

            return {
                ...session,
                accessToken: extendedToken.accessToken,
                refreshToken: extendedToken.refreshToken,
                error: extendedToken.error,
                user: {
                    ...session.user,
                    id: extendedToken.userId,
                },
            };
        },
    },
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
};

export default NextAuth(authOptions);
