/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from 'next';
const baseURL = process.env.INTERNAL_URL;

interface Session {
    accessToken?: string;
}

interface SpotifyErrorResponse {
    error: string;
    details: any;
}

interface SpotifyGenresResponse {
    genres: string[];
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session: Session | null = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const accessToken = session.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: 'No access token available' });
        }
        const response = await fetch(`${baseURL}/recommendations/available-genre-seeds`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData: SpotifyErrorResponse = await response.json();
            return res.status(response.status).json({
                error: 'Spotify API error',
                details: errorData
            });
        }
        const data: SpotifyGenresResponse = await response.json();
        return res.status(200).json({ genres: data.genres });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(500).json({ error: 'Internal server error', message: error.message });
       }
    }
}