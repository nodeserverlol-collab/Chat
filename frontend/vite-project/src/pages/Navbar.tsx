import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const checkAuth = () => {
    const token = getCookie('authToken');
    const user = getCookie('username');
    if (token && token !== 'undefined') {
      setIsAuthenticated(true);
      setUsername(user || "");
    } else {
      setIsAuthenticated(false);
      setUsername("");
    }
  };

  const handleLogout = () => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    navigate("/");
  };

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/">ModernChat</a>
        </div>

        <div className="nav-links">
          <a href="/" className={isActive("/") ? "active" : ""}>
            Главная
          </a>
          <a href="/Docs" className={isActive("/about") ? "active" : ""}>
            О нас
          </a>
          <a href="/price" className={isActive("/price") ? "active" : ""}>
            Тарифы
          </a>

          {isAuthenticated && (
            <a href="/chat" className={isActive("/chat") ? "active" : ""}>
              Чат
            </a>
          )}

          {isAuthenticated ? (
            <>
              <div className="profile-dropdown">
                <button className="profile-btn">
                  {username || "Профиль"}
                </button>
                <div className="dropdown-menu">
                  <a href="/profile">Мой профиль</a>
                  <a href="/settings">Настройки</a>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-logout">
                    Выйти
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="login-link">Войти</a>
              <a href="/register" className="register-link-nav">Регистрация</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}