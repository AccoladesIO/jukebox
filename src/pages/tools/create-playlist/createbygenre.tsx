/* eslint-disable @typescript-eslint/no-unused-vars */


import Layout from '@/components/layouts/Layout';
import { useSession, signIn } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ToggleGenreFunction {
    (genre: string): void;
}

const GenreSelector = () => {
    const { data: session, status } = useSession();
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [playlistName, setPlaylistName] = useState('');
    const [loading, setLoading] = useState(false);
    const [genreLoading, setGenreLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [sessionInfo, setSessionInfo] = useState('No session data');

    // Debug session information
    useEffect(() => {
        if (session) {
            const info = {
                status,
                authenticated: status === 'authenticated',
                hasAccessToken: !!session?.accessToken,
                userId: session?.user?.id || 'No user ID',
            };
            setSessionInfo(JSON.stringify(info, null, 2));
            console.log("Session info:", info);
        } else {
            setSessionInfo(JSON.stringify({ status }, null, 2));
        }
    }, [session, status]);

    useEffect(() => {
        const fetchGenres = async () => {
            if (status !== 'authenticated') {
                return;
            }

            if (!session?.accessToken) {
                console.log("No access token in session");
                setError("No Spotify access token available. Please sign in again.");
                return;
            }

            setGenreLoading(true);
            setError('');

            try {
                console.log("Making request to /api/genre");
                const response = await axios.get('/api/genre');
                console.log("Genre API response:", response.data);

                if (response.data.genres && Array.isArray(response.data.genres)) {
                    setGenres(response.data.genres);
                } else {
                    console.error("Unexpected genre data format:", response.data);
                    setError("Received invalid genre data from Spotify");
                }
            } catch (error) {
                console.error('Error fetching genres:', error);
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.message || "Failed to fetch genres"
                    : "An unexpected error occurred";
                setError(`Error: ${errorMessage}`);
            } finally {
                setGenreLoading(false);
            }
        };

        fetchGenres();
    }, [status, session]);

    const toggleGenre: ToggleGenreFunction = (genre) => {
        setSelectedGenres((prevGenres) =>
            prevGenres.includes(genre)
                ? prevGenres.filter((g) => g !== genre)
                : [...prevGenres, genre]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedGenres.length === 0) {
            setMessage('Please select at least one genre');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/create-playlist', {
                genre: selectedGenres,
                playlistName: playlistName,
            });

            if (response.status === 200) {
                setMessage('Playlist created successfully!');
                setPlaylistName('');
                setSelectedGenres([]);

                if (response.data.playlistUrl) {
                    setMessage(`Playlist created with ${response.data.tracksAdded || 0} tracks!`);
                }
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error creating playlist. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (status === 'unauthenticated') {
        return (
            <Layout active='Tools'>
                <div className='max-w-lg mx-auto p-6 rounded-lg shadow-md text-white'>
                    <h1 className='text-2xl font-semibold mb-6 text-center'>Create Spotify Playlist</h1>
                    <p className="mb-4 text-center">You need to sign in with Spotify to use this feature.</p>
                    <button
                        onClick={() => signIn('spotify')}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                    >
                        Sign in with Spotify
                    </button>
                </div>
            </Layout>
        );
    }

    // If loading authentication status
    if (status === 'loading') {
        return (
            <Layout active='Tools'>
                <div className='flex justify-center items-center h-64'>
                    <div className="w-8 h-8 border-4 border-t-green-500 border-green-200 rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active='Tools'>
            <div className='max-w-lg mx-auto p-6 rounded-lg shadow-md text-white'>
                <h1 className='text-2xl font-semibold mb-6 text-center'>Create Spotify Playlist by Genre</h1>


                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="text-red-200">{error} {sessionInfo}</p>
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
                        <p className="text-green-200">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='w-full'>
                        <h2 className="text-xl font-semibold mb-4">Select Genres</h2>

                        {genreLoading ? (
                            <div className="flex justify-center my-4">
                                <div className="w-6 h-6 border-2 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                                <span className="ml-2">Loading genres...</span>
                            </div>
                        ) : genres.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-3 py-1 cursor-pointer rounded-full text-sm transition-colors ${selectedGenres.includes(genre)
                                            ? 'bg-green-600 text-white font-medium'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                {error ? "Could not load genres due to an error." : "No genres available."}
                            </p>
                        )}

                        {selectedGenres.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-300">
                                    Selected ({selectedGenres.length}): {selectedGenres.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className='w-full'>
                        <label className='block text-sm font-medium mb-1'>Playlist Name</label>
                        <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            required
                            placeholder="My Awesome Playlist"
                            className='w-full p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 border border-gray-600 focus:border-green-500'
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || selectedGenres.length === 0 || !playlistName}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${loading || selectedGenres.length === 0 || !playlistName
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
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
            </div>
        </Layout>
    );
};

export default GenreSelector;