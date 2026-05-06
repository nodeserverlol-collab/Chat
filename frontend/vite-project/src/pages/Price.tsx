import axios from "axios";
import { useState, useEffect } from "react";
import "./Price.css";

interface Subscription {
  expires_at: string;
  plan_name: string;
}

interface PriceData {
  subscription: Subscription;
}

export default function Price() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get<PriceData>('/api/subscription');
        setSubscription(response.data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Выберите тариф</h1>
        <p>Подходящий план для ваших задач</p>
      </div>

      <div className="pricing-grid">
        {/* Free Version */}
        <div className="pricing-card free">
          <div className="card-badge">Бесплатно</div>
          <div className="card-price">
            <span className="currency">$</span>
            <span className="amount">0</span>
            <span className="period">/месяц</span>
          </div>
          <h3>Free Version</h3>
          <p className="description">Базовые возможности для начала</p>

          <ul className="features-list">
            <li className="feature disabled">❌ Связь с администратором</li>
            <li className="feature disabled">❌ Просмотр профиля</li>
            <li className="feature">✅ Базовый чат</li>
            <li className="feature">✅ 100 сообщений в день</li>
            <li className="feature disabled">❌ История сообщений</li>
          </ul>

          {subscription?.plan_name === 'free' ? (
            <button className="btn-outline" disabled>Текущий план</button>
          ) : (
            <button className="btn-primary">Выбрать</button>
          )}
        </div>

        {/* Premium Version */}
        <div className="pricing-card premium popular">
          <div className="card-badge">Популярный</div>
          <div className="card-price">
            <span className="currency">$</span>
            <span className="amount">9.99</span>
            <span className="period">/месяц</span>
          </div>
          <h3>Premium Version</h3>
          <p className="description">Расширенные возможности</p>

          <ul className="features-list">
            <li className="feature">✅ Связь с администратором</li>
            <li className="feature">✅ Просмотр профиля</li>
            <li className="feature">✅ Неограниченный чат</li>
            <li className="feature">✅ Безлимит сообщений</li>
            <li className="feature">✅ История сообщений</li>
            <li className="feature">✅ Приоритетная поддержка</li>
          </ul>

          {subscription?.plan_name === 'premium' && (
            <div className="expires-info">
              Действует до: {new Date(subscription.expires_at).toLocaleDateString()}
            </div>
          )}
          <button className="btn-primary">Начать 14-дневный триал</button>
        </div>
      </div>
    </div>
  );
}