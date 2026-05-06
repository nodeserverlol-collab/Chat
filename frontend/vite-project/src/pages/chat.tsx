import { useEffect, useState, useRef } from "react";
import { useAuth } from "./useAuth";
import "./chat.css";

export default function Chat() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Подключение к WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user?.username) return;

    const token = getCookie('authToken');
    if (!token) return;

    // Подключаемся к WebSocket с токеном
    const ws = new WebSocket(`ws://localhost:8080/api/auth/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "new_message":
          setMessages(prev => [...prev, {
            id: data.id,
            username: data.username,
            content: data.content,
            created_at: data.created_at
          }]);
          break;

        case "old_message":
          setMessages(prev => [...prev, {
            id: data.id || Date.now(),
            username: data.username,
            content: data.content,
            created_at: data.created_at
          }]);
          break;

        case "user_list":
          setOnlineUsers(data.users);
          break;

        default:
          console.log("Unknown message type:", data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated, user]);

  // Отправка сообщения
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setIsLoading(true);
    const message = {
      type: "message",
      content: newMessage
    };

    wsRef.current.send(JSON.stringify(message));
    setNewMessage("");
    setIsLoading(false);
  };

  if (authLoading) {
    return <div className="chat-loading">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="chat-auth-error">
        <div className="error-card">
          <div className="error-icon">🔒</div>
          <h2>Доступ ограничен</h2>
          <p>Только зарегистрированные пользователи могут пользоваться чатом</p>
          <button onClick={() => window.location.href = "/login"} className="error-btn">
            Войти в аккаунт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="user-details">
            <h3>{user?.username || "Пользователь"}</h3>
            <p className="online-status">🟢 Онлайн</p>
          </div>
        </div>

        <div className="online-users">
          <h4>👥 Онлайн ({onlineUsers.length})</h4>
          <ul className="users-list">
            {onlineUsers.map((username, index) => (
              <li key={index} className="online-user">
                <span className="online-dot"></span>
                {username}
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-info">
          <h4>ℹ️ О чате</h4>
          <p>Общайся с другими пользователями в реальном времени</p>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>💬 Общий чат</h2>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Подключен' : 'Отключен'}
          </div>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="no-messages">
              <div className="no-messages-icon">💬</div>
              <p>Пока нет сообщений</p>
              <p className="no-messages-sub">Будь первым, кто напишет!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === user?.username ? 'my-message' : 'other-message'}`}
              >
                <div className="message-avatar">
                  {msg.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="message-text">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="message-input"
            disabled={!isConnected || isLoading}
          />
          <button type="submit" className="send-btn" disabled={!isConnected || isLoading}>
            {isLoading ? "⏳" : "📤"}
          </button>
        </form>
      </div>
    </div>
  );
}