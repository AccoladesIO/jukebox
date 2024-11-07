import Link from 'next/link'
import React from 'react'
import { HiMiniHome } from "react-icons/hi2";
import { FaChartSimple } from "react-icons/fa6";
import { FaToolbox } from "react-icons/fa6";






const BottomNav = ({ active }: { active: string }) => {
    const sideLink = [
        {
            id: 1,
            name: "Home",
            href: "/",
            icon: <HiMiniHome size={20} />
        },
        {
            id: 2,
            name: "Stats",
            href: "/stats/",
            icon: <FaChartSimple size={20} />
        },
        {
            id: 3,
            name: "Tools",
            href: "/tools/",
            icon: <FaToolbox size={20} />
        },
    ]


    return (
        <div className='bg-black w-full fixed bottom-0 left-0 sm:hidden flex items-center justify-between p-1 z-30 border-t'>
            {sideLink.map((_link, i) => (
                <div key={_link.id + _link.name + i} className={`text-[11px] w-full rounded-2xl transition-all duration-700 px-2 py-2 ${active === _link.name ? ' text-green-600 font-bold' : " text-slate-100"}`}>
                    <Link href={_link.href} className='w-full flex-col flex items-center justify-center gap-1'>
                        <span className="inline-block">
                            {_link.icon}
                        </span>
                        <span className={`inline-block`}>
                            {_link.name}
                        </span>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default BottomNav