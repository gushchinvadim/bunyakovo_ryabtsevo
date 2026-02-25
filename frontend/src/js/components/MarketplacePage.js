// src/js/components/MarketplacePage.js
import { auth } from "../utils/auth.js";
import { CONFIG } from "../../config.js";

export async function createMarketplacePage() {
  const page = document.createElement("div");
  page.className = "marketplace-page";

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Барахолка</h1>
      <p class="page-subtitle">Объявления о покупке и продаже в Буняково и Рябцево</p>
    </div>
    
    <div class="marketplace-actions">
      ${
        auth.isLoggedIn()
          ? `
        <a href="/marketplace/create" class="btn-primary">
          <span>➕</span> Разместить объявление
        </a>
        <a href="/marketplace/my-ads" class="btn-secondary">
          <span>📝</span> Мои объявления
        </a>
      `
          : `
        <a href="/login" class="btn-primary">
          <span>👤</span> Войти для размещения
        </a>
      `
      }
    </div>
    
    <div class="marketplace-filters">
      <div class="filter-group">
        <label>Тип объявления:</label>
        <select id="filterType" class="filter-select">
          <option value="">Все</option>
          <option value="sale">Продам</option>
          <option value="buy">Куплю</option>
          <option value="rent">Сдам в аренду</option>
          <option value="free">Отдам в хорошие руки</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Населённый пункт:</label>
        <select id="filterVillage" class="filter-select">
          <option value="">Все</option>
          <option value="bunyakovo">Буняково</option>
          <option value="ryabtsevo">Рябцево</option>
          <option value="other">Другое место</option>
        </select>
      </div>
      
      <button id="filterBtn" class="btn-filter">Применить фильтры</button>
      <button id="resetBtn" class="btn-reset">Сбросить</button>
    </div>
    
    <div class="marketplace-loading">
      <div class="spinner"></div>
      <p>Загрузка объявлений...</p>
    </div>
    
    <div class="marketplace-grid" style="display:none"></div>
    
    <div class="marketplace-error" style="display:none">
      <p>Не удалось загрузить объявления. Попробуйте обновить страницу.</p>
    </div>
  `;

  const marketplaceGrid = page.querySelector(".marketplace-grid");
  const loadingEl = page.querySelector(".marketplace-loading");
  const errorEl = page.querySelector(".marketplace-error");
  const filterType = page.querySelector("#filterType");
  const filterVillage = page.querySelector("#filterVillage");
  const filterBtn = page.querySelector("#filterBtn");
  const resetBtn = page.querySelector("#resetBtn");

  // Загружаем объявления
  await loadAdvertisements();

  // Обработчики фильтров
  filterBtn.addEventListener("click", loadAdvertisements);
  resetBtn.addEventListener("click", () => {
    filterType.value = "";
    filterVillage.value = "";
    loadAdvertisements();
  });

  async function loadAdvertisements() {
    loadingEl.style.display = "block";
    marketplaceGrid.style.display = "none";
    errorEl.style.display = "none";

    try {
      let url = `${CONFIG.API_URL}/marketplace/ads/`;

      // Добавляем фильтры к URL
      const params = new URLSearchParams();
      if (filterType.value) params.append("ad_type", filterType.value);
      if (filterVillage.value) params.append("village", filterVillage.value);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Ошибка загрузки объявлений");
      }

      const data = await response.json();
      const ads = data.results || data;

      renderAdvertisements(ads);
    } catch (error) {
      console.error("Ошибка загрузки объявлений:", error);
      loadingEl.style.display = "none";
      errorEl.style.display = "block";
    }
  }

  function renderAdvertisements(ads) {
    loadingEl.style.display = "none";
    marketplaceGrid.style.display = "grid";

    if (ads.length === 0) {
      marketplaceGrid.innerHTML = `
        <div class="marketplace-empty">
          <p>Объявлений не найдено</p>
          ${
            auth.isLoggedIn()
              ? `
            <a href="/marketplace/create" class="btn-primary">Разместить первое объявление</a>
          `
              : `
            <a href="/login" class="btn-primary">Войдите, чтобы разместить объявление</a>
          `
          }
        </div>
      `;
      return;
    }

    marketplaceGrid.innerHTML = ads.map((ad) => createAdCard(ad)).join("");
  }

  function createAdCard(ad) {
    const adTypeBadges = {
      sale: "Продам",
      buy: "Куплю",
      rent: "Сдам",
      free: "Отдам",
      handmade: "Услуги мастера",
    };

    const villageNames = {
      bunyakovo: "Буняково",
      ryabtsevo: "Рябцево",
      other: "Другое место",
    };

    return `
      <div class="marketplace-card" data-id="${ad.id}">
        ${
          ad.main_image_url
            ? `
          <div class="ad-image">
            <img src="${ad.main_image_url}" alt="${ad.title}" loading="lazy">
          </div>
        `
            : `
          <div class="ad-image-placeholder">
            <span>📷</span>
          </div>
        `
        }
        
        <div class="ad-badge ad-badge-${ad.ad_type}">${adTypeBadges[ad.ad_type]}</div>
        
        <div class="ad-content">
          <h3 class="ad-title">${ad.title}</h3>
          
          <div class="ad-description">
            ${ad.description.length > 100 ? ad.description.substring(0, 100) + "..." : ad.description}
          </div>
          
          ${
            ad.price !== null
              ? `
            <div class="ad-price">
              ${ad.ad_type === "free" ? "Бесплатно" : `${ad.price} ₽`}
            </div>
          `
              : ""
          }
          
          <div class="ad-meta">
            <span class="ad-village">${villageNames[ad.village]}</span>
            <span class="ad-date">${new Date(ad.created_at).toLocaleDateString("ru-RU")}</span>
            <span class="ad-views">👁️ ${ad.views}</span>
          </div>
          
          <div class="ad-author">
            <span class="author-name">
              ${ad.author?.first_name || ad.author?.username || "Аноним"}
            </span>
          </div>
          
          <div class="ad-actions">
            <button class="btn-view" data-id="${ad.id}">Подробнее</button>
          </div>
        </div>
      </div>
    `;
  }

  // Обработчик клика "Подробнее"
  marketplaceGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-view")) {
      const adId = e.target.dataset.id;
      showAdDetails(adId);
    }
  });

  async function showAdDetails(adId) {
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/marketplace/ads/${adId}/`,
      );

      if (!response.ok) {
        throw new Error("Объявление не найдено");
      }

      const ad = await response.json();
      showAdModal(ad);
    } catch (error) {
      alert(error.message);
    }
  }

  function showAdModal(ad) {
    const modal = document.createElement("div");
    modal.className = "ad-modal";
    modal.innerHTML = `
      <div class="modal-overlay" data-close>
        <div class="modal-content ad-modal-content">
          <button class="modal-close" data-close>&times;</button>
          
          <h2>${ad.title}</h2>
          
          <div class="ad-modal-images">
            ${
              ad.images && ad.images.length > 0
                ? `
              ${ad.images
                .map(
                  (img) => `
                <img src="${img.image_url}" alt="${ad.title}" loading="lazy">
              `,
                )
                .join("")}
            `
                : `
              <div class="ad-image-placeholder large">
                <span>📷</span>
              </div>
            `
            }
          </div>
          
          <div class="ad-modal-info">
            <p class="ad-modal-description">${ad.description}</p>
            
            ${
              ad.price !== null
                ? `
              <div class="ad-modal-price">
                <strong>Цена:</strong> ${ad.ad_type === "free" ? "Бесплатно" : `${ad.price} ₽`}
              </div>
            `
                : ""
            }
            
            <div class="ad-modal-contacts">
              <h4>Контакты:</h4>
              ${ad.phone ? `<p>📞 ${ad.phone}</p>` : ""}
              ${ad.email ? `<p>✉️ ${ad.email}</p>` : ""}
              ${ad.address ? `<p>📍 ${ad.address}</p>` : ""}
            </div>
            
            <div class="ad-modal-meta">
              <p><strong>Автор:</strong> ${ad.author?.first_name || ad.author?.username}</p>
              <p><strong>Населённый пункт:</strong> ${ad.village === "bunyakovo" ? "Буняково" : ad.village === "ryabtsevo" ? "Рябцево" : "Другое место"}</p>
              <p><strong>Дата:</strong> ${new Date(ad.created_at).toLocaleDateString("ru-RU")}</p>
              <p><strong>Просмотров:</strong> ${ad.views}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Обработчик закрытия
    modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", () => {
        modal.remove();
      });
    });

    // Закрытие по Escape
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }

  return page;
}
