// src/js/components/MyAdsPage.js
import { auth } from "../utils/auth.js";
import { CONFIG } from "../../config.js";

export async function createMyAdsPage() {
  const page = document.createElement("div");
  page.className = "my-ads-page";

  // Проверка авторизации
  if (!auth.isLoggedIn()) {
    page.innerHTML = `
      <div class="auth-required">
        <div class="card">
          <div class="card-content" style="text-align:center;padding:60px 20px">
            <p style="font-size:1.5rem;color:#bf2600;margin-bottom:20px">Требуется авторизация</p>
            <p style="margin-bottom:30px">Пожалуйста, войдите в систему, чтобы просмотреть свои объявления</p>
            <a href="/login" class="btn-primary" style="display:inline-block;padding:12px 30px">Войти</a>
          </div>
        </div>
      </div>
    `;
    return page;
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Мои объявления</h1>
      <p class="page-subtitle">Управляйте своими объявлениями</p>
    </div>
    
    <div class="my-ads-actions">
      <a href="/marketplace/create" class="btn-primary">
        <span>➕</span> Разместить новое объявление
      </a>
      <a href="/marketplace" class="btn-secondary">
        <span>🏠</span> Вернуться в барахолку
      </a>
    </div>
    
    <div class="my-ads-loading">
      <div class="spinner"></div>
      <p>Загрузка объявлений...</p>
    </div>
    
    <div class="my-ads-grid" style="display:none"></div>
    
    <div class="my-ads-error" style="display:none">
      <p>Не удалось загрузить объявления. Попробуйте обновить страницу.</p>
    </div>
  `;

  const myAdsGrid = page.querySelector(".my-ads-grid");
  const loadingEl = page.querySelector(".my-ads-loading");
  const errorEl = page.querySelector(".my-ads-error");

  // Загружаем объявления
  await loadMyAds();

  async function loadMyAds() {
    loadingEl.style.display = "block";
    myAdsGrid.style.display = "none";
    errorEl.style.display = "none";

    try {
      const response = await fetch(
        `${CONFIG.API_URL}/marketplace/ads/my_ads/`,
        {
          headers: auth.getAuthHeader(),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка загрузки объявлений");
      }

      const ads = await response.json();
      renderMyAds(ads);
    } catch (error) {
      console.error("Ошибка загрузки объявлений:", error);
      errorEl.querySelector("p").textContent =
        error.message || "Не удалось загрузить объявления";
      loadingEl.style.display = "none";
      errorEl.style.display = "block";
    }
  }

  function renderMyAds(ads) {
    loadingEl.style.display = "none";
    myAdsGrid.style.display = "grid";

    if (ads.length === 0) {
      myAdsGrid.innerHTML = `
        <div class="my-ads-empty">
          <p>У вас пока нет объявлений</p>
          <a href="/marketplace/create" class="btn-primary">Разместить первое объявление</a>
        </div>
      `;
      return;
    }

    myAdsGrid.innerHTML = ads.map((ad) => createMyAdCard(ad)).join("");

    // Добавляем обработчики кнопок
    myAdsGrid.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const adId = btn.dataset.id;
        window.location.href = `/marketplace/edit/${adId}`;
      });
    });

    myAdsGrid.querySelectorAll(".btn-deactivate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const adId = btn.dataset.id;

        if (
          !confirm(
            "Вы уверены, что хотите скрыть это объявление? Оно перестанет отображаться в барахолке.",
          )
        ) {
          return;
        }

        try {
          const response = await fetch(
            `${CONFIG.API_URL}/marketplace/ads/${adId}/deactivate/`,
            {
              method: "POST",
              headers: auth.getAuthHeader(),
            },
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Ошибка деактивации");
          }

          alert("Объявление скрыто");
          loadMyAds(); // Перезагружаем список
        } catch (error) {
          alert(error.message || "Не удалось скрыть объявление");
        }
      });
    });

    myAdsGrid.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const adId = btn.dataset.id;
        const adTitle = btn.dataset.title;

        if (
          !confirm(
            `Вы уверены, что хотите удалить объявление "${adTitle}"? Это действие нельзя отменить.`,
          )
        ) {
          return;
        }

        try {
          const response = await fetch(
            `${CONFIG.API_URL}/marketplace/ads/${adId}/`,
            {
              method: "DELETE",
              headers: auth.getAuthHeader(),
            },
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Ошибка удаления");
          }

          alert("Объявление удалено");
          loadMyAds(); // Перезагружаем список
        } catch (error) {
          alert(error.message || "Не удалось удалить объявление");
        }
      });
    });
  }

  function createMyAdCard(ad) {
    const adTypeBadges = {
      sale: "Продам",
      buy: "Куплю",
      rent: "Сдам",
      free: "Отдам",
    };

    const moderationStatus = {
      pending: "На модерации",
      approved: "Одобрено",
      rejected: "Отклонено",
    };

    const statusColors = {
      pending: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545",
    };

    // Определяем, нужно ли показывать кнопку редактирования
    const showEditButton =
      ad.moderation_status === "rejected" ||
      ad.moderation_status === "pending" ||
      ad.is_active;

    return `
      <div class="my-ad-card" data-id="${ad.id}">
        ${
          ad.main_image_url
            ? `
          <div class="ad-image">
            <img src="${ad.main_image_url.startsWith("http") ? ad.main_image_url : "http://localhost:8000" + ad.main_image_url}" alt="${ad.title}" loading="lazy">
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
            <span class="ad-date">${new Date(ad.created_at).toLocaleDateString("ru-RU")}</span>
            <span class="ad-views">👁️ ${ad.views}</span>
          </div>
          
          <div class="ad-moderation-status" style="color: ${statusColors[ad.moderation_status]}; margin: 10px 0; padding: 8px; background: rgba(${statusColors[ad.moderation_status] === "#28a745" ? "40,167,69" : statusColors[ad.moderation_status] === "#ffc107" ? "255,193,7" : "220,53,69"}, 0.1); border-radius: 6px; font-size: 0.95rem;" data-status="${ad.moderation_status}">
            <strong>Статус:</strong> ${moderationStatus[ad.moderation_status]}
            ${ad.moderation_comment ? `<br><small style="color: ${statusColors[ad.moderation_status]};">💬 ${ad.moderation_comment}</small>` : ""}
          </div>
          
          <div class="ad-actions">
            ${
              showEditButton
                ? `
              <button class="btn-edit" data-id="${ad.id}" title="Редактировать объявление">
                <span>✏️</span> Редактировать
              </button>
            `
                : ""
            }
            
            ${
              ad.is_active
                ? `
              <button class="btn-deactivate" data-id="${ad.id}" title="Скрыть объявление">
                <span>🙈</span> Скрыть
              </button>
            `
                : `
              <button class="btn-disabled" disabled>
                <span>🙈</span> Скрыто
              </button>
            `
            }
            
            <button class="btn-delete" data-id="${ad.id}" data-title="${ad.title}" title="Удалить объявление навсегда">
              <span>🗑️</span> Удалить
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return page;
}
