/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Users, Play, ChevronRight, Music } from "lucide-react"

interface Artist {
    id: string
    name: string
    images: { url: string }[]
    genres: string[]
    popularity?: number
}

const TopArtists: React.FC = () => {
    const { data: session, status } = useSession()
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activeArtist, setActiveArtist] = useState<string | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchTopArtists = async () => {
            if (session) {
                setLoading(true)
                try {
                    const res = await fetch("/api/top-artists")
                    if (!res.ok) {
                        throw new Error("Failed to fetch top artists")
                    }
                    const data = await res.json()
                    setArtists(data.items)
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

        fetchTopArtists()
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
                    <h2 className="text-xl font-bold text-white">Top Artists</h2>
                    <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[120px] animate-pulse">
                            <div className="w-[120px] h-[120px] bg-zinc-800 rounded-full mb-2"></div>
                            <div className="h-3 bg-zinc-800 rounded w-3/4 mx-auto mb-1"></div>
                            <div className="h-2 bg-zinc-800 rounded w-1/2 mx-auto"></div>
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
                <p className="text-zinc-400 text-center">Please log in to see your top artists.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    Top Artists
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
                        {artists.map((artist, i) => (
                            <motion.div
                                key={artist.id}
                                variants={itemVariants}
                                className="flex-shrink-0 snap-start"
                                style={{ width: "120px" }}
                                whileHover={{ y: -5 }}
                            >
                                <div
                                    className="relative w-[120px] h-[120px] rounded-full overflow-hidden group cursor-pointer"
                                    onMouseEnter={() => setActiveArtist(artist.id)}
                                    onMouseLeave={() => setActiveArtist(null)}
                                >
                                    {artist.images[0]?.url ? (
                                        <Image
                                            src={artist.images[0].url || "/placeholder.svg"}
                                            alt={artist.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="120px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Music className="h-10 w-10 text-zinc-600" />
                                        </div>
                                    )}

                                    {/* Overlay with rank */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-green-500 text-black p-2 rounded-full"
                                        >
                                            <Play className="h-6 w-6" />
                                        </motion.div>
                                    </div>

                                    <div className="absolute top-1 left-1 bg-black/60 text-green-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                        {i + 1}
                                    </div>
                                </div>

                                <div className="mt-2 text-center">
                                    <p className="font-medium text-white text-sm truncate">{artist.name}</p>
                                    {artist.genres.length > 0 && (
                                        <p className="text-xs text-zinc-400 truncate">{artist.genres.slice(0, 2).join(", ")}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

export default TopArtists
