import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSyncProfile } from '../hooks/useSyncProfile';

export default function WardrobePage() {
  // ✅ Sync profile automatically when user logs in
  useSyncProfile();

  // ✅ State variables
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');

  // ✅ Upload handler
  const handleUpload = async () => {
    if (!imageFile) return alert('Please select an image');
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in first');
      setUploading(false);
      return;
    }

    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { error: storageError } = await supabase.storage
      .from('wardrobe-images')
      .upload(fileName, imageFile);

    if (storageError) {
      alert('Upload failed');
      console.error(storageError);
    } else {
      const imageUrl = supabase.storage
        .from('wardrobe-images')
        .getPublicUrl(fileName).data.publicUrl;

      const { error: insertError } = await supabase.from('wardrobe_items').insert({
        user_id: user.id,
        name,
        category,
        image_url: imageUrl,
      });

      if (insertError) {
        console.error(insertError);
        alert('Failed to save item to database');
      } else {
        alert('Item added successfully!');
        setName('');
        setCategory('');
        setImageFile(null);
        window.location.reload(); // Refresh to show the new item
      }
    }

    setUploading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">👕 Welcome to Clovet Wardrobe</h1>
      <p className="mt-2 text-gray-600">
        Your profile is now synced with Supabase. Start adding outfits!
      </p>

      {/* ✅ Upload new wardrobe item */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Add New Item</h2>

        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        />

        <input
          type="text"
          placeholder="Category (e.g., T-shirt, Jacket)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        />

        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="border rounded p-2 w-full mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Item'}
        </button>
      </div>
    </div>
  );
}
