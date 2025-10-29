// src/pages/Auth.tsx (or wherever your login component is)
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 👇 Add this right below login/signup call
    if (!error && data?.user) {
      const { user } = data;

      await supabase.from('profiles').upsert({
        id: user.id,
        display_name:
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'New User',
      });
    }

    if (error) {
      alert(error.message);
    } else {
      alert('Login successful!');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
