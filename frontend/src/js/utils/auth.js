// src/js/utils/auth.js
import { CONFIG } from "../../config.js";

export const auth = {
  /**
   * Логин пользователя
   */
  async login(username, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка входа");
      }

      const data = await response.json();

      // Сохраняем токены в localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error("Ошибка логина:", error);
      throw error;
    }
  },

  /**
   * Регистрация пользователя
   */
  async register(userData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/accounts/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Получаем детали ошибки из ответа
        const errorData = await response.json();
        console.error("Ошибка регистрации:", errorData);

        // Формируем понятное сообщение
        let errorMessage = "Ошибка регистрации. Проверьте введённые данные.";

        // Если есть конкретные ошибки полей
        if (errorData.password2) {
          errorMessage = errorData.password2[0];
        } else if (errorData.username) {
          errorMessage = `Имя пользователя: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.village) {
          errorMessage = "Укажите населённый пункт";
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    }
  },

  /**
   * Получение заголовка авторизации
   */
  getAuthHeader() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Проверка авторизации
   */
  isLoggedIn() {
    return !!localStorage.getItem("access_token");
  },

  /**
   * Получение данных пользователя
   */
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Выход из системы
   */
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  /**
   * Получение профиля пользователя
   */
  async getProfile() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/accounts/profile/`, {
        headers: {
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка получения профиля");
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data)); // Обновляем кэш
      return data;
    } catch (error) {
      console.error("Ошибка получения профиля:", error);
      // Возвращаем кэшированные данные, если есть
      const cachedUser = localStorage.getItem("user");
      return cachedUser ? JSON.parse(cachedUser) : null;
    }
  },
};
