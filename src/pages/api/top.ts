import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

interface Track {
    id: string;
    name: string;
    artists: Artist[];
    album: Album;
}

interface Artist {
    id: string;
    name: string;
    genres: string[];
    images: SpotifyImage[];
}

interface Album {
    id: string;
    name: string;
    images: SpotifyImage[];
}

interface SpotifyApiResponse<T> {
    items: T[];
}


async function fetchFromSpotify<T>(endpoint: string, token: string): Promise<SpotifyApiResponse<T>> {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const accessToken = session.accessToken as string;

        // Get top tracks
        const topTracks = await fetchFromSpotify<Track>('me/top/tracks?time_range=short_term&limit=20', accessToken);

        // Get top artists
        const topArtists = await fetchFromSpotify<Artist>('me/top/artists?time_range=short_term&limit=20', accessToken);

        // Extract top albums from top tracks
        const topAlbums = topTracks.items
            .map((track) => track.album)
            .reduce<Album[]>((uniqueAlbums, album) => {
                if (!uniqueAlbums.some((a) => a.id === album.id)) uniqueAlbums.push(album);
                return uniqueAlbums;
            }, []);

        // Extract top genres from top artists
        const topGenres = Array.from(new Set(topArtists.items.flatMap((artist) => artist.genres)));

        res.status(200).json({
            topTracks: topTracks.items,
            topArtists: topArtists.items,
            topAlbums,
            topGenres,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}
