// src/js/components/Header.js
import logoLeft from "../../images/logo_header_bunnyakovo.png";
import logoRight from "../../images/logo_header_ryabtsevo.png";
import { auth } from "../utils/auth.js";

export function createHeader() {
  const header = document.createElement("header");
  header.className = "site-header";
  
  // Получаем данные пользователя
  const user = auth.getUser();
  const isLoggedIn = auth.isLoggedIn();
  
  // Формируем пункты меню
  const menuItems = [
    { href: "/", text: "Главная" },
    { href: "/about", text: "О нас" },
    { href: "/history", text: "История" },
    { href: "/marketplace", text: "Барахолка" },
    { href: "/church", text: "Покровская церковь" },
  ];
  
  // Добавляем пункт авторизации ВНУТРЬ меню
  if (isLoggedIn) {
    menuItems.push({
      href: "#logout",
      text: `${user.first_name || user.username} [выйти]`,
      className: "menu-user",
      isLogout: true
    });
  } else {
    menuItems.push({
      href: "/login",
      text: "Войти",
      className: "menu-login"
    });
  }

  // Формируем HTML для пунктов меню
  const menuItemsHtml = menuItems.map(item => {
    const classes = item.className ? ` class="${item.className}"` : '';
    return `<li${classes}><a href="${item.href}">${item.text}</a></li>`;
  }).join('');

  header.innerHTML = `
    <div class="header-container">
      <div class="logo-group">
        <img src="${logoLeft}" class="logo logo-left" alt="Логотип Буняково">
        <img src="${logoRight}" class="logo logo-right" alt="Логотип Рябцево">
        <h1 class="site-title">Буняково-Рябцево.РФ</h1>
      </div>
      
      <button class="burger-menu" aria-label="Открыть меню">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </button>
      
      <nav class="main-nav" aria-label="Основное меню">
        <ul>
          ${menuItemsHtml}
        </ul>
      </nav>
    </div>
  `;

  // Добавляем обработчик бургер-меню
  const burgerBtn = header.querySelector(".burger-menu");
  const nav = header.querySelector(".main-nav");

  burgerBtn.addEventListener("click", () => {
    const isExpanded =
      burgerBtn.getAttribute("aria-expanded") === "true" || false;
    burgerBtn.setAttribute("aria-expanded", !isExpanded);
    burgerBtn.classList.toggle("active");
    nav.classList.toggle("active");
  });

  // Закрываем меню при клике на любую ссылку (включая "выйти")
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      // Обработка выхода
      if (link.getAttribute('href') === '#logout') {
        e.preventDefault();
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
          auth.logout();
          window.location.href = '/marketplace';
        }
        return;
      }
      
      // Закрываем меню для всех остальных ссылок
      burgerBtn.setAttribute("aria-expanded", "false");
      burgerBtn.classList.remove("active");
      nav.classList.remove("active");
    });
  });

  return header;
}