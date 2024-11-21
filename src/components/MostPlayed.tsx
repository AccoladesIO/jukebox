import { useEffect, useState } from 'react';
import TopArtists from './topartist/TopArtist';

interface Track {
    id: string;
    name: string;
    album: { name: string; images: { url: string }[] };
    artists: { name: string }[];
}

interface Artist {
    id: string;
    name: string;
    images: { url: string }[];
    genres: string[];
}

interface Album {
    id: string;
    name: string;
    images: { url: string }[];
}

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ContentType = 'tracks' | 'artists' | 'albums' | 'genres';

const MostPlayed: React.FC = () => {
    const [topTracks, setTopTracks] = useState<Track[]>([]);
    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topAlbums, setTopAlbums] = useState<Album[]>([]);
    const [topGenres, setTopGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('short_term');
    const [contentType, setContentType] = useState<ContentType>('tracks');
    console.log(TopArtists)
    console.log(topTracks)
    console.log(topAlbums)

    useEffect(() => {
        const fetchMostPlayed = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/top?time_range=${timeRange}&type=${contentType}`);
                if (!res.ok) throw new Error('Failed to fetch most-played data');

                const data = await res.json();
                if (contentType === 'tracks') setTopTracks(data.topTracks);
                if (contentType === 'artists') setTopArtists(data.topArtists);
                if (contentType === 'albums') setTopAlbums(data.topAlbums);
                if (contentType === 'genres') setTopGenres(data.topGenres);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchMostPlayed();
    }, [timeRange, contentType]);

    if (loading) {
        return (
            <div className='w-full p-4 h-screen flex items-center justify-center bg-black'>
                <img src='https://images.squarespace-cdn.com/content/v1/58d008c65016e1f1078cc00a/1590864966359-Z73RW444O8IMF2FD96LY/Spotify-Loading-Animation_1.gif' alt={`loading`} className="w-40 h-40 rounded mr-4" />
            </div>
        )
    };
    if (error) return <p>Error: {error}</p>;

    const tabStyle = (type: ContentType) =>
        `px-2 py-2 cursor-pointer rounded-md w-full text-xs ${contentType === type ? 'bg-green-600 text-black' : ' text-green-600'}`;
    const timeRangeStyle = (range: TimeRange) =>
        `px-2 py-2 cursor-pointer rounded-md w-full text-xs ${timeRange === range ? 'bg-green-600 text-black' : ' text-green-600'}`;

    return (
        <div className="p-4 space-y-8 text-white">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4 w-full bg-black p-2">
                <button className={tabStyle('tracks')} onClick={() => setContentType('tracks')}>Tracks</button>
                <button className={tabStyle('artists')} onClick={() => setContentType('artists')}>Artists</button>
                <button className={tabStyle('albums')} onClick={() => setContentType('albums')}>Albums</button>
                <button className={tabStyle('genres')} onClick={() => setContentType('genres')}>Genres</button>
            </div>

            {/* Time Range Selector */}
            <div className="flex space-x-2 mb-8 w-full bg-black p-2">
                <button className={timeRangeStyle('short_term')} onClick={() => setTimeRange('short_term')}>1 Month</button>
                <button className={timeRangeStyle('medium_term')} onClick={() => setTimeRange('medium_term')}>6 Months</button>
                <button className={timeRangeStyle('long_term')} onClick={() => setTimeRange('long_term')}>12 Months</button>
            </div>

            {/* Display Content Based on Selected Tab */}
            {contentType === 'tracks' && (
                <div className='w-full '>
                    <h2 className="text-2xl font-semibold mb-4 w-full">Top Tracks</h2>
                    <ul className="space-y-4 w-full">
                        {topTracks.map((track, i) => (
                            <li key={track.id} className="flex items-center p-2 rounded-lg shadow-md w-full">
                                <p className='flex items-center justify-center w-10 text-lg font-bold p-1 text-green-500'>#{i + 1}</p>
                                {track.album.images[0]?.url && (
                                    <img src={track.album.images[0].url} alt={track.album.name} className="w-12 h-12 rounded mr-4" />
                                )}
                                <div className='w-full'>
                                    <p className="text-sm font-bold w-full text-wite">{track.name}</p>
                                    <p className="text-xs text-white w-full">{track.artists.map((artist) => artist.name).join(', ')}</p>
                                    <p className="text-[10px] text-white w-full">{track.album.name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {contentType === 'artists' && (
                <div className='w-full'>
                    <h2 className="text-2xl font-bold mb-4 w-full ">Top Artists</h2>
                    <ul className="space-y-4 w-full">
                        {topArtists.map((artist, i) => (
                            <li key={artist.id} className="flex items-center p-2 rounded-lg shadow-md w-full">
                                <p className='flex items-center justify-center w-10 text-lg font-bold p-1 text-green-500'>#{i + 1}</p>
                                {artist.images[0]?.url && (
                                    <img src={artist.images[0].url} alt={artist.name} className="w-12 h-12 rounded mr-4" />
                                )}
                                <div className='w-full'>
                                    <p className="text-sm font-semibold w-full">{artist.name}</p>
                                    <p className="text-xs text-white w-full">Genres: {artist.genres.slice(0, 3).join(', ')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {contentType === 'albums' && (
                <div className='w-full'>
                    <h2 className="text-2xl font-bold mb-4">Top Albums</h2>
                    <ul className="space-y-4 w-full">
                        {topAlbums.map((album, i) => (
                            <li key={album.id} className="flex items-center p-2 rounded-lg shadow-md">
                                <p className='flex items-center justify-center w-10 text-lg font-bold p-1 text-green-500'>#{i + 1}</p>
                                {album.images[0]?.url && (
                                    <img src={album.images[0].url} alt={album.name} className="w-12 h-12 rounded mr-4" />
                                )}
                                <div className='w-full'>
                                    <p className="text-sm font-semibold text-white">{album.name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {contentType === 'genres' && (
                <div className='w-full'>
                    <h2 className="text-2xl font-semibold mb-4">Top Genres</h2>
                    <div className="flex flex-wrap gap-2">
                        {topGenres.map((genre, index) => (
                            <span key={index} className="px-3 py-1 bg-green-600 text-black rounded-full text-sm">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MostPlayed;
