import React from 'react';
import Header from '@/components/navbar/header/Header';
import BottomNav from '@/components/navbar/bottomnav/BottomNav';
import Image from 'next/image'; // Import for Image component
import { FaSpotify } from 'react-icons/fa'; // Import Spotify icon
import { useSession, signIn } from 'next-auth/react';

interface LayoutProp {
    children: React.ReactNode;
    active: string;
}

const Layout: React.FC<LayoutProp> = ({ children, active }) => {
    const { data: session } = useSession();

    const handleSignIn = () => signIn('spotify'); // Add handleSignIn function

    return (
        <>
            {!session ? (
                <div className="relative w-full h-screen">
                    <Image
                        src="https://media1.giphy.com/media/tIFfP34C6LY3BtchHw/giphy.gif"
                        alt="Background GIF"
                        layout="fill"
                        objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-black opacity-80"></div>
                    <div className="absolute flex flex-col items-center justify-center gap-4 h-full w-full text-center text-white p-2">
                        <h1 className="text-8xl font-bold mt-10">Jukebox</h1>
                        <p className="text-xl text-white">Select playlist from your Jukebox — automatically and based on what you like</p>
                        <button
                            className="bg-green-500 text-white font-bold px-6 py-3 text-lg rounded-3xl hover:bg-green-400 w-full flex items-center justify-center gap-2"
                            onClick={handleSignIn}
                        >
                            <FaSpotify size={20} />
                            Continue with Spotify
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full relative">
                    <div className="w-full">
                        <Header active={active} />
                        {children}
                    </div>
                    <BottomNav active={active} />
                </div>
            )}
        </>
    );
};

export default Layout;
