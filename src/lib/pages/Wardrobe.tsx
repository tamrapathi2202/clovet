// src/pages/Wardrobe.tsx
import React from 'react';
import { useSyncProfile } from '../hooks/useSyncProfile';

export default function WardrobePage() {
  useSyncProfile(); // ✅ Sync profile automatically when user logs in

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">👕 Welcome to Clovet Wardrobe</h1>
      <p className="mt-2 text-gray-600">
        Your profile is now synced with Supabase. Start adding outfits!
      </p>
    </div>
  );
}
