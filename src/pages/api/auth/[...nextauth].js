// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

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
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // Expiration time in ms
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to the old refresh token
        };
    } catch (error) {
        console.error("Failed to refresh access token:", error);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization:
                "https://accounts.spotify.com/authorize?scope=playlist-read-private,playlist-read-collaborative,user-library-read,user-read-private,user-read-email,user-read-playback-state,user-modify-playback-state,user-read-recently-played,user-top-read,user-follow-read,playlist-modify-private,playlist-modify-public", // add scopes as needed
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt ({ token, account }) {
            // Initial sign-in
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = Date.now() + account.expires_in * 1000; // Expiration time in ms
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session ({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
});
