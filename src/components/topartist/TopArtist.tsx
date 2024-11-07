import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/legacy/image';
import Loading from '../layouts/Loading';

interface Artist {
    id: string;
    name: string;
    images: { url: string }[];
    genres: string[];
}

const TopArtists: React.FC = () => {
    const { data: session, status } = useSession();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopArtists = async () => {
            if (session) {
                setLoading(true);
                try {
                    const res = await fetch('/api/top-artists');
                    if (!res.ok) {
                        throw new Error('Failed to fetch top artists');
                    }
                    const data = await res.json();
                    setArtists(data.items);
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

        fetchTopArtists();
    }, [session]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (loading) {
        return <Loading/>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!session) {
        return <p>Please log in to see your top artists.</p>;
    }

    return (
        <div className='w-full'>
            <p className='w-full text-white text-xl text-left px-4'>Top Artists</p>
            <div className="w-full px-4 flex items-center justify-start overflow-x-scroll space-x-4 custom-scrollbar">
                {artists.map((artist, i) => (
                    <div className="p-2 flex flex-col items-start space-y-2 relative" key={artist.id} style={{ minWidth: "150px" }}>
                        <Image src={artist.images[0]?.url} alt={artist.name} className="rounded" height={150} width={150} />
                        <p className="flex items-center gap-2 text-gray-100">
                            #{i + 1} {artist.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopArtists;
