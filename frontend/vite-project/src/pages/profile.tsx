import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import "./Profile.css";

export default function Profile() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const getProfile = async () => {
    try {
      const token = getCookie('authToken');

      if (!token || token === 'undefined') {
        setError("Токен не найден");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8080/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setProfile(response.data);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getProfile();
    } else if (!authLoading) {
      setLoading(false);
      setError("Пожалуйста, войдите в систему");
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="error-card">
          <div className="error-icon">🔒</div>
          <h3>Требуется авторизация</h3>
          <p>Пожалуйста, войдите в систему</p>
          <button onClick={() => window.location.href = "/login"} className="error-btn">
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button onClick={() => window.location.href = "/login"} className="error-btn">
            Войти снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-inner">
              {profile?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <h2>{profile?.username || "Пользователь"}</h2>
          <p className="profile-email">{profile?.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <div className="info-label">
              <span className="info-icon">🆔</span>
              <span>ID пользователя</span>
            </div>
            <div className="info-value">{profile?.user_id || profile?.id || "—"}</div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <span className="info-icon">📧</span>
              <span>Email</span>
            </div>
            <div className="info-value">{profile?.email || "—"}</div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <span className="info-icon">👤</span>
              <span>Имя пользователя</span>
            </div>
            <div className="info-value">{profile?.username || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}