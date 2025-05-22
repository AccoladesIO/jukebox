/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ListMusic, Play, ChevronRight, Music } from "lucide-react"

interface Playlist {
    id: string
    name: string
    images: { url: string }[]
    tracks: { total: number }
    owner: { display_name: string }
}

const TopPlaylists: React.FC = () => {
    const { data: session, } = useSession()
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activePlaylist, setActivePlaylist] = useState<string | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (session) {
                setLoading(true)
                try {
                    const res = await fetch("/api/playlists")
                    if (!res.ok) {
                        throw new Error("Failed to fetch playlists")
                    }
                    const data = await res.json()
                    setPlaylists(data.items)

                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message)
                    } else {
                        setError("An unexpected error occurred")
                    }
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchPlaylists()
    }, [session])

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            },
        },
    }

    if (loading) {
        return (
            <div className="w-full p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Top Playlists</h2>
                    <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
                    {[...Array(6)].map((_) => (
                        <div key={Math.random() * 100000} className="flex-shrink-0 w-[140px] animate-pulse">
                            <div className="w-[140px] h-[140px] bg-zinc-800 rounded-lg mb-2"></div>
                            <div className="h-3 bg-zinc-800 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-zinc-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full p-4">
                <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 text-center">
                    <p className="text-red-400 text-sm">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="w-full p-4">
                <p className="text-zinc-400 text-center">Please log in to see your playlists.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <ListMusic className="h-5 w-5 mr-2 text-green-500" />
                    Your Playlists
                </h2>
                <motion.button whileHover={{ x: 3 }} className="text-zinc-400 hover:text-white text-sm flex items-center">
                    See All <ChevronRight className="h-4 w-4 ml-1" />
                </motion.button>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-4 relative">
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar snap-x snap-mandatory"
                >
                    <AnimatePresence>
                        {playlists.map((playlist) => (
                            <motion.div
                                key={playlist.id}
                                variants={itemVariants}
                                className="flex-shrink-0 snap-start"
                                style={{ width: "140px" }}
                                whileHover={{ y: -5 }}
                            >
                                <div
                                    className="relative w-[140px] h-[140px] rounded-lg overflow-hidden group cursor-pointer shadow-md"
                                    onMouseEnter={() => setActivePlaylist(playlist.id)}
                                    onMouseLeave={() => setActivePlaylist(null)}
                                >
                                    {playlist.images && playlist.images.length > 0 ? (
                                        <Image
                                            src={playlist.images[0].url || "/placeholder.svg"}
                                            alt={playlist.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="140px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Music className="h-10 w-10 text-zinc-600" />
                                        </div>
                                    )}

                                    {/* Overlay with play button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-green-500 text-black p-2 rounded-full"
                                        >
                                            <Play className="h-6 w-6" />
                                        </motion.div>
                                    </div>

                                    {/* Track count badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                        {playlist.tracks.total} tracks
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <p className="font-medium text-white text-sm truncate">{playlist.name}</p>
                                    {activePlaylist && <p className="text-xs text-zinc-400 truncate">By {playlist.owner.display_name}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

export default TopPlaylists
