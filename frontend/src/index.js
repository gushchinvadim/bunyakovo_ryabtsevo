import "./css/style.css";
import { createHeader } from "./js/components/Header.js";
import { createFooter } from "./js/components/Footer.js";
import { createMainContent } from "./js/components/MainContent.js";
import { createGalleryPage } from "./js/components/Gallery.js";
import { createHistoryPage } from "./js/components/History.js";
import { createLoginPage } from "./js/components/LoginPage.js";
import { createRegisterPage } from "./js/components/RegisterPage.js";
import { createMarketplacePage } from "./js/components/MarketplacePage.js";
import { createCreateAdPage } from "./js/components/CreateAdPage.js";
import { createMyAdsPage } from "./js/components/MyAdsPage.js";
import { createEditAdPage } from './js/components/EditAdPage.js';
import { createCommunityRulesPage } from './js/components/CommunityRulesPage.js';
import { createChurchPage } from './js/components/ChurchPage.js';

// ======================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ
// ======================

// Создаём контейнер для динамического контента
const mainContentContainer = document.createElement("main");
mainContentContainer.id = "main-content";
mainContentContainer.className = "dynamic-content";

// Вставляем компоненты: хедер → контент → футер
document.body.insertBefore(createHeader(), document.body.firstChild);
document.body.insertBefore(
  mainContentContainer,
  document.body.firstChild.nextElementSibling,
);
document.body.appendChild(createFooter());

// ======================
// РОУТИНГ
// ======================

// Роуты приложения (без динамических путей здесь)
const routes = {
  "/": createMainContent,
  "/about": createGalleryPage,
  "/history": createHistoryPage,
  "/church": createChurchPage, 
  "/marketplace": createMarketplacePage,
  "/login": createLoginPage,
  "/register": createRegisterPage,
  "/marketplace/create": createCreateAdPage,
  "/marketplace/my-ads": createMyAdsPage,
  "/community-rules": createCommunityRulesPage,
  "404": createErrorPage, // ← Исправлено: строка '404', а не число
};

// ======================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================

/**
 * Создаёт заглушку для страницы в разработке
 */
function createPlaceholderPage(title, text) {
  const el = document.createElement("div");
  el.className = "placeholder-page";
  el.innerHTML = `
    <div class="page-header">
      <h1>${title}</h1>
    </div>
    <div class="placeholder-content card">
      <div class="card-content" style="text-align:center;padding:60px 20px">
        <p style="font-size:1.3rem;color:#655130;margin-bottom:20px">${text}</p>
        <p style="color:#888;font-style:italic">Страница находится в разработке</p>
      </div>
    </div>
  `;
  return el;
}

/**
 * Создаёт страницу ошибки 404
 */
function createErrorPage() {
  const el = document.createElement("div");
  el.className = "error-page";
  el.innerHTML = `
    <div class="page-header">
      <h1>404</h1>
    </div>
    <div class="placeholder-content card">
      <div class="card-content" style="text-align:center;padding:60px 20px">
        <p style="font-size:1.5rem;color:#bf2600;margin-bottom:20px">Страница не найдена</p>
        <a href="/" class="btn-primary" style="display:inline-block;padding:10px 25px;margin-top:15px">На главную</a>
      </div>
    </div>
  `;
  return el;
}

/**
 * Навигация по маршруту
 */
async function navigateTo(path) {
  // Нормализуем путь
  const normalizedPath = normalizePath(path);

  // Показываем лоадер
  showLoader();

  try {
    // 🔑 ОБРАБОТКА ДИНАМИЧЕСКОГО МАРШРУТА /marketplace/edit/:id
    if (normalizedPath.startsWith('/marketplace/edit/')) {
      const adId = normalizedPath.split('/').pop();
      
      // Проверяем, что adId — это число
      if (!/^\d+$/.test(adId)) {
        throw new Error('Неверный ID объявления');
      }
      
      // Создаём страницу редактирования (асинхронно)
      const component = await createEditAdPage(adId);
      updateContent(component);
      updateUrl(normalizedPath);
      scrollToTop();
      return;
    }

    // Получаем компонент для маршрута
    const componentCreator = routes[normalizedPath] || routes["404"];
    let component = componentCreator();

    // Обрабатываем асинхронные компоненты
    if (component instanceof Promise) {
      component = await component;
    }

    // Обновляем контент
    updateContent(component);

    // Обновляем URL
    updateUrl(normalizedPath);

    // Прокручиваем вверх
    scrollToTop();
  } catch (error) {
    console.error("Ошибка загрузки страницы:", error);
    showError("Ошибка загрузки страницы: " + error.message);
  }
}

