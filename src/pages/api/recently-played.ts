import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// A utility function to fetch data from the Spotify Web API
async function fetchWebApi(endpoint: string, accessToken: string, method: string = 'GET', body?: object) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json', // Set content type for POST requests
        },
        method,
        body: body ? JSON.stringify(body) : undefined, // Only stringify body if it exists
    });
    return res; // Return the raw response to check status later
}

// Main API handler function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const accessToken = session.accessToken; // Access token from session

    // Add a log to confirm the accessToken is present
    // console.log("Access Token:", accessToken);

    // Fetch the recently played tracks using the utility function
    const response = await fetchWebApi('v1/me/player/recently-played', accessToken);
    console.log(response)

    if (!response.ok) {
        const errorData = await response.json(); // Get error message from Spotify
        return res.status(response.status).json({ error: errorData.error.message || 'Failed to fetch recently played tracks' });
    }

    const data = await response.json();
    res.status(200).json(data);
};

export default handler;
