import Image from "next/image";
import React from 'react';
import { useSession, signOut } from "next-auth/react";
import Layout from "@/components/layouts/Layout";
import RecentlyPlayedTracks from "@/components/tracks/Recents";

export default function Home() {
  const { data: session } = useSession();
  console.log(session, session?.accessToken);

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
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </Layout>
  );
}
