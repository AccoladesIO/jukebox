import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/legacy/image';

interface Playlist {
    id: string;
    name: string;
    images: { url: string }[];
    tracks: { total: number };
}

const TopPlaylists: React.FC = () => {
    const { data: session, status } = useSession();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (session) {
                setLoading(true);
                try {
                    const res = await fetch('/api/playlists');
                    if (!res.ok) {
                        throw new Error('Failed to fetch playlists');
                    }
                    const data = await res.json();
                    setPlaylists(data.items); // Setting playlists
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

        fetchPlaylists();
    }, [session]);

    // Logging playlists after they are fetched and state is updated
    useEffect(() => {
        if (playlists.length > 0) {
            // console.log(playlists);
        }
    }, [playlists]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (loading) {
        return <p>Loading your playlists...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!session) {
        return <p>Please log in to see your playlists.</p>;
    }

    return (
        <div className='w-full'>
            <p className='w-full text-white text-2xl text-left px-4 mb-4 font-bold'>Top Playlists</p>
            <div className="w-full flex items-center justify-start overflow-x-auto  custom-scrollbar">
                {playlists.map((playlist, i) => (
                    <div
                        className="p-4 flex flex-col items-center space-y-2 relative"
                        key={playlist.id + i}
                        style={{ minWidth: "100px" }}
                    >
                        {/* Playlist Image */}
                        {playlist?.images && playlist.images.length > 0 ? (
                            <Image
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                className="rounded-md"
                                height={100}
                                width={100}
                                objectFit="cover"
                            />
                        ) : (
                            <div className="w-[80px] h-[80px] bg-gray-300 rounded-md" /> // Placeholder for missing image
                        )}

                        {/* Playlist Name and Track Count */}
                        <p className="text-gray-100 text-left font-medium text-[10px] w-full">
                            {`${playlist.name.substring(0, 10)}${playlist.name.length > 10 ? '...' : ''}`}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopPlaylists;
