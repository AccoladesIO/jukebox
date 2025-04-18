"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Clock, Play, Pause, ChevronRight } from "lucide-react"

interface Track {
    id: string
    name: string
    artists: { name: string }[]
    album: { images: { url: string }[] }
    duration_ms?: number
}

interface RecentlyPlayed {
    items: { track: Track; played_at: string }[]
}

const RecentlyPlayedTracks: React.FC = () => {
    const { data: session, status } = useSession()
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [currentTrack, setCurrentTrack] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({})
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            if (session) {
                setLoading(true)
                try {
                    const res = await fetch("/api/recently-played")
                    if (!res.ok) {
                        throw new Error("Failed to fetch recently played tracks")
                    }
                    const data: RecentlyPlayed = await res.json()
                    const uniqueTracks = Array.from(
                        new Map(data.items.map((item) => [item.track.id, item.track])).values(),
                    ).slice(0, 6) // Take only the first 6 unique tracks
                    setTracks(uniqueTracks)
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

        fetchRecentlyPlayed()
    }, [session])

    const handlePlayPause = (trackId: string) => {
        if (currentTrack === trackId) {
            setIsPlaying(!isPlaying)
        } else {
            setCurrentTrack(trackId)
            setIsPlaying(true)
        }
    }

    const handleMouseEnter = (trackId: string) => {
        setHoverStates((prev) => ({ ...prev, [trackId]: true }))
    }

    const handleMouseLeave = (trackId: string) => {
        setHoverStates((prev) => ({ ...prev, [trackId]: false }))
    }

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
        hidden: { opacity: 0, y: 10 },
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
                    <h2 className="text-xl font-bold text-white">Recently Played</h2>
                    <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-zinc-800/50 rounded-md p-2 animate-pulse flex items-center">
                            <div className="w-12 h-12 bg-zinc-700 rounded-md mr-3"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
                                <div className="h-2 bg-zinc-700 rounded w-1/2"></div>
                            </div>
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
                <p className="text-zinc-400 text-center">Please log in to see your recently played tracks.</p>
            </div>
        )
    }

    return (
        <div className="w-full" ref={containerRef}>
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-500" />
                    Recently Played
                </h2>
                <motion.button whileHover={{ x: 3 }} className="text-zinc-400 hover:text-white text-sm flex items-center">
                    See All <ChevronRight className="h-4 w-4 ml-1" />
                </motion.button>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-4 grid grid-cols-2 gap-3"
            >
                <AnimatePresence>
                    {tracks.map((track) => (
                        <motion.div
                            key={track.id}
                            variants={itemVariants}
                            className="bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-2 flex items-center group transition-colors"
                            onMouseEnter={() => handleMouseEnter(track.id)}
                            onMouseLeave={() => handleMouseLeave(track.id)}
                        >
                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                {track?.album?.images[0]?.url ? (
                                    <Image
                                        src={track.album.images[0].url || "/placeholder.svg"}
                                        alt={track.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-zinc-500" />
                                    </div>
                                )}

                                {/* Play button overlay */}
                                <AnimatePresence>
                                    {hoverStates[track.id] && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 bg-black/60 flex items-center justify-center"
                                            onClick={() => handlePlayPause(track.id)}
                                        >
                                            {currentTrack === track.id && isPlaying ? (
                                                <Pause className="h-5 w-5 text-white" />
                                            ) : (
                                                <Play className="h-5 w-5 text-white" />
                                            )}
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{track.name}</p>
                                <p className="text-xs text-zinc-400 truncate">
                                    {track.artists.map((artist) => artist.name).join(", ")}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default RecentlyPlayedTracks
