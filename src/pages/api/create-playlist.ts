import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Helper function to call Spotify's API
async function fetchFromSpotify(endpoint: string, token: string, method: string = 'GET', body?: object) {
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json();
}

// Main API handler for creating a playlist
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session || !session.accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { genre, playlistName } = req.body;
        const accessToken = session.accessToken as string;
        console.log(accessToken)
        const userId = session.user.id as string;

        if (!genre || !playlistName) {
            return res.status(400).json({ message: 'Genre and playlist name are required.' });
        }

        // Fetch tracks by genre using fetchFromSpotify
        const genreTracks = await fetchFromSpotify(`search?q=genre:${genre}&type=track&limit=20`, accessToken);
        const trackUris = genreTracks.tracks.items.map((track: any) => track.uri);

        // Create a playlist using fetchFromSpotify
        const playlist = await fetchFromSpotify(`users/${userId}/playlists`, accessToken, 'POST', {
            name: playlistName,
            description: 'Playlist created by your app',
            public: true,
        });

        // Add tracks to the newly created playlist
        await fetchFromSpotify(`playlists/${playlist.id}/tracks`, accessToken, 'POST', {
            uris: trackUris,
        });

        res.status(200).json({ message: 'Playlist created successfully!' });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
}
