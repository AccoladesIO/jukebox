import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

async function fetchFromSpotify(endpoint: string, token: string) {
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const accessToken = session.accessToken;

        // Get top tracks
        const topTracks = await fetchFromSpotify('me/top/tracks?time_range=short_term&limit=20', accessToken);

        // Get top artists
        const topArtists = await fetchFromSpotify('me/top/artists?time_range=short_term&limit=20', accessToken);

        // Extract top albums from top tracks
        const topAlbums = topTracks.items.map((track: any) => track.album).reduce((uniqueAlbums: any[], album: any) => {
            if (!uniqueAlbums.some((a) => a.id === album.id)) uniqueAlbums.push(album);
            return uniqueAlbums;
        }, []);

        // Extract top genres from top artists
        const topGenres = Array.from(
            new Set(
                topArtists.items.flatMap((artist: any) => artist.genres)
            )
        );

        res.status(200).json({
            topTracks: topTracks.items,
            topArtists: topArtists.items,
            topAlbums,
            topGenres
        });
    } catch (error) {
        console.error('Error fetching top items:', error);
        res.status(500).json({ message: 'Error fetching top items' });
    }
}
