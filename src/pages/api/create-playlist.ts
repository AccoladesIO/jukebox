import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

interface SpotifyTrack {
    uri: string;
    name: string;
    artists: { name: string }[];
}

interface SearchResponse {
    tracks: {
        items: SpotifyTrack[];
    };
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
    return response.json(); 
}

// Main API handler for creating a playlist
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session || !session.accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const accessToken = session.accessToken;
        const userId = session.user.id;

        const { genre, playlistName } = req.body;

        if (!genre || !playlistName) {
            return res.status(400).json({ message: 'Genre and playlist name are required.' });
        }

        const genreTracks = await searchTracksByGenre(genre, accessToken);
        const trackUris = genreTracks.tracks.items.map((track: SpotifyTrack) => track.uri);

       
        const playlist = await createPlaylist(userId, accessToken, playlistName);

       
        if (!playlist || !playlist.id) {
            return res.status(500).json({ message: 'Failed to create playlist. No playlist ID received.' });
        }

    
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

 
        res.status(200).json({ message: 'Playlist created successfully!' });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
}
