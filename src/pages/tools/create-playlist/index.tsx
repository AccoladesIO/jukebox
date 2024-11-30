import Layout from '@/components/layouts/Layout'
import Image from 'next/legacy/image'
import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const Playlist = () => {
    const router = useRouter()
    const { data: session } = useSession();

    return (
        <Layout active='Tools'>
            <div className='w-full p-4' onClick={() => router.push('/tools/create-playlist/create-auto/')}>
                <div className='w-full relative h-[180px]'>
                    {/* Gradient overlay with a higher z-index */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-00 to-black opacity-80 z-10"></div>

                    {/* Background image with a lower z-index */}
                    <Image
                        src='https://preview.redd.it/naa1rljlr0g41.jpg?auto=webp&s=daa3fc0fc1c44d18ef5ab8a2de97f9f445e3af05'
                        alt='Background Image'
                        layout='fill'
                        objectFit='cover'
                        className="z-0 rounded-lg"
                    />

                    {/* Text overlaid on top */}
                    <div className="absolute bottom-0 flex flex-col items-start justify-end z-20 text-left p-4 h-16 border border-green-300 border-t-0 rounded-b-lg bg-black opacity-80 w-full" onClick={() => router.push('/tools/create-playlist/create-auto/')}>
                        <h1 className="text-white text-sm font-bold">Create Automatically</h1>
                        <h2 className="text-gray-300 text-xs mt-1">Let Jukebox Automatically Create a Playlist For You</h2>
                    </div>
                </div>
            </div>

            <div className='w-full p-4'>
                <div className='w-full relative h-[180px]'>
                    {/* Gradient overlay with a higher z-index */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-00 to-black opacity-80 z-10"></div>

                    {/* Background image with a lower z-index */}
                    <Image
                        src='https://www.omarimc.com/wp-content/uploads/2022/04/music-genres.jpeg'
                        alt='Background Image'
                        layout='fill'
                        objectFit='cover'
                        className="z-0 rounded-lg"
                    />

                    {/* Text overlaid on top */}
                    <div className="absolute bottom-0 flex flex-col items-start justify-end z-20 text-left p-4 h-16 border border-green-300 border-t-0 rounded-b-lg bg-black opacity-80 w-full" onClick={() => router.push('/tools/create-playlist/createbygenre/')}>
                        <h1 className="text-white text-sm font-bold">Create based off genre</h1>
                        <h2 className="text-gray-300 text-xs mt-1">Choose your favorite genres and craft a playlist unique to you.</h2>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Playlist
