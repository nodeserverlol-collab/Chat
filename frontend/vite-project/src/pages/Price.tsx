import axios from "axios";
import { useState, useEffect } from "react";
import "./Price.css";

export default function Price() {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Проверка авторизации
  useEffect(() => {
    const token = getCookie('authToken');
    setIsAuthenticated(!!token && token !== 'undefined');

    // Проверка текущей подписки пользователя
    if (token) {
      checkSubscription();
    }
  }, []);

  // Проверка текущей подписки
  const checkSubscription = async () => {
    try {
      const token = getCookie('authToken');
      const response = await axios.get('http://localhost:8080/api/auth/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Обработка оплаты для Premium
  const handleSubscribe = async (planType) => {
    if (!isAuthenticated) {
      alert("Пожалуйста, войдите в аккаунт для оформления подписки");
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    try {
      const token = getCookie('authToken');
      const response = await axios.post('http://localhost:8080/api/auth/create-payment',
        {
          plan_type: planType,
          success_url: window.location.origin + "/profile",
          cancel_url: window.location.origin + "/price"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.payment_url) {
        // Перенаправляем на страницу оплаты Stripe
        window.location.href = response.data.payment_url;
      } else {
        alert("Ошибка создания платежа");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.detail || "Ошибка при создании платежа");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка отмены подписки
  const handleCancelSubscription = async () => {
    if (!confirm("Вы уверены, что хотите отменить подписку?")) return;

    setIsLoading(true);
    try {
      const token = getCookie('authToken');
      await axios.post('http://localhost:8080/api/auth/cancel-subscription', {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      alert("Подписка успешно отменена");
      await checkSubscription();
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Ошибка при отмене подписки");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Выберите тариф</h1>
        <p>Подходящий план для ваших задач</p>
        {subscription && subscription.is_active && (
          <div className="current-subscription">
            🎉 Ваш текущий план: <strong>{subscription.plan_name}</strong>
            {subscription.expires_at && (
              <span> (до {new Date(subscription.expires_at).toLocaleDateString()})</span>
            )}
          </div>
        )}
      </div>

      <div className="pricing-grid">
        {/* Free Version */}
        <div className="pricing-card free">
          <div className="card-badge">Бесплатно</div>
          <div className="card-price">
            <span className="currency">₽</span>
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

          <button
            className="btn-outline"
            disabled={subscription?.plan_name === 'free' || isLoading}
          >
            {subscription?.plan_name === 'free' ? "Текущий план" : "Бесплатно"}
          </button>
        </div>

        {/* Premium Version */}
        <div className="pricing-card premium popular">
          <div className="card-badge">Популярный</div>
          <div className="card-price">
            <span className="currency">₽</span>
            <span className="amount">499</span>
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
            <li className="feature">✅ Создание групп</li>
          </ul>

          <button
            className="btn-primary"
            onClick={() => handleSubscribe('premium')}
            disabled={subscription?.plan_name === 'premium' || isLoading}
          >
            {isLoading ? "Обработка..." : subscription?.plan_name === 'premium' ? "Текущий план" : "Начать 14-дневный триал"}
          </button>

          {subscription?.plan_name === 'premium' && (
            <button
              className="btn-cancel"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              Отменить подписку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}