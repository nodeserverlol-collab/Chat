// src/pages/profile.tsx
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import axios from 'axios';

interface ProfileData {
  id: number;
  username: string;
  email: string;
}

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ProfileData>('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (authLoading || loading) return <div>Загрузка...</div>;
  if (!user || !profile) return <div>Не авторизован</div>;

  return (
    <div className="profile-container">
      <h1>Профиль</h1>
      <div className="profile-info">
        <p><strong>ID:</strong> {profile.id}</p>
        <p><strong>Имя пользователя:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>
      <button onClick={logout} className="logout-btn">Выйти</button>
    </div>
  );
}