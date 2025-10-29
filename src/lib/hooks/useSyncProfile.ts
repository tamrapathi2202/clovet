// src/hooks/useSyncProfile.ts
import { supabase } from '../supabaseClient';
import { useEffect } from 'react';

export function useSyncProfile() {
  useEffect(() => {
    const syncProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          display_name:
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'New User'
        });
      }
    };

    syncProfile();
  }, []);
}
