/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from 'next';

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
        // Get the session using getServerSession
        const session: Session | null = await getServerSession(req, res, authOptions);

        // Debug: Log session information
        console.log("Session in API route:", session ? "Session exists" : "No session");

        if (!session) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const accessToken = session.accessToken;

        if (!accessToken) {
            console.log("No access token in session");
            return res.status(401).json({ message: 'No access token available' });
        }

        const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Debug: Log Spotify API response status
        console.log("Spotify API response status:", response.status);

        if (!response.ok) {
            const errorData: SpotifyErrorResponse = await response.json();
            console.error('Spotify API error:', response.status, errorData);
            return res.status(response.status).json({
                error: 'Spotify API error',
                details: errorData
            });
        }

        const data: SpotifyGenresResponse = await response.json();
        return res.status(200).json({ genres: data.genres });
    } catch (error: any) {
        console.error('Error in genre API handler:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}