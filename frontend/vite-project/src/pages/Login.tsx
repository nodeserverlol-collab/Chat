import { useState } from "react";
import axios from "axios";
import "./login.css";

interface LoginResponse {
  access_token?: string;
  token?: string;
  username: string;
  user_id?: number;
  id?: number;
}

interface Message {
  type: "success" | "error";
  text: string;
}

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const loginResponse = await axios.post<LoginResponse>("http://localhost:8080/api/auth/login", {
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

    } catch (error: unknown) {
      let errorText = "❌ Ошибка входа";

      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorText = `❌ ${error.response.data.detail}`;
      }

      setMessage({ type: "error", text: errorText });
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <span className="field-icon">🔒</span>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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