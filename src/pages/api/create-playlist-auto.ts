import { getSession } from "next-auth/react";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await getSession({ req });
    if (!session || !session.accessToken || !session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const accessToken = session.accessToken;

    try {
        // Fetch the user's top artists
        const topArtists = await getTopArtists(accessToken);

        // Extract the artist IDs
        const artistIds = topArtists.map((artist: { id: string }) => artist.id);

        // Use the artist IDs to get top tracks from each artist
        const tracks = await getTopTracksFromArtists(accessToken, artistIds);

        // Now create a playlist
        const userId = session.user.id;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Playlist name is required" });
        }

        const playlist = await createPlaylist(accessToken, userId, name);

        // Add tracks to the newly created playlist
        await addTracksToPlaylist(accessToken, playlist.id, tracks);

        res.status(200).json(playlist);
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
}

// Helper functions
const getTopArtists = async (accessToken: string) => {
    const response = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10&time_range=short_term", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.items;
};

const getTopTracksFromArtists = async (accessToken: string, artistIds: string[]) => {
    let tracks: string[] = [];

    // Fetch top tracks for each artist
    for (const artistId of artistIds) {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Get the track URIs
        const topTracks = response.data.tracks.map((track: { uri: string }) => track.uri);
        tracks = tracks.concat(topTracks.slice(0, 3)); // Get top 3 tracks from each artist
    }
    return tracks;
};

const createPlaylist = async (accessToken: string, userId: string, name: string) => {
    const response = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        { name, public: false },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
};

const addTracksToPlaylist = async (accessToken: string, playlistId: string, tracks: string[]) => {
    const response = await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: tracks },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
};
