"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Disc, Play, Calendar, ChevronRight } from "lucide-react"

interface Album {
    id: string
    name: string
    release_date: string
    images: { url: string }[]
    artists: { name: string }[]
    album_type?: string
}

const NewReleases: React.FC = () => {
    const { data: session } = useSession()
    const [newReleases, setNewReleases] = useState<Album[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activeAlbum, setActiveAlbum] = useState<string | null>(null)

    useEffect(() => {
        const fetchNewReleases = async () => {
            if (session) {
                setLoading(true)
                try {
                    const response = await fetch("/api/new-release")
                    if (!response.ok) {
                        throw new Error("Failed to fetch new releases")
                    }
                    const data = await response.json()
                    setNewReleases(data.albums?.items || data)
                } catch (err) {
                    setError(err instanceof Error ? err.message : "An unexpected error occurred")
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchNewReleases()
    }, [session])

    const formatReleaseDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }

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
                    <h2 className="text-xl font-bold text-white">New Releases</h2>
                    <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-zinc-800/40 rounded-lg p-3 animate-pulse flex items-center">
                            <div className="w-14 h-14 bg-zinc-700 rounded-md mr-3"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-3 bg-zinc-700 rounded w-3/4"></div>
                                <div className="h-2 bg-zinc-700 rounded w-1/2"></div>
                                <div className="h-2 bg-zinc-700 rounded w-1/4"></div>
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
                <p className="text-zinc-400 text-center">Please log in to see new releases.</p>
            </div>
        )
    }

    return (
        <div className="w-full p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <Disc className="h-5 w-5 mr-2 text-green-500" />
                    New Releases
                </h2>
                <motion.button whileHover={{ x: 3 }} className="text-zinc-400 hover:text-white text-sm flex items-center">
                    See All <ChevronRight className="h-4 w-4 ml-1" />
                </motion.button>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                <AnimatePresence>
                    {newReleases.slice(0, 5).map((album) => (
                        <motion.div
                            key={album.id}
                            variants={itemVariants}
                            className="bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg overflow-hidden transition-colors group"
                            onMouseEnter={() => setActiveAlbum(album.id)}
                            onMouseLeave={() => setActiveAlbum(null)}
                        >
                            <div className="p-3 flex items-start space-x-3">
                                {/* Album Cover */}
                                <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                    {album.images[0]?.url ? (
                                        <Image
                                            src={album.images[0].url || "/placeholder.svg"}
                                            alt={album.name}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                            <Disc className="h-6 w-6 text-zinc-500" />
                                        </div>
                                    )}

                                    {/* Play button overlay */}
                                    <AnimatePresence>
                                        {activeAlbum === album.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="bg-green-500 text-black p-1 rounded-full"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Album Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white truncate">{album.name}</h3>
                                    <p className="text-xs text-zinc-400 truncate">
                                        {album.artists.map((artist) => artist.name).join(", ")}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <Calendar className="h-3 w-3 text-green-500 mr-1" />
                                        <p className="text-xs text-zinc-500">{formatReleaseDate(album.release_date)}</p>
                                        {album.album_type && (
                                            <span className="ml-2 text-xs bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">
                                                {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default NewReleases
