import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from 'next';

interface CreatePlaylistRequestBody {
    playlistName: string;
    genre: string[];
}

interface Session {
    accessToken: string;
    user: {
        id: string;
    };
}

interface PlaylistData {
    id: string;
    external_urls: {
        spotify: string;
    };
}

interface RecommendationsData {
    tracks: Array<{
        uri: string;
    }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession({ req, res, ...authOptions }) as Session | null;
        if (!session) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const accessToken = session.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: 'No access token available' });
        }

        const { playlistName, genre } = req.body as CreatePlaylistRequestBody;
        const userId = session.user.id;

        if (!playlistName || !genre || genre.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`Creating playlist for user ${userId} with genres: ${genre.join(', ')}`);

        const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: `Playlist with genres: ${genre.join(', ')}`,
                public: false
            })
        });

        if (!createPlaylistResponse.ok) {
            const errorData = await createPlaylistResponse.json();
            console.error('Error creating playlist:', errorData);
            return res.status(createPlaylistResponse.status).json({
                error: 'Error creating playlist',
                details: errorData
            });
        }

        const playlistData = await createPlaylistResponse.json() as PlaylistData;
        const playlistId = playlistData.id;

        const genreQueryParam = genre.join(',');
        const recommendationsResponse = await fetch(
            `https://api.spotify.com/v1/recommendations?limit=30&seed_genres=${genreQueryParam}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!recommendationsResponse.ok) {
            const errorData = await recommendationsResponse.json();
            console.error('Error getting recommendations:', errorData);
            return res.status(recommendationsResponse.status).json({
                error: 'Error getting recommendations',
                details: errorData
            });
        }

        const recommendationsData = await recommendationsResponse.json() as RecommendationsData;
        const trackUris = recommendationsData.tracks.map(track => track.uri);

        if (trackUris.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Playlist created but no tracks were found for the selected genres',
                playlistId: playlistId,
                playlistUrl: playlistData.external_urls.spotify
            });
        }

        const addTracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: trackUris
            })
        });

        if (!addTracksResponse.ok) {
            const errorData = await addTracksResponse.json();
            console.error('Error adding tracks:', errorData);
            return res.status(addTracksResponse.status).json({
                error: 'Error adding tracks to playlist',
                details: errorData
            });
        }

        return res.status(200).json({
            success: true,
            playlistId: playlistId,
            playlistUrl: playlistData.external_urls.spotify,
            tracksAdded: trackUris.length
        });
    } catch (error: any) {
        console.error('Error in create-playlist handler:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}