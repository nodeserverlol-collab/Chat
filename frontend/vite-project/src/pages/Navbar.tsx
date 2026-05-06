import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

// Интерфейс для состояния навбара
interface NavbarState {
  isAuthenticated: boolean;
  username: string;
}

// Интерфейс для cookie
interface CookieOptions {
  name: string;
  value?: string;
  expires?: string;
  path?: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<NavbarState>({
    isAuthenticated: false,
    username: ""
  });

  // Дженерик для получения куки
  const getCookie = <T extends string>(name: T): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const result = parts.pop()?.split(';').shift();
      return result || null;
    }
    return null;
  };

  // Установка куки с опциями
  const setCookie = ({ name, value, expires, path = "/" }: CookieOptions): void => {
    document.cookie = `${name}=${value || ""}; expires=${expires || ""}; path=${path}`;
  };

  // Удаление куки
  const removeCookie = (name: string): void => {
    setCookie({ name, expires: "Thu, 01 Jan 1970 00:00:00 UTC" });
  };

  // Проверка авторизации
  const checkAuth = (): void => {
    const token = getCookie('authToken');
    const user = getCookie('username');

    setState({
      isAuthenticated: !!(token && token !== 'undefined'),
      username: user || ""
    });
  };

  // Выход из аккаунта
  const handleLogout = (): void => {
    ['authToken', 'username', 'userEmail', 'userId'].forEach(removeCookie);
    setState({ isAuthenticated: false, username: "" });
    navigate("/");
  };

  // Проверка активного пути
  const isActive = (path: string): boolean => location.pathname === path;

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/">ModernChat</a>
        </div>

        <div className="nav-links">
          <NavLink href="/" isActive={isActive("/")}>Главная</NavLink>
          <NavLink href="/Docs" isActive={isActive("/about")}>О нас</NavLink>
          <NavLink href="/Price" isActive={isActive("/price")}>Тарифы</NavLink>

          {state.isAuthenticated && (
            <NavLink href="/chat" isActive={isActive("/chat")}>Чат</NavLink>
          )}

          {state.isAuthenticated ? (
            <ProfileDropdown
              username={state.username}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <NavLink href="/Login" className="login-link">Войти</NavLink>
              <NavLink href="/Register" className="register-link-nav">Регистрация</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Компонент для ссылок навигации
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive, className }) => (
  <a
    href={href}
    className={`${className || ""} ${isActive ? "active" : ""}`.trim()}
  >
    {children}
  </a>
);

// Компонент выпадающего меню профиля
interface ProfileDropdownProps {
  username: string;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ username, onLogout }) => (
  <div className="profile-dropdown">
    <button className="profile-btn" type="button">
      {username || "Профиль"}
    </button>
    <div className="dropdown-menu">
      <a href="/profile">Мой профиль</a>
      <a href="/settings">Настройки</a>
      <hr />
      <button
        onClick={onLogout}
        className="dropdown-logout"
        type="button"
      >
        Выйти
      </button>
    </div>
  </div>
);