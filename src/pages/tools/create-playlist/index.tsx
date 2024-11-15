import Layout from '@/components/layouts/Layout'
import Image from 'next/legacy/image'
import React from 'react'
import { useRouter } from 'next/router'

const Playlist = () => {
    const router = useRouter()

    return (
        <Layout active='Tools'>
            <div className='w-full p-4' onClick={() => router.push('/tools/create-playlist/create-auto/')}>
                <div className='w-full relative h-[180px]'>
                    {/* Gradient overlay with a higher z-index */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-black opacity-80 z-10"></div>

                    {/* Background image with a lower z-index */}
                    <Image
                        src='https://media3.giphy.com/media/eNM4NlGpmCxzcXesjr/giphy.gif'
                        alt='Background Image'
                        layout='fill'
                        objectFit='cover'
                        className="z-0 rounded-lg"
                    />

                    {/* Text overlaid on top */}
                    <div className="absolute inset-0 flex flex-col items-start justify-end z-20 text-left p-4">
                        <h1 className="text-white text-sm font-bold">Create Automatically</h1>
                        <h2 className="text-gray-300 text-xs mt-1">Let Jukebox Automatically Create a Playlist For You</h2>
                    </div>
                </div>
            </div>

            <div className='w-full p-4'>
                <div className='w-full relative h-[180px]'>
                    {/* Gradient overlay with a higher z-index */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-black opacity-80 z-10"></div>

                    {/* Background image with a lower z-index */}
                    <Image
                        src='https://i.pinimg.com/736x/ac/18/c5/ac18c52e32481b09ef370f11a2cc2dd7.jpg'
                        alt='Background Image'
                        layout='fill'
                        objectFit='cover'
                        className="z-0 rounded-lg"
                    />

                    {/* Text overlaid on top */}
                    <div className="absolute inset-0 flex flex-col items-start justify-end z-20 text-left p-4" onClick={() => router.push('/tools/create-playlist/createbygenre/')}>
                        <h1 className="text-white text-sm font-bold">Create based off genre</h1>
                        <h2 className="text-gray-300 text-xs mt-1">Choose your favorite genres and craft a playlist unique to you.</h2>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Playlist
