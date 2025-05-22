/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";
interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: { filter_enabled: boolean; filter_locked: boolean };
    external_urls: { spotify: string };
    followers: { href: string; total: number };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}
interface Image {
    url: string;
    height: number;
    width: number;
}
const baseURL = process.env.INTERNAL_URL;
const spotifyApi = (accessToken: string) =>
    axios.create({
        baseURL: `${baseURL}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    if (!session || !session.accessToken) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    const accessToken = session.accessToken;
    try {
        const profile = await fetchProfile(accessToken);
        const userId = profile.id;
        const topArtists = await getTopArtists(accessToken);
        const artistIds = topArtists.map((artist: { id: string }) => artist.id);
        const tracks = await getTopTracksFromArtists(accessToken, artistIds);
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Playlist name is required" });
        }
        const playlist = await createPlaylist(accessToken, userId, name);
        await addTracksToPlaylist(accessToken, playlist.id, tracks);
        res.status(200).json(playlist);
    } catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "An unknown error occurred",
        });
    }
}


const fetchProfile = async (token: string): Promise<UserProfile> => {
    try {
        const response = await spotifyApi(token).get("/me");
        return response.data;
    } catch (error: unknown) {
        throw error;
    }
};

const getTopArtists = async (accessToken: string) => {
    try {
        const response = await spotifyApi(accessToken).get("/me/top/artists?limit=10&time_range=short_term");
        return response.data.items;
    } catch (error: unknown) {
        throw error;
    }
};

const getTopTracksFromArtists = async (accessToken: string, artistIds: string[]) => {
    try {
        const trackPromises = artistIds.map(artistId =>
            spotifyApi(accessToken)
                .get(`/artists/${artistId}/top-tracks?market=US`)
                .then(response => response.data.tracks.map((track: { uri: string }) => track.uri).slice(0, 3))
        );
        const trackArrays = await Promise.all(trackPromises);
        return trackArrays.flat();
    } catch (error: unknown) {
        throw error;
    }
};

const createPlaylist = async (accessToken: string, userId: string, name: string) => {
    try {
        const response = await spotifyApi(accessToken).post(`/users/${userId}/playlists`, {
            name,
            public: false,
        });
        return response.data;
    } catch (error: unknown) {
        throw error;
    }
};

const addTracksToPlaylist = async (accessToken: string, playlistId: string, tracks: string[]) => {
    try {
        const response = await spotifyApi(accessToken).post(`/playlists/${playlistId}/tracks`, { uris: tracks });
        return response.data;
    } catch (error: unknown) {
        throw error;
    }
};
