import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Define the shape of the track object
interface SpotifyTrack {
    uri: string;
    name: string;
    artists: { name: string }[];
}

// Define the response structure for search
interface SearchResponse {
    tracks: {
        items: SpotifyTrack[];
    };
}

// Helper function to call Spotify's API
async function fetchFromSpotify(endpoint: string, token: string) {
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json();
}

// Helper function to create a playlist for the user
async function createPlaylist(userId: string, token: string, name: string) {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description: 'Playlist created by your app',
            public: true,
        }),
    });
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json();
}

// Helper function to search for tracks by genre
async function searchTracksByGenre(genre: string, token: string): Promise<SearchResponse> {
    const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=20`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json(); // Return the response typed as SearchResponse
}

// Main API handler for creating a playlist
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get user session
    const session = await getSession({ req });

    // If no session or access token is found, return Unauthorized
    if (!session || !session.accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Extract access token and user ID from the session
        const accessToken = session.accessToken;
        const userId = session.user.id;

        const { genre, playlistName } = req.body;

        // Ensure genre and playlist name are provided
        if (!genre || !playlistName) {
            return res.status(400).json({ message: 'Genre and playlist name are required.' });
        }

        // 1. Fetch tracks by genre
        const genreTracks = await searchTracksByGenre(genre, accessToken);
        const trackUris = genreTracks.tracks.items.map((track: SpotifyTrack) => track.uri);

        // 2. Create a playlist for the user
        const playlist = await createPlaylist(userId, accessToken, playlistName);

        // Ensure the playlist was created successfully
        if (!playlist || !playlist.id) {
            return res.status(500).json({ message: 'Failed to create playlist. No playlist ID received.' });
        }

        // 3. Add tracks to the newly created playlist
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: trackUris }),
        });

        if (!addTracksResponse.ok) {
            throw new Error(`Failed to add tracks to playlist: ${addTracksResponse.statusText}`);
        }

        // Respond with success message
        res.status(200).json({ message: 'Playlist created successfully!' });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
}
