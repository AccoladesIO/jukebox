import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Loading from '../layouts/Loading';

interface Track {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
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
                setLoading(true);
                try {
                    const res = await fetch('/api/recently-played');
                    if (!res.ok) {
                        throw new Error('Failed to fetch recently played tracks');
                    }
                    const data: RecentlyPlayed = await res.json();
                    const uniqueTracks = Array.from(
                        new Map(
                            data.items.map(item => [item.track.id, item.track])
                        ).values()
                    ).slice(0, 6); // Take only the first 6 unique tracks
                    setTracks(uniqueTracks);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An unexpected error occurred');
                    }
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

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!session) {
        return <p>Please log in to see your recently played tracks.</p>;
    }

    return (
        <div className='w-full'>
            <p className='w-full text-white text-2xl text-left p-4 font-bold'>Recently Played</p>
            <div className='w-full p-4 grid grid-cols-2 gap-1'>
                {tracks.map(track => (
                    <div className='p-2 w-full text-gray-100 flex items-center space-x-2' key={track.id}>
                        <img src={track?.album?.images[0]?.url} alt={track.name} className='w-12 h-12 rounded' />
                        <div className='flex items-start justify-start flex-col w-full h-full'>
                            <p className="font-bold text-xs">
                                {track.name.length > 15 ? `${track.name.substring(0, 10)}...` : track.name}
                            </p>
                            <p className='text-[10px] text-gray-300'>{track.artists.map(artist => artist.name).join(', ').length > 15 ? `${track.artists.map(artist => artist.name).join(', ').substring(0, 10)}...` : track.artists.map(artist => artist.name).join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyPlayedTracks;
