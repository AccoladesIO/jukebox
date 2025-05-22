import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
const baseURL = process.env.INTERNAL_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session?.accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const response = await fetch(`${baseURL}/browse/new-releases`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.statusText}`);
        }
        const data = await response.json();
        res.status(200).json(data.albums.items); 
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}
