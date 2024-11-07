// pages/api/top-artists.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch top artists');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
