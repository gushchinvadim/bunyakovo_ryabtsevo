// src/js/components/LoginPage.js
import { auth } from "../utils/auth.js";

export function createLoginPage() {
  const page = document.createElement("div");
  page.className = "login-page";

  // Если пользователь уже залогинен, перенаправляем на барахолку
  if (auth.isLoggedIn()) {
    page.innerHTML = `
      <div class="auth-redirect">
        <div class="card">
          <div class="card-content" style="text-align:center;padding:40px">
            <p style="font-size:1.2rem;margin-bottom:20px">Вы уже авторизованы!</p>
            <a href="/marketplace" class="btn-primary" style="display:inline-block;padding:12px 30px">Перейти в барахолку</a>
          </div>
        </div>
      </div>
    `;
    return page;
  }

  page.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Вход в систему</h1>
          <p class="auth-subtitle">Барахолка Буняково-Рябцево</p>
        </div>
        
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              autocomplete="username"
              placeholder="Введите имя пользователя"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Пароль</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              autocomplete="current-password"
              placeholder="Введите пароль"
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary btn-block">Войти</button>
            <div class="auth-links">
              <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
              <p><a href="/marketplace">Вернуться в барахолку</a></p>
            </div>
          </div>
        </form>
        
        <div class="auth-message" id="authMessage" style="display:none"></div>
      </div>
    </div>
  `;

  const loginForm = page.querySelector("#loginForm");
  const authMessage = page.querySelector("#authMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    // Показываем сообщение о загрузке
    showMessage("Вход в систему...", "info");

    try {
      const data = await auth.login(username, password);

      showMessage("Успешный вход!", "success");

      // Перенаправляем на барахолку
      setTimeout(() => {
        window.location.href = "/marketplace";
      }, 1000);
    } catch (error) {
      showMessage(error.message || "Ошибка входа", "error");
    }
  });

  function showMessage(text, type) {
    authMessage.textContent = text;
    authMessage.style.display = "block";
    authMessage.className = `auth-message ${type}`;
  }

  return page;
}