/**
 * Нормализует путь для роутинга
 */
function normalizePath(path) {
  return (
    path
      .replace(/\.html$/, "")
      .replace(/\/index$/, "/")
      .replace(/\/$/, "") || "/"
  );
}

/**
 * Показывает лоадер
 */
function showLoader() {
  mainContentContainer.innerHTML = `
    <div class="page-loader">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
  `;
}

/**
 * Обновляет контент страницы
 */
function updateContent(component) {
  mainContentContainer.innerHTML = "";
  mainContentContainer.appendChild(component);
}

/**
 * Обновляет URL без перезагрузки
 */
function updateUrl(path) {
  window.history.pushState({ path }, "", path);
}

/**
 * Прокручивает страницу вверх
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Показывает сообщение об ошибке
 */
function showError(message) {
  mainContentContainer.innerHTML = `
    <div class="placeholder-content card">
      <div class="card-content" style="text-align:center;padding:40px">
        <p style="color:#bf2600;font-size:1.2rem">${message}</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top:15px">Повторить</button>
      </div>
    </div>
  `;
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

/**
 * Обработчик кликов по ссылкам навигации
 */
// src/js/index.js (обновлённый обработчик кликов)

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");

  // Пропускаем якорные ссылки
  if (href && href.includes("#")) {
    return;
  }

  // Пропускаем внешние ссылки
  if ((href && !href.startsWith("/")) || href.startsWith("//")) {
    return;
  }

  // 🔑 КРИТИЧЕСКИ ВАЖНО: предотвращаем переход по ссылке
  e.preventDefault();
  
  // Переходим через нашу навигацию
  navigateTo(href);
});

/**
 * Поддержка кнопок "назад/вперёд" в браузере
 */
window.addEventListener("popstate", (e) => {
  const path = window.location.pathname;
  navigateTo(path);
});

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  navigateTo(currentPath);
});

// ======================
// СТИЛИ
// ======================

const style = document.createElement("style");
style.textContent = `
  .dynamic-content { 
    min-height: 60vh; 
    padding: 20px; 
    max-width: 1400px; 
    margin: 0 auto; 
    width: 100%; 
  }
  
  .page-loader { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    min-height: 400px; 
  }
  
  .page-loader .spinner { 
    width: 40px; 
    height: 40px; 
    border: 4px solid rgba(101, 81, 48, 0.2); 
    border-top: 4px solid hsl(43, 72%, 50%); 
    border-radius: 50%; 
    animation: spin 1s linear infinite; 
    margin-bottom: 15px; 
  }
  
  @keyframes spin { 
    to { transform: rotate(360deg); } 
  }
  
  .placeholder-page .page-header, 
  .error-page .page-header { 
    text-align: center; 
    margin-bottom: 30px; 
    padding: 25px; 
    background: linear-gradient(170deg, hsl(81, 96%, 33%) 0%, #23350b 100%); 
    border-radius: 12px; 
    color: white; 
  }
  
  .placeholder-page .page-header h1, 
  .error-page .page-header h1 { 
    margin: 0; 
    font-size: 2.5rem; 
    text-shadow: 0 2px 4px rgba(0,0,0,0.3); 
  }
  
  .btn-primary { 
    background: linear-gradient(170deg, hsl(81, 96%, 33%) 0%, #23350b 100%); 
    color: white; 
    border: none; 
    padding: 10px 25px; 
    border-radius: 8px; 
    font-size: 1.1rem; 
    cursor: pointer; 
    text-decoration: none; 
    display: inline-block; 
    transition: all 0.3s ease; 
  }
  
  .btn-primary:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
  }
`;
document.head.appendChild(style);