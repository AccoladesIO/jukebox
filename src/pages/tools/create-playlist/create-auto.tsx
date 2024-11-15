import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'

const PlaylistGenerator = () => {
    const { data: session } = useSession();
    const [name, setName] = useState("");

    const handleSubmit = async () => {
        if (!session) return;
        try {
            const response = await axios.post("/api/create-playlist-auto", { name });
            console.log("Playlist created:", response.data);
        } catch (error) {
            console.error("Error creating playlist", error);
        }
    };

    return (
        <div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Playlist Name" />
            <button onClick={handleSubmit}>Generate Playlist from Top Artists</button>
        </div>
    );
};


export default PlaylistGenerator
