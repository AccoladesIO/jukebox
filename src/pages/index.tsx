import Image from "next/legacy/image";
import React from 'react';
import { useSession, signOut } from "next-auth/react";
import Layout from "@/components/layouts/Layout";
import RecentlyPlayedTracks from "@/components/tracks/Recents";
import TopArtists from "@/components/topartist/TopArtist";
import TopPlaylists from "@/components/playlists/Playlists";
import NewReleases from "@/components/tracks/NewRelease";

export default function Home() {
  const { data: session } = useSession();
  // console.log(session, session?.accessToken);

  const handleSignOut = () => signOut();

  return (
    <Layout active="Home">
      <div className="w-full flex items-center justify-start p-4">
        <div className="w-10 h-10 rounded-full relative">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white">U</span>
            </div>
          )}
        </div>
        <div className="w-full ml-4">
          <h1 className="text-sm font-medium text-white">{session?.user?.name || "Unknown User"}</h1>
          <h2 className="text-sm text-gray-300">{session?.user?.email || "No Email Available"}</h2>
        </div>
      </div>
      <RecentlyPlayedTracks />
      <div className="w-full p-4 h-[150px] relative rounded-md overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="https://gifyard.com/wp-content/uploads/2023/02/music-spotify.gif"
            alt="Loading animation"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      </div>
      <TopArtists />
      <div className="w-full p-4 h-[150px] relative rounded-md overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="https://i.gifer.com/origin/5f/5f60d41f368337984c1e7994b85527e1_w200.gif"
            alt="Loading animation"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      </div>
      <TopPlaylists />
      <NewReleases />
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </Layout>
  );
}
