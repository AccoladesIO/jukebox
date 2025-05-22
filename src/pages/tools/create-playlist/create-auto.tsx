import Layout from '@/components/layouts/Layout';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

const PlaylistGenerator = () => {
    const { data: session } = useSession(); 
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!session) {
            setError("You must be logged in to create a playlist.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                "/api/create-playlist-auto",
                { name },
                {
                    withCredentials: true, 
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`, 
                        'Content-Type': 'application/json'
                    },
                }
            );
            return response.data
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.error?.message || "Failed to create playlist. Please try again.");
            } else if (error instanceof Error) {
                setError("An unexpected error occurred: " + error.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active="Tools">
            <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-1">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Playlist Name"
                    className="p-3 bg-slate-100 outline-none border border-green-500 w-full"
                />
                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 border-none p-2"
                    disabled={loading}
                >
                    {loading ? "Generating Playlist..." : "Generate Playlist from Top Artists"}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        </Layout>
    );
};

export default PlaylistGenerator;
