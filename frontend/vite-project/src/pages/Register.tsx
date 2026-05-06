import { useState } from "react";
import axios from "axios";
import "./register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        email: email,
        password: password,
        username: username,
      });

      const loginResponse = await axios.post("http://localhost:8080/api/auth/login", {
        email: email,
        password: password,
      });

      const token = loginResponse.data.access_token || loginResponse.data.token;

      if (token && token !== 'undefined') {
        document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      document.cookie = `username=${username}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `userEmail=${email}; path=/; max-age=86400; SameSite=Lax`;

      setMessage({ type: "success", text: "🎉 Регистрация успешна!" });

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);

    } catch (error) {
      setMessage({ type: "error", text: "❌ " + (error.response?.data?.message || "Ошибка регистрации") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="glass-card">
        <div className="card-bg"></div>
        <div className="card-content">
          <div className="logo">
            <div className="logo-icon">🌟</div>
            <h1>Создать аккаунт</h1>
            <p>Присоединяйся к нам</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <span className="field-icon">👤</span>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <span className="field-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <span className="field-icon">🔒</span>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="glow-btn" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться →"}
            </button>

            <div className="footer-link">
              <a href="/login">↺ Уже есть аккаунт? Войти</a>
            </div>
          </form>

          {message && (
            <div className={`toast ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}