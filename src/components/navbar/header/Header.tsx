import React from 'react'

const Header = ({ active }: { active: string }) => {
    return (
        <div className='w-full p-4 flex items-center justify-center bg-[#181818]'>
            <div className='w-full text-white text-center font-bold'>{active}</div>
        </div>
    )
}

export default Header
