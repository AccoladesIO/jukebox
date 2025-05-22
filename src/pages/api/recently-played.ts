import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
const baseURL = process.env.INTERNAL_URL;

async function fetchWebApi(endpoint: string, accessToken: string, method: string = 'GET', body?: object) {
    const res = await fetch(`${baseURL}/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        method,
        body: body ? JSON.stringify(body) : undefined,
    });
    return res;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const accessToken = session.accessToken;
    const response = await fetchWebApi('/me/player/recently-played', accessToken);
    if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData.error.message || 'Failed to fetch recently played tracks' });
    }
    const data = await response.json();
    res.status(200).json(data);
};
export default handler;
