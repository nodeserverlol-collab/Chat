import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

interface Stats {
  users: number;
  messages: number;
  online: number;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    messages: 0,
    online: 0
  });

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    const token = getCookie('authToken');
    setIsAuthenticated(!!token && token !== 'undefined');

    // Анимация для цифр
    const animateValue = (
      start: number,
      end: number,
      duration: number,
      setter: (val: number) => void
    ) => {
      const increment = (end - start) / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
    };

    // Симулируем получение статистики
    animateValue(0, 1542, 2000, (val: number) => setStats(prev => ({ ...prev, users: val })));
    animateValue(0, 28743, 2500, (val: number) => setStats(prev => ({ ...prev, messages: val })));
    animateValue(0, 89, 1500, (val: number) => setStats(prev => ({ ...prev, online: val })));
  }, []);

  const features: Feature[] = [
    {
      icon: "💬",
      title: "Мгновенные сообщения",
      description: "Общайтесь в реальном времени с друзьями и коллегами без задержек"
    },
    {
      icon: "🔒",
      title: "Безопасность",
      description: "Все сообщения зашифрованы, ваши данные под надежной защитой"
    },
    {
      icon: "🎨",
      title: "Современный дизайн",
      description: "Красивый интерфейс с темной темой и плавными анимациями"
    },
    {
      icon: "📱",
      title: "Адаптивность",
      description: "Работает на всех устройствах: ПК, планшетах и смартфонах"
    },
    {
      icon: "⚡",
      title: "Высокая производительность",
      description: "Быстрая загрузка сообщений и мгновенная отправка"
    },
    {
      icon: "👥",
      title: "Командный чат",
      description: "Создавайте группы и общайтесь с несколькими участниками"
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: "Free",
      price: "0",
      period: "месяц",
      features: ["Базовый чат", "100 сообщений/день", "1 комната", "Базовая поддержка"],
      buttonText: "Начать",
      popular: false
    },
    {
      name: "Premium",
      price: "499",
      period: "месяц",
      features: ["Неограниченный чат", "Безлимит сообщений", "Неограниченно комнат", "Приоритетная поддержка", "История сообщений", "Создание групп"],
      buttonText: "Попробовать 14 дней",
      popular: true
    },
    {
      name: "Team",
      price: "999",
      period: "месяц",
      features: ["Все Premium возможности", "Админ-панель", "API доступ", "Аналитика", "Интеграции", "SLA поддержка"],
      buttonText: "Связаться с нами",
      popular: false
    }
  ];

  const handleGetStarted = (): void => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          ✨ Новое поколение чатов
        </div>

        <h1 className="hero-title">
          Общайся с миром в
          <span className="hero-title-gradient"> Real-Time</span>
        </h1>

        <p className="hero-description">
          Современная платформа для общения с друзьями, коллегами и единомышленниками.
          Безопасно, быстро и удобно.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleGetStarted}>
            {isAuthenticated ? "Начать общение →" : "Начать бесплатно →"}
          </button>
          <button className="btn-secondary" onClick={() => navigate("/price")}>
            💎 Premium версия
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{stats.users}+</div>
          <div className="stat-label">Пользователей</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.messages.toLocaleString()}+</div>
          <div className="stat-label">Сообщений отправлено</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.online}</div>
          <div className="stat-label">Сейчас онлайн</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">
          Почему выбирают <span className="gradient-text">Modern Chat</span>
        </h2>
        <p className="section-subtitle">
          Все необходимое для комфортного общения в одном месте
        </p>

        <div className="features-grid">
          {features.map((feature: Feature, index: number) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Готов начать общаться?</h2>
          <p>Присоединяйся к тысячам пользователей уже сегодня</p>
          <button className="cta-btn" onClick={handleGetStarted}>
            {isAuthenticated ? "Перейти в чат →" : "Создать аккаунт →"}
          </button>
        </div>
      </div>
    </div>
  );
}