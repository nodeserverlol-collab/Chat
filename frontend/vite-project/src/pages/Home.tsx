import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Убираем неиспользуемый интерфейс и переменную
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ username: 'User' });
    }
    setLoading(false);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const animateNumber = (start: number, end: number, duration: number, setter: (val: number) => void) => {
    const step = (end - start) / (duration / 10);
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setter(end);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, 10);
  };

  const [usersCount, setUsersCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    animateNumber(0, 10000, 2000, setUsersCount);
    animateNumber(0, 100000, 2000, setMessagesCount);
    animateNumber(0, 500, 2000, setOnlineCount);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      {!user ? (
        <div className="hero">
          <h1>Modern Chat</h1>
          <p>Быстрый и безопасный чат для общения</p>
          <div className="hero-buttons">
            <button onClick={handleLoginClick} className="btn-primary">
              Войти
            </button>
            <button onClick={handleRegisterClick} className="btn-secondary">
              Регистрация
            </button>
          </div>
        </div>
      ) : (
        <div className="welcome">
          <h2>Добро пожаловать, {user.username}!</h2>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <h3>{usersCount.toLocaleString()}+</h3>
          <p>Пользователей</p>
        </div>
        <div className="stat-card">
          <h3>{messagesCount.toLocaleString()}+</h3>
          <p>Сообщений в день</p>
        </div>
        <div className="stat-card">
          <h3>{onlineCount}+</h3>
          <p>Онлайн сейчас</p>
        </div>
      </div>
    </div>
  );
}