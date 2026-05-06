import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import axios from 'axios';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  user_id?: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ProfileData>('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err: unknown) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Загрузка...</div>;
  if (!user || !profile) return <div>Не авторизован</div>;

  return (
    <div className="profile-container">
      <h1>Профиль</h1>
      <div className="profile-info">
        <p><strong>ID:</strong> {profile.id || profile.user_id}</p>
        <p><strong>Имя пользователя:</strong> {profile.username || user.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>
      <button onClick={logout} className="logout-btn">Выйти</button>
    </div>
  );
}