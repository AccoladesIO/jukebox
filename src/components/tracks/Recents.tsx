import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Track {
    id: string;
    name: string;
    artists: { name: string }[];
}

interface RecentlyPlayed {
    items: { track: Track }[];
}

const RecentlyPlayedTracks: React.FC = () => {
    const { data: session, status } = useSession();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            if (session) {
                try {
                    const res = await fetch('/api/recently-played');
                    if (!res.ok) {
                        throw new Error('Failed to fetch recently played tracks');
                    }
                    const data: RecentlyPlayed = await res.json();
                    setTracks(data.items.map(item => item.track)); // Map the response to the track structure
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRecentlyPlayed();
    }, [session]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!session) {
        return <p>Please log in to see your recently played tracks.</p>;
    }

    return (
        <div>
            <h2>Recently Played Songs</h2>
            <ul>
                {tracks.map(track => (
                    <li key={track.id}>
                        {track.name} by {track.artists.map(artist => artist.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentlyPlayedTracks;
