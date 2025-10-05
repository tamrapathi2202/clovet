import { useState, useEffect } from 'react';
import { User, Mail, Calendar, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    email: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfile({
        email: user.email || '',
        created_at: user.created_at || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-[#9d8566] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile</h2>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#9d8566] to-[#b89a7a] p-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-[#9d8566]" />
            </div>
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1">
                {profile?.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-white/90">Clovet Member</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900">Account Information</h4>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Email Address</p>
                <p className="text-slate-900 font-medium">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Member Since</p>
                <p className="text-slate-900 font-medium">
                  {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Actions</h4>

            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition" />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 font-medium">Sign Out</p>
                    <p className="text-sm text-slate-600">Sign out of your account</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    console.log('Delete account');
                  }
                }}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700 transition" />
                  </div>
                  <div className="text-left">
                    <p className="text-red-900 font-medium">Delete Account</p>
                    <p className="text-sm text-red-700">Permanently delete your account and data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
