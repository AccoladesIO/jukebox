import { getSession } from "next-auth/react";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// Define interfaces
interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: { filter_enabled: boolean; filter_locked: boolean };
    external_urls: { spotify: string };
    followers: { href: string; total: number };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

// Centralized Spotify API setup
const spotifyApi = (accessToken: string) =>
    axios.create({
        baseURL: "https://api.spotify.com/v1",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    // Ensure the method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Get the session
    console.log("Session:", session);  // Log the session for debugging


    // If no session or access token, return 401 (Unauthorized)
    if (!session || !session.accessToken) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    const accessToken = session.accessToken;

    try {
        // Fetch user profile
        const profile = await fetchProfile(accessToken);
        console.log("User Profile:", profile);  // Log the user profile for debugging
        const userId = profile.id;

        // Fetch top artists
        const topArtists = await getTopArtists(accessToken);
        const artistIds = topArtists.map((artist: { id: string }) => artist.id);

        // Fetch top tracks from the artists
        const tracks = await getTopTracksFromArtists(accessToken, artistIds);

        // Check if playlist name is provided in the request body
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Playlist name is required" });
        }

        // Create playlist
        const playlist = await createPlaylist(accessToken, userId, name);
        console.log("Created Playlist:", playlist);  // Log created playlist details

        // Add tracks to playlist
        await addTracksToPlaylist(accessToken, playlist.id, tracks);
        console.log("Added tracks to playlist");

        // Return the playlist as a response
        res.status(200).json(playlist);
    } catch (error) {
        // Log the full error
        console.error("Error creating playlist:", error);

        // Return error response
        res.status(500).json({
            error: error instanceof Error ? error.message : "An unknown error occurred",
        });
    }
}

// Fetch user profile from Spotify
const fetchProfile = async (token: string): Promise<UserProfile> => {
    try {
        const response = await spotifyApi(token).get("/me");
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);  // Log error
        throw error;  // Rethrow error to be caught in the main handler
    }
};

// Get top artists for the user
const getTopArtists = async (accessToken: string) => {
    try {
        const response = await spotifyApi(accessToken).get("/me/top/artists?limit=10&time_range=short_term");
        return response.data.items;
    } catch (error) {
        console.error("Error fetching top artists:", error);
        throw error;
    }
};

// Get top tracks from artists
const getTopTracksFromArtists = async (accessToken: string, artistIds: string[]) => {
    try {
        const trackPromises = artistIds.map(artistId =>
            spotifyApi(accessToken)
                .get(`/artists/${artistId}/top-tracks?market=US`)
                .then(response => response.data.tracks.map((track: { uri: string }) => track.uri).slice(0, 3))
        );
        const trackArrays = await Promise.all(trackPromises);
        return trackArrays.flat();
    } catch (error) {
        console.error("Error fetching top tracks from artists:", error);
        throw error;
    }
};

// Create a new playlist for the user
const createPlaylist = async (accessToken: string, userId: string, name: string) => {
    try {
        const response = await spotifyApi(accessToken).post(`/users/${userId}/playlists`, {
            name,
            public: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating playlist:", error);
        throw error;
    }
};

// Add tracks to the created playlist
const addTracksToPlaylist = async (accessToken: string, playlistId: string, tracks: string[]) => {
    try {
        const response = await spotifyApi(accessToken).post(`/playlists/${playlistId}/tracks`, { uris: tracks });
        return response.data;
    } catch (error) {
        console.error("Error adding tracks to playlist:", error);
        throw error;
    }
};
