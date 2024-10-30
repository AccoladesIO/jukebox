// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization:
                "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private", // add scopes as needed
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt ({ token, account }) {
            // Add access token to the token object
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session ({ session, token }) {
            // Add access token to the session object
            session.accessToken = token.accessToken;
            return session;
        },
    },
});
