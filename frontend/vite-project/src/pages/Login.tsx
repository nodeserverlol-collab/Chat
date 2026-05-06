import { useState } from "react";
import axios from "axios";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const loginResponse = await axios.post("http://localhost:8080/api/auth/login", {
        email: email,
        password: password,
      });

      const token = loginResponse.data.access_token || loginResponse.data.token;

      if (token && token !== 'undefined') {
        document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      document.cookie = `username=${loginResponse.data.username}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `userEmail=${email}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `userId=${loginResponse.data.user_id || loginResponse.data.id}; path=/; max-age=86400; SameSite=Lax`;

      setMessage({ type: "success", text: "✅ Вход выполнен! Перенаправление..." });

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);

    } catch (error) {
      setMessage({
        type: "error",
        text: "❌ " + (error.response?.data?.detail || "Ошибка входа")
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="glass-card">
        <div className="card-bg"></div>
        <div className="card-content">
          <div className="logo">
            <div className="logo-icon">🚀</div>
            <h1>Добро пожаловать</h1>
            <p>Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit}>
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
              {isLoading ? "Загрузка..." : "Войти →"}
            </button>

            <div className="footer-link">
              <a href="/register">✨ Создать аккаунт</a>
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

export default Login;