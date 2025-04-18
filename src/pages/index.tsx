"use client"

import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { LogOut, Music, Disc, PlayCircle, User, Heart, Plus } from "lucide-react"
import Layout from "@/components/layouts/Layout"
import RecentlyPlayedTracks from "@/components/tracks/Recents"
import TopArtists from "@/components/topartist/TopArtist"
import TopPlaylists from "@/components/playlists/Playlists"
import NewReleases from "@/components/tracks/NewRelease"

export default function Home() {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = () => {
    setShowSignOutConfirm(true)
  }

  const confirmSignOut = () => {
    signOut()
    setShowSignOutConfirm(false)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
        <div className="relative w-24 h-24 mb-8">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/58d008c65016e1f1078cc00a/1590864966359-Z73RW444O8IMF2FD96LY/Spotify-Loading-Animation_1.gif"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-green-500 font-medium animate-pulse">Loading your music...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-zinc-900 p-8 rounded-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Not Signed In</h2>
          <p className="text-zinc-400 mb-6">Please sign in to view your Spotify dashboard</p>
          <button
            onClick={() => (window.location.href = "/api/auth/signin")}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full transition-colors"
          >
            Sign In with Spotify
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout active="Home">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pb-20"
      >
        {/* User Profile Header */}
        <motion.div
          variants={itemVariants}
          className={`sticky top-0 z-10 w-full transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
            }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-500">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image || "/placeholder.svg"}
                    alt={session.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base font-bold text-white"
                >
                  {session?.user?.name || "Unknown User"}
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs text-zinc-400"
                >
                  {session?.user?.email || "No Email Available"}
                </motion.h2>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-screen-xl mx-auto">
          {/* Welcome Message */}
          <motion.div variants={itemVariants} className="px-4 pt-4 pb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="text-green-500">Welcome back,</span> {session?.user?.name?.split(" ")[0]}
            </h1>
            <p className="text-zinc-400 mt-1">Here&apos;s what&apos;s happening with your music</p>
          </motion.div>

          {/* Recently Played Section */}
          <motion.div variants={itemVariants}>
            <RecentlyPlayedTracks />
          </motion.div>

          {/* Animated Banner */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="mx-4 my-6 rounded-xl overflow-hidden shadow-lg relative"
          >
            <div className="relative w-full h-[150px]">
              <Image
                src="https://gifyard.com/wp-content/uploads/2023/02/music-spotify.gif"
                alt="Music visualization"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Discover Weekly</h3>
                  <p className="text-sm text-zinc-300 mb-3">Fresh music recommendations just for you</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-500 text-black font-bold rounded-full text-sm flex items-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Listen Now
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Artists Section */}
          <motion.div variants={itemVariants}>
            <TopArtists />
          </motion.div>

          {/* Second Banner */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="mx-4 my-6 rounded-xl overflow-hidden shadow-lg relative"
          >
            <div className="relative w-full h-[150px]">
              <Image
                src="https://i.gifer.com/origin/5f/5f60d41f368337984c1e7994b85527e1_w200.gif"
                alt="Audio visualization"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Made For You</h3>
                  <p className="text-sm text-zinc-300 mb-3">Personalized playlists based on your taste</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-500 text-black font-bold rounded-full text-sm flex items-center"
                  >
                    <Disc className="h-4 w-4 mr-1" />
                    Explore
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Playlists Section */}
          <motion.div variants={itemVariants}>
            <TopPlaylists />
          </motion.div>

          {/* New Releases Section */}
          <motion.div variants={itemVariants}>
            <NewReleases />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="px-4 py-6 mt-4">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-zinc-800 rounded-lg p-4 flex items-center cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Liked Songs</h4>
                  <p className="text-zinc-400 text-xs">Your saved tracks</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-zinc-800 rounded-lg p-4 flex items-center cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Create Playlist</h4>
                  <p className="text-zinc-400 text-xs">Make a new collection</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
              <p className="text-zinc-400 mb-6">Are you sure you want to sign out of your Spotify account?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 py-2 px-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
