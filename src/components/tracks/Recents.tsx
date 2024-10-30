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
                setLoading(true); // Set loading to true before fetching
                try {
                    const res = await fetch('/api/recently-listened');
                    if (!res.ok) {
                        throw new Error('Failed to fetch recently played tracks');
                    }
                    const data: RecentlyPlayed = await res.json();
                    setTracks(data.items.map(item => item.track));
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An unexpected error occurred');
                    }
                } finally {
                    setLoading(false); // Set loading to false after fetching
                }
            }
        };

        fetchRecentlyPlayed();
    }, [session]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (loading) {
        return <p>Loading your recently played tracks...</p>; // Use loading state here
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
