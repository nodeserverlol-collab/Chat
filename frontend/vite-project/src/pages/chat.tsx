import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth'; // Убедитесь, что файл существует

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

export default function Chat() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3001/ws');

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev: Message[]) => [...prev, data]);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && ws && ws.readyState === WebSocket.OPEN && user) {
      ws.send(JSON.stringify({
        username: user.username,
        content: input,
        created_at: new Date().toISOString()
      }));
      setInput('');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <div>Пожалуйста, войдите в систему</div>;

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            <strong>{msg.username}:</strong> {msg.content}
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}