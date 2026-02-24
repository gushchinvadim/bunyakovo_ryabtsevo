export async function createGalleryPage() {
  const page = document.createElement("div");
  page.className = "gallery-page";

  // Вспомогательная функция для названия деревни
  function getVillageName(code) {
    const villages = {
      bunyakovo: "Буняково",
      ryabtsevo: "Рябцево",
      all: "Общее",
    };
    return villages[code] || code;
  }

// Функция рендеринга галереи с кнопками "Посмотреть/Смотреть"
function renderGallery(items, filter) {
  const galleryGrid = page.querySelector(".gallery-grid");
  galleryGrid.innerHTML = "";

  // Фильтрация
  let filteredItems = items;

  if (filter === "photo") {
    filteredItems = items.filter((item) => item.media_type === "photo");
  } else if (filter === "video") {
    filteredItems = items.filter((item) => item.media_type === "video");
  } else if (filter === "bunyakovo") {
    filteredItems = items.filter((item) => item.village === "bunyakovo");
  } else if (filter === "ryabtsevo") {
    filteredItems = items.filter((item) => item.village === "ryabtsevo");
  }

  if (filteredItems.length === 0) {
    galleryGrid.innerHTML = `
      <div class="gallery-empty">
        <p>Медиа по выбранному фильтру не найдено</p>
        <button class="btn-reset" onclick="location.reload()">Обновить</button>
      </div>
    `;
    return;
  }

  // Рендерим элементы
  filteredItems.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = `gallery-item gallery-item--${item.media_type}`;

    // Форматируем дату
    const date = item.uploaded_at
      ? new Date(item.uploaded_at).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'Дата не указана';

    if (item.media_type === "photo") {
      itemEl.innerHTML = `
        <div class="gallery-item-inner">
          <img 
            src="${item.file_url}" 
            alt="${item.title}" 
            loading="lazy"
            class="gallery-img"
            onclick="openGalleryModal('${item.file_url.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}')"
          >
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <h4>${item.title || 'Фотография'}</h4>
              <p class="gallery-item-date">${date}</p>
              <span class="gallery-village">${getVillageName(item.village)}</span>
            </div>
            <button class="gallery-item-btn" onclick="openGalleryModal('${item.file_url.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}'); event.stopPropagation();">
              👁️ Посмотреть
            </button>
          </div>
        </div>
      `;
    } else if (item.media_type === "video") {
      itemEl.innerHTML = `
        <div class="gallery-item-inner">
          <div class="video-container">
            ${item.thumbnail_url ? `
              <img src="${item.thumbnail_url}" alt="${item.title}" class="video-thumbnail">
            ` : `<div class="video-placeholder">Видео</div>`}
            <button class="play-button" onclick="openVideoModal('${item.file_url.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}'); event.stopPropagation();">
              ▶️
            </button>
          </div>
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <h4>${item.title || 'Видео'}</h4>
              <p class="gallery-item-date">${date}</p>
              <span class="gallery-village">${getVillageName(item.village)}</span>
            </div>
            <button class="gallery-item-btn" onclick="openVideoModal('${item.file_url.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}'); event.stopPropagation();">
              🎥 Смотреть
            </button>
          </div>
        </div>
        ${item.description ? `
          <div class="gallery-item-description">
            <p>${item.description}</p>
          </div>
        ` : ''}
      `;
    }

    galleryGrid.appendChild(itemEl);
  });
}

  // Заголовок страницы
  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">О наших трудовых подвигах</h1>
      <p class="page-subtitle">Фотографии и видео из жизни Буняково и Рябцево</p>
    </div>
    
    <div class="gallery-tabs">
      <button class="tab-btn active" data-tab="all">Все</button>
      <button class="tab-btn" data-tab="photo">Фотографии</button>
      <button class="tab-btn" data-tab="video">Видео</button>
      <button class="tab-btn" data-tab="bunyakovo">Буняково</button>
      <button class="tab-btn" data-tab="ryabtsevo">Рябцево</button>
    </div>
    
    <div class="gallery-loading">
      <div class="spinner"></div>
      <p>Загрузка медиа...</p>
    </div>
    
    <div class="gallery-grid" style="display:none"></div>
    
    <div class="gallery-error" style="display:none">
      <p>Не удалось загрузить медиа. Попробуйте обновить страницу.</p>
    </div>
  `;

  const galleryGrid = page.querySelector(".gallery-grid");
  const loadingEl = page.querySelector(".gallery-loading");
  const errorEl = page.querySelector(".gallery-error");
  const tabButtons = page.querySelectorAll(".tab-btn");

  // Загружаем медиа с бэкенда
  try {
    const response = await fetch("http://localhost:8000/api/community/media/");

    if (!response.ok) {
      throw new Error("Ошибка загрузки данных");
    }

    // Извлекаем массив из поля "results" (пагинация DRF)
    const data = await response.json();
    const mediaItems = data.results;

    // Показываем галерею
    loadingEl.style.display = "none";
    galleryGrid.style.display = "grid";

    // Рендерим все медиа
    renderGallery(mediaItems, "all");

    // Обработчики табов
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderGallery(mediaItems, btn.dataset.tab);
      });
    });
  } catch (err) {
    console.error("Ошибка загрузки галереи:", err);
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
  }

  return page;
}

// Создание карточки медиа для галереи "О нас"
function createMediaCard(media) {
  const date = media.uploaded_at
    ? new Date(media.uploaded_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Дата не указана';
  
  if (media.media_type === 'photo') {
    return `
      <div class="gallery-item photo-item">
        <div class="gallery-item-inner">
          <img src="${media.file_url}" alt="${media.title}" 
               onclick="openGalleryModal('${media.file_url}', '${media.title}', '${media.description || ''}')"
               onerror="this.parentElement.style.display='none'">
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <h4>${media.title || 'Фотография'}</h4>
              <p class="gallery-item-date">${date}</p>
            </div>
            <button class="gallery-item-btn" onclick="openGalleryModal('${media.file_url}', '${media.title}', '${media.description || ''}'); event.stopPropagation();">
              👁️ Посмотреть
            </button>
          </div>
        </div>
        ${media.description ? `
          <div class="gallery-item-description">
            <p>${media.description}</p>
          </div>
        ` : ''}
      </div>
    `;
  } else if (media.media_type === 'video') {
    return `
      <div class="gallery-item video-item">
        <div class="gallery-item-inner">
          <div class="video-container">
            ${media.thumbnail_url ? `
              <img src="${media.thumbnail_url}" alt="${media.title}" class="video-thumbnail">
            ` : ''}
            <button class="play-button" onclick="openVideoModal('${media.file_url}', '${media.title}', '${media.description || ''}'); event.stopPropagation();">
              ▶️
            </button>
          </div>
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <h4>${media.title || 'Видео'}</h4>
              <p class="gallery-item-date">${date}</p>
            </div>
            <button class="gallery-item-btn" onclick="openVideoModal('${media.file_url}', '${media.title}', '${media.description || ''}'); event.stopPropagation();">
              🎥 Смотреть
            </button>
          </div>
        </div>
        ${media.description ? `
          <div class="gallery-item-description">
            <p>${media.description}</p>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  return '';
}

// Функции для модальных окон (добавим в глобальную область)
window.openGalleryModal = function(imageUrl, title, description) {
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <button class="gallery-modal-close">&times;</button>
      <h2>${title}</h2>
      <img src="${imageUrl}" alt="${title}">
      ${description ? `<p class="modal-description">${description}</p>` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Закрытие модалки
  modal.querySelector('.gallery-modal-close').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

window.openVideoModal = function(videoUrl, title, description) {
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-modal-content video-modal">
      <button class="gallery-modal-close">&times;</button>
      <h2>${title}</h2>
      <video controls autoplay style="max-width:100%; border-radius:8px;">
        <source src="${videoUrl}" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
      ${description ? `<p class="modal-description">${description}</p>` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Закрытие модалки
  modal.querySelector('.gallery-modal-close').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};