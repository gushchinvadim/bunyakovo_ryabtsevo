// src/js/components/RegisterPage.js
import { auth } from "../utils/auth.js";

export function createRegisterPage() {
  const page = document.createElement("div");
  page.className = "register-page";

  // Если пользователь уже залогинен, перенаправляем
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
          <h1 class="auth-title">Регистрация</h1>
          <p class="auth-subtitle">Барахолка Буняково-Рябцево</p>
        </div>
        
        <form id="registerForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="username">Имя пользователя(Латиница) *</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                autocomplete="username"
                placeholder="NickName"
              >
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                autocomplete="email"
                placeholder="example@email.com"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">Имя</label>
              <input 
                type="text" 
                id="first_name" 
                name="first_name" 
                autocomplete="given-name"
                placeholder="Ваше имя"
              >
            </div>
            
            <div class="form-group">
              <label for="last_name">Фамилия</label>
              <input 
                type="text" 
                id="last_name" 
                name="last_name" 
                autocomplete="family-name"
                placeholder="Ваша фамилия"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="phone">Телефон</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="+7 (999) 123-45-67"
              >
            </div>
            
            <div class="form-group">
              <label for="village">Населённый пункт *</label>
              <select id="village" name="village" required>
                <option value="">Выберите...</option>
                <option value="bunyakovo">Буняково</option>
                <option value="ryabtsevo">Рябцево</option>
                
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password">Пароль *</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                autocomplete="new-password"
                placeholder="Минимум 8 символов"
              >
            </div>
            
            <div class="form-group">
              <label for="password2">Подтвердите пароль *</label>
              <input 
                type="password" 
                id="password2" 
                name="password2" 
                required 
                autocomplete="new-password"
                placeholder="Повторите пароль"
              >
            </div>
          </div>
          

          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="terms" required>
              <label for="terms">
                Я согласен с 
                <a href="/community-rules" target="_blank" class="rules-link">
                  правилами сообщества
                </a>
                и даю согласие на обработку персональных данных
              </label>
            </div>
            <small class="terms-hint">
              ⚠️ При нарушении правил аккаунт будет удалён без возможности восстановления
            </small>
          </div>

          
          <div class="form-actions">
            <button type="submit" class="btn-primary btn-block">Зарегистрироваться</button>
            <div class="auth-links">
              <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
              <p><a href="/marketplace">Вернуться в барахолку</a></p>
            </div>
          </div>
        </form>
        
        <div class="auth-message" id="authMessage" style="display:none"></div>
      </div>
    </div>
  `;

  const registerForm = page.querySelector("#registerForm");
  const authMessage = page.querySelector("#authMessage");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Валидация паролей
    if (registerForm.password.value !== registerForm.password2.value) {
      showMessage("Пароли не совпадают!", "error");
      return;
    }

    const userData = {
      username: registerForm.username.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value,
      password2: registerForm.password2.value,
      first_name: registerForm.first_name.value.trim(),
      last_name: registerForm.last_name.value.trim(),
      phone: registerForm.phone.value.trim(),
      village: registerForm.village.value,
    };

    // Проверка обязательных полей
    if (
      !userData.username ||
      !userData.email ||
      !userData.password ||
      !userData.village
    ) {
      showMessage("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    showMessage("Регистрация...", "info");

    try {
      const data = await auth.register(userData);

      showMessage(
        data.message ||
          "Регистрация успешна! Ожидайте верификации администратором.",
        "success",
      );

      // Через 3 секунды перенаправляем на логин
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      showMessage(error.message || "Ошибка регистрации", "error");
    }
  });

  function showMessage(text, type) {
    authMessage.textContent = text;
    authMessage.style.display = "block";
    authMessage.className = `auth-message ${type}`;
  }

  return page;
}
