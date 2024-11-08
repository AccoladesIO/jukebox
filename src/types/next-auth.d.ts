// src/types/next-auth.d.ts

import 'next-auth'; // Only import the module for augmentation

declare module 'next-auth' {
    interface Session {
        accessToken: string;
        user: {
            id: string; // Add this line
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };// Add the accessToken property
    }
}
