import './Docs.css';

function Docs() {
  return (
    <div className="docs-page">
      <div className="docs-header">
        <h1>📚 Документация WebSocket Chat</h1>
        <p>Простой и быстрый чат для общения в реальном времени</p>
      </div>

      <div className="docs-content">
        {/* О продукте */}
        <section className="docs-section">
          <h2>💬 О чате</h2>
          <p>
            <strong>Modern Chat</strong> — это простой веб-чат для общения между людьми в реальном времени.
          </p>
          <p>
            Чат работает на WebSocket технологии, что позволяет отправлять и получать сообщения
            мгновенно без задержек и перезагрузки страницы.
          </p>
        </section>

        {/* Возможности */}
        <section className="docs-section">
          <h2>✨ Возможности</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-emoji">⚡</span>
              <h3>Мгновенные сообщения</h3>
              <p>Отправка и получение без задержек</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">👥</span>
              <h3>Групповые чаты</h3>
              <p>Общение с несколькими участниками</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">🎨</span>
              <h3>Современный дизайн</h3>
              <p>Красивый и удобный интерфейс</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">📱</span>
              <h3>Адаптивность</h3>
              <p>Работает на любых устройствах</p>
            </div>
          </div>
        </section>

        {/* Установка */}
        <section className="docs-section">
          <h2>📦 Установка и запуск</h2>
          <div className="code-block">
            <pre>
              <code># Клонируем репозиторий
git clone https://github.com/modernchat/web-chat.git

# Устанавливаем зависимости
npm install

# Запускаем сервер
npm run dev</code>
            </pre>
          </div>
        </section>

        {/* Технологии */}
        <section className="docs-section">
          <h2>🛠 Технологии</h2>
          <div className="tech-list">
            <div className="tech-item">
              <span className="tech-name">Frontend</span>
              <p>React, TypeScript, WebSocket API</p>
            </div>
            <div className="tech-item">
              <span className="tech-name">Backend</span>
              <p>Node.js, Express, ws (WebSocket)</p>
            </div>
            <div className="tech-item">
              <span className="tech-name">Стили</span>
              <p>CSS Modules, Flexbox, Grid</p>
            </div>
          </div>
        </section>

        {/* Использование */}
        <section className="docs-section">
          <h2>🚀 Как пользоваться</h2>

          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Войдите в чат</h3>
              <p>Введите ваше имя и нажмите "Войти"</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Начните общение</h3>
              <p>Введите сообщение в поле внизу и нажмите Enter или кнопку отправки</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Общайтесь в реальном времени</h3>
              <p>Все участники видят сообщения мгновенно</p>
            </div>
          </div>
        </section>

        {/* WebSocket API */}
        <section className="docs-section">
          <h2>🔌 WebSocket API</h2>

          <div className="api-item">
            <h3>
              <code className="method">Подключение</code>
            </h3>
            <div className="code-block">
              <pre>
                <code>{`const ws = new WebSocket('ws://localhost:3001');`}</code>
              </pre>
            </div>
          </div>

          <div className="api-item">
            <h3>
              <code className="method">Отправка сообщения</code>
            </h3>
            <div className="code-block">
              <pre>
                <code>{`ws.send(JSON.stringify({
  type: 'message',
  username: 'Анна',
  text: 'Привет всем!',
  timestamp: Date.now()
}));`}</code>
              </pre>
            </div>
          </div>

          <div className="api-item">
            <h3>
              <code className="method">Получение сообщений</code>
            </h3>
            <div className="code-block">
              <pre>
                <code>{`ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data); // Новое сообщение
};`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Пример кода */}
        <section className="docs-section">
          <h2>💻 Пример использования</h2>
          <div className="code-block">
            <pre>
              <code>{`import { useState, useEffect } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    setWs(socket);
    
    return () => socket.close();
  }, []);

  const sendMessage = (text) => {
    ws.send(JSON.stringify({
      type: 'message',
      text: text,
      username: 'User'
    }));
  };

  return (
    <div className="chat">
      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.username}:</strong> {msg.text}
        </div>
      ))}
      <input onKeyPress={(e) => {
        if (e.key === 'Enter') sendMessage(e.target.value);
      }} />
    </div>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* FAQ */}
        <section className="docs-section">
          <h2>❓ Частые вопросы</h2>

          <div className="faq-item">
            <h3>Сколько людей может быть в чате?</h3>
            <p>Неограниченное количество пользователей одновременно.</p>
          </div>

          <div className="faq-item">
            <h3>Сохраняются ли сообщения?</h3>
            <p>Сообщения хранятся в памяти сервера во время сессии.</p>
          </div>

          <div className="faq-item">
            <h3>Нужна ли регистрация?</h3>
            <p>Нет, просто введите любое имя и начинайте общение.</p>
          </div>
        </section>

        {/* Контакты */}
        <section className="docs-section">
          <h2>📞 Контакты</h2>
          <ul className="contacts">
            <li>📧 Email: <a href="mailto:chat@modernchat.com">chat@modernchat.com</a></li>
            <li>💬 Telegram: <a href="#">@modernchat</a></li>
            <li>🐛 GitHub: <a href="#">github.com/modernchat</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Docs;