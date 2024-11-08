import Layout from '@/components/layouts/Layout';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import axios from 'axios'

const GenreSelector = () => {
    const { data: session } = useSession();
    const accessToken = session?.accessToken
    console.log(accessToken)
    const [genres, setGenres] = useState<string[]>([]);  // Store genres
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [playlistName, setPlaylistName] = useState<string>(''); // Playlist name
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    // Fetch genres when component mounts
    React.useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/genre'); // Your API route
                const data = await response.json();
                setGenres(data.genres); // Set genres state
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };
        fetchGenres();
    }, []);
    const toggleGenre = (genre: string) => {
        setSelectedGenres((prevGenres) =>
            prevGenres.includes(genre)
                ? prevGenres.filter((g) => g !== genre) // Remove if already selected
                : [...prevGenres, genre] // Add if not selected
        );
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
       

        e.preventDefault();

        try {
            // Get session data (accessToken from next-auth
            // Make the POST request using Axios
            const response = await axios.post('/api/create-playlist', {
                genre: selectedGenres,
                playlistName: playlistName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,  // Attach the access token
                }
            });

            if (response.status === 200) {
                setMessage('Playlist created successfully!');
            } else {
                setMessage('Error creating playlist.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error creating playlist.');
        }
    };

    return (
        <Layout active='Tools'>
            <div className='max-w-lg mx-auto p-6 rounded-lg shadow-md text-white'>
                <h1 className='text-2xl font-semibold mb-6 text-center'>Select Genre and Create Playlist</h1>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='w-full'>
                        <h2 className="text-xl font-semibold mb-4">Top Genres</h2>
                        <div className="flex flex-wrap gap-2">
                            {genres?.map((genre, index) => (
                                <span
                                    key={index}
                                    onClick={() => toggleGenre(genre)}
                                    className={`px-3 py-1 cursor-pointer rounded-full text-sm ${selectedGenres.includes(genre)
                                        ? 'bg-green-600 text-black'
                                        : 'bg-gray-600 text-gray-200'
                                        }`}
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className='w-full'>
                        <label className='block text-sm font-medium mb-1'>Playlist Name</label>
                        <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            required
                            className='w-full p-2 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 outline-none bg-inherit border border-green-500'
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg font-semibold ${loading
                            ? 'bg-green-600 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </div>
                        ) : (
                            'Create Playlist'
                        )}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center font-semibold ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}
            </div>
        </Layout>
    );
};

export default GenreSelector;
