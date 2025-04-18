import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Refresh the access token when expired
async function refreshAccessToken (token) {
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

        const now = Date.now();
        const expiresAt = now + refreshedTokens.expires_in * 1000; // Expiration timestamp in ms

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: expiresAt, // Expiration time in ms
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep the old refresh token if none provided
        };
    } catch (error) {
        console.error("Failed to refresh access token:", error);

        return {
            ...token,
            accessToken: null, // Explicitly invalidate the token if error occurs
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization:
                "https://accounts.spotify.com/authorize?scope=playlist-read-private,playlist-read-collaborative,user-library-read,user-read-private,user-read-email,user-read-playback-state,user-modify-playback-state,user-read-recently-played,user-top-read,user-follow-read,playlist-modify-private,playlist-modify-public",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt ({ token, account }) {
            // Initial sign-in, store access token and refresh token
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = Date.now() + account.expires_in * 1000; // Expiration time in ms
                token.userId = account.providerAccountId; // Spotify user ID
            }

            // If the access token has not expired yet, return the current token
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            // If the token is expired, refresh it
            return refreshAccessToken(token);
        },
        async session ({ session, token }) {
            // Map the token to the session object
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken; // Optional: Include refresh token
            session.error = token.error;
            session.user.id = token.userId; // Include Spotify user ID as user.id
            return session;
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