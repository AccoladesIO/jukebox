// src/types/next-auth.d.ts

import 'next-auth'; // Only import the module for augmentation

declare module 'next-auth' {
    interface Session {
        accessToken: string; // Add the accessToken property
    }
}
