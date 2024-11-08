import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Album {
    id: string;
    name: string;
    release_date: string;
    images: { url: string }[];
    artists: { name: string }[];
}

const NewReleases = () => {
    const [newReleases, setNewReleases] = useState<Album[]>([]);

    useEffect(() => {
        const fetchNewReleases = async () => {
            try {
                const response = await fetch('/api/new-release');
                const data = await response.json();

                setNewReleases(data.albums?.items || data); 
            } catch (error) {
                console.error('Error fetching new releases:', error);
            }
        };

        fetchNewReleases();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <motion.div
            className="p-4 space-y-4 text-white"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <h2 className="text-2xl font-semibold mb-4">New Releases</h2>
            {newReleases.length > 0 ? (
                <motion.ul className="space-y-1" variants={containerVariants}>
                    {newReleases.map((album) => (
                        <motion.li
                            key={album.id}
                            className="flex items-start space-x-4 p-4 rounded-lg shadow-md"
                            variants={itemVariants}
                        >
                            {/* Album Cover */}
                            <img
                                src={album.images[0]?.url}
                                alt={album.name}
                                className="w-16 h-16 rounded-md"
                            />

                            {/* Album Details */}
                            <div>
                                <h3 className="text-sm font-semibold truncate">{album.name}</h3>
                                <p className="text-xs text-gray-400">
                                    {album.artists.map((artist) => artist.name).join(', ')}
                                </p>
                                <p className="text-xs text-gray-500">Released: {album.release_date}</p>
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>
            ) : (
                <p>No new releases available.</p>
            )}
        </motion.div>
    );
};

export default NewReleases;
