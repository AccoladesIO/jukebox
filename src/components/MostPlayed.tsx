"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import Image from "next/image"
import {
    Music,
    Disc,
    Users,
    Tag,
    ChevronRight,
    Play,
    Pause,
    Volume2,
    SkipForward,
    SkipBack,
    Shuffle,
    Repeat,
} from "lucide-react"

interface Track {
    id: string
    name: string
    album: { name: string; images: { url: string }[] }
    artists: { name: string }[]
}

interface Artist {
    id: string
    name: string
    images: { url: string }[]
    genres: string[]
}

interface Album {
    id: string
    name: string
    images: { url: string }[]
}

type TimeRange = "short_term" | "medium_term" | "long_term"
type ContentType = "tracks" | "artists" | "albums" | "genres"

const MostPlayed: React.FC = () => {
    const [topTracks, setTopTracks] = useState<Track[]>([])
    const [topArtists, setTopArtists] = useState<Artist[]>([])
    const [topAlbums, setTopAlbums] = useState<Album[]>([])
    const [topGenres, setTopGenres] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState<TimeRange>("short_term")
    const [contentType, setContentType] = useState<ContentType>("tracks")
    const [activeItem, setActiveItem] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
    const [hoverState, setHoverState] = useState<{ [key: string]: boolean }>({})

    // Ref for scrolling to top when changing tabs
    const contentRef = useRef<HTMLDivElement>(null)

    // Time range labels for better UX
    const timeRangeLabels = {
        short_term: "Last Month",
        medium_term: "Last 6 Months",
        long_term: "All Time",
    }

    useEffect(() => {
        const fetchMostPlayed = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/top?time_range=${timeRange}&type=${contentType}`)
                if (!res.ok) throw new Error("Failed to fetch most-played data")

                const data = await res.json()
                if (contentType === "tracks") setTopTracks(data.topTracks)
                if (contentType === "artists") setTopArtists(data.topArtists)
                if (contentType === "albums") setTopAlbums(data.topAlbums)
                if (contentType === "genres") setTopGenres(data.topGenres)
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setLoading(false)
            }
        }

        fetchMostPlayed()
    }, [timeRange, contentType])

    // Scroll to top when changing content type
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0
        }
    }, [contentType])

    // Handle play/pause for a track
    const handlePlayTrack = (track: Track) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying)
        } else {
            setCurrentTrack(track)
            setIsPlaying(true)
        }
    }

    // Handle mouse enter/leave for hover effects
    const handleMouseEnter = (id: string) => {
        setHoverState((prev) => ({ ...prev, [id]: true }))
    }

    const handleMouseLeave = (id: string) => {
        setHoverState((prev) => ({ ...prev, [id]: false }))
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

    const tabVariants = {
        inactive: { color: "#1DB954", backgroundColor: "transparent" },
        active: { color: "#000000", backgroundColor: "#1DB954" },
    }

    // Loading state with Spotify-inspired animation
    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative w-24 h-24 mb-8">
                        <Image
                            src="https://images.squarespace-cdn.com/content/v1/58d008c65016e1f1078cc00a/1590864966359-Z73RW444O8IMF2FD96LY/Spotify-Loading-Animation_1.gif"
                            alt="Loading"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-green-500 font-medium"
                    >
                        Loading your music...
                    </motion.p>
                </motion.div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 p-6 rounded-xl max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-black font-bold rounded-full transition-colors"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header with title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 border-b border-zinc-800"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                    <span className="text-green-500 mr-2">Your</span> Most Played
                </h1>
            </motion.div>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden p-2">
                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4"
                >
                    <div className="max-w-screen-xl mx-auto">
                        <div className="flex p-2 gap-2">
                            <LayoutGroup id="tabs">
                                {[
                                    { type: "tracks", icon: <Music className="h-4 w-4 text-black" /> },
                                    { type: "artists", icon: <Users className="h-4 w-4 text-black" /> },
                                    { type: "albums", icon: <Disc className="h-4 w-4 text-black" /> },
                                    { type: "genres", icon: <Tag className="h-4 w-4 text-black" /> },
                                ].map((tab) => (
                                    <motion.button
                                        key={tab.type}
                                        className={`flex-1 py-2 px-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors`}
                                        onClick={() => setContentType(tab.type as ContentType)}
                                        initial="inactive"
                                        animate={contentType === tab.type ? "active" : "inactive"}
                                        variants={tabVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.type.charAt(0).toUpperCase() + tab.type.slice(1)}</span>
                                        {contentType === tab.type && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 rounded-full bg-green-500 -z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </LayoutGroup>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex p-2 md:p-4 gap-2">
                            {["short_term", "medium_term", "long_term"].map((range) => (
                                <motion.button
                                    key={range}
                                    className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-colors ${timeRange === range ? "bg-green-600 text-black" : "text-green-500 bg-zinc-800 hover:bg-zinc-700"
                                        }`}
                                    onClick={() => setTimeRange(range as TimeRange)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {timeRangeLabels[range as TimeRange]}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={contentRef}>
                    <div className="max-w-screen-xl mx-auto">
                        <AnimatePresence mode="wait">
                            {/* Tracks Content */}
                            {contentType === "tracks" && (
                                <motion.div
                                    key="tracks"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-white flex items-center">
                                        <Music className="h-5 w-5 mr-2 text-green-500" />
                                        Your Top Tracks
                                        <span className="ml-2 text-sm font-normal text-zinc-400">({timeRangeLabels[timeRange]})</span>
                                    </motion.h2>

                                    <ul className="space-y-3">
                                        {topTracks.map((track, i) => (
                                            <motion.li
                                                key={track.id}
                                                variants={itemVariants}
                                                className={`relative flex items-center p-3 rounded-lg ${activeItem === track.id
                                                    ? "bg-zinc-800"
                                                    : "bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors"
                                                    }`}
                                                onClick={() => setActiveItem(activeItem === track.id ? null : track.id)}
                                                onMouseEnter={() => handleMouseEnter(track.id)}
                                                onMouseLeave={() => handleMouseLeave(track.id)}
                                            >
                                                <div className="flex items-center w-8 mr-3">
                                                    {hoverState[track.id] ? (
                                                        <motion.button
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handlePlayTrack(track)
                                                            }}
                                                            className="text-green-500 hover:text-green-400"
                                                        >
                                                            {currentTrack?.id === track.id && isPlaying ? (
                                                                <Pause className="h-5 w-5" />
                                                            ) : (
                                                                <Play className="h-5 w-5" />
                                                            )}
                                                        </motion.button>
                                                    ) : (
                                                        <span className="text-lg font-bold text-zinc-500 w-5 text-center">{i + 1}</span>
                                                    )}
                                                </div>

                                                <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                                    {track.album.images[0]?.url && (
                                                        <Image
                                                            src={track.album.images[0].url || "/placeholder.svg"}
                                                            alt={track.album.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{track.name}</p>
                                                    <p className="text-xs text-zinc-400 truncate">
                                                        {track.artists.map((artist) => artist.name).join(", ")}
                                                    </p>
                                                </div>

                                                <div className="ml-2 text-right hidden sm:block">
                                                    <p className="text-xs text-zinc-500 truncate max-w-[120px]">{track.album.name}</p>
                                                </div>

                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: hoverState[track.id] ? 1 : 0, scale: hoverState[track.id] ? 1 : 0.8 }}
                                                    className="ml-2"
                                                >
                                                    <ChevronRight className="h-5 w-5 text-zinc-500" />
                                                </motion.div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Artists Content */}
                            {contentType === "artists" && (
                                <motion.div
                                    key="artists"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-white flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-green-500" />
                                        Your Top Artists
                                        <span className="ml-2 text-sm font-normal text-zinc-400">({timeRangeLabels[timeRange]})</span>
                                    </motion.h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {topArtists.map((artist, i) => (
                                            <motion.div
                                                key={artist.id}
                                                variants={itemVariants}
                                                className="bg-zinc-900/60 rounded-lg overflow-hidden hover:bg-zinc-800/80 transition-all hover:shadow-lg hover:shadow-green-900/20 group"
                                                whileHover={{ y: -5 }}
                                            >
                                                <div className="relative aspect-square overflow-hidden">
                                                    {artist.images[0]?.url ? (
                                                        <Image
                                                            src={artist.images[0].url || "/placeholder.svg"}
                                                            alt={artist.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            sizes="(max-width: 640px) 50vw, 25vw"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                            <Users className="h-12 w-12 text-zinc-600" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                                                        <span className="text-xl font-bold text-green-500">#{i + 1}</span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="bg-green-500 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-bold text-white truncate">{artist.name}</h3>
                                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                                        {artist.genres.slice(0, 3).join(", ")}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Albums Content */}
                            {contentType === "albums" && (
                                <motion.div
                                    key="albums"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-white flex items-center">
                                        <Disc className="h-5 w-5 mr-2 text-green-500" />
                                        Your Top Albums
                                        <span className="ml-2 text-sm font-normal text-zinc-400">({timeRangeLabels[timeRange]})</span>
                                    </motion.h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {topAlbums.map((album, i) => (
                                            <motion.div key={album.id} variants={itemVariants} className="group" whileHover={{ y: -5 }}>
                                                <div className="relative aspect-square rounded-md overflow-hidden shadow-lg">
                                                    {album.images[0]?.url ? (
                                                        <Image
                                                            src={album.images[0].url || "/placeholder.svg"}
                                                            alt={album.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                            <Disc className="h-12 w-12 text-zinc-600" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="bg-green-500 text-black p-3 rounded-full"
                                                        >
                                                            <Play className="h-5 w-5" />
                                                        </motion.div>
                                                    </div>
                                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-green-500 text-xs font-bold px-2 py-1 rounded-full">
                                                        #{i + 1}
                                                    </div>
                                                </div>
                                                <h3 className="mt-2 font-medium text-white text-sm truncate">{album.name}</h3>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Genres Content */}
                            {contentType === "genres" && (
                                <motion.div
                                    key="genres"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-white flex items-center">
                                        <Tag className="h-5 w-5 mr-2 text-green-500" />
                                        Your Top Genres
                                        <span className="ml-2 text-sm font-normal text-zinc-400">({timeRangeLabels[timeRange]})</span>
                                    </motion.h2>

                                    <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                                        {topGenres.map((genre, index) => {
                                            // Calculate size based on index (first genres are more important)
                                            const size = index < 3 ? "lg" : index < 8 ? "md" : "sm"
                                            const sizeClasses = {
                                                lg: "text-lg px-4 py-2",
                                                md: "text-base px-3 py-1.5",
                                                sm: "text-sm px-2 py-1",
                                            }

                                            return (
                                                <motion.span
                                                    key={index}
                                                    whileHover={{ scale: 1.05, backgroundColor: "#1DB954" }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`${sizeClasses[size]
                                                        } bg-zinc-800 hover:bg-green-600 text-white hover:text-black rounded-full font-medium transition-colors cursor-pointer`}
                                                >
                                                    {genre}
                                                </motion.span>
                                            )
                                        })}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Now Playing Bar */}
            <AnimatePresence>
                {currentTrack && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="sticky bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-3 z-20"
                    >
                        <div className="max-w-screen-xl mx-auto flex items-center">
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="relative h-10 w-10 rounded overflow-hidden mr-3">
                                    {currentTrack.album.images[0]?.url && (
                                        <Image
                                            src={currentTrack.album.images[0].url || "/placeholder.svg"}
                                            alt={currentTrack.album.name}
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-white text-sm truncate">{currentTrack.name}</p>
                                    <p className="text-xs text-zinc-400 truncate">
                                        {currentTrack.artists.map((artist) => artist.name).join(", ")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 flex-1">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400">
                                    <Shuffle className="h-4 w-4" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400">
                                    <SkipBack className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="bg-white text-black p-2 rounded-full"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400">
                                    <SkipForward className="h-5 w-5" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400">
                                    <Repeat className="h-4 w-4" />
                                </motion.button>
                            </div>

                            <div className="items-center gap-2 hidden md:flex">
                                <Volume2 className="h-4 w-4 text-zinc-400" />
                                <div className="w-24 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-zinc-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MostPlayed
