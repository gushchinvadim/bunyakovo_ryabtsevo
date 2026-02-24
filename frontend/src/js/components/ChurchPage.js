// src/js/components/ChurchPage.js

export function createChurchPage() {
  const page = document.createElement('div');
  page.className = 'church-page';
  
  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Покровская церковь</h1>
      <p class="page-subtitle">Храм Покрова Пресвятой Богородицы</p>
    </div>
    
    <!-- Блок 1: Хедер с информацией о батюшке -->
    <section class="church-section church-header-section">
      <div class="church-header-content">
        <div class="church-priest-info">
          <div class="priest-loader">
            <div class="spinner"></div>
            <p>Загрузка информации...</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Блок 2: Расписание и объявления -->
    <section class="church-section church-schedule-section">
      <div class="church-section-header">
        <h2 class="section-title">📖 Расписание богослужений</h2>
      </div>
      <div class="church-schedule-content">
        <div class="schedule-loader">
          <div class="spinner"></div>
          <p>Загрузка расписания...</p>
        </div>
      </div>
    </section>
    
    <section class="church-section church-announcements-section">
      <div class="church-section-header">
        <h2 class="section-title">📢 Объявления от батюшки</h2>
      </div>
      <div class="church-announcements-content">
        <div class="announcements-loader">
          <div class="spinner"></div>
          <p>Загрузка объявлений...</p>
        </div>
      </div>
    </section>
    
    <!-- Блок 3: Галерея фото и видео -->
    <section class="church-section church-gallery-section">
      <div class="church-section-header">
        <h2 class="section-title">📸 Галерея событий</h2>
        <div class="gallery-filters">
          <button class="gallery-filter-btn active" data-type="all">Все</button>
          <button class="gallery-filter-btn" data-type="photo">📷 Фото</button>
          <button class="gallery-filter-btn" data-type="video">🎥 Видео</button>
        </div>
      </div>
      <div class="church-gallery-content">
        <div class="gallery-loader">
          <div class="spinner"></div>
          <p>Загрузка галереи...</p>
        </div>
      </div>
    </section>
  `;
  
  // Загружаем данные после возврата компонента
  Promise.resolve().then(() => {
    loadPriestInfo(page.querySelector('.church-priest-info'));
    loadSchedule(page.querySelector('.church-schedule-content'));
    loadAnnouncements(page.querySelector('.church-announcements-content'));
    loadGallery(page.querySelector('.church-gallery-content'));
    
    // Добавляем обработчик фильтров галереи
    setupGalleryFilters(page);
  });
  
  return page;
}

// Загрузка информации о батюшке
async function loadPriestInfo(container) {
  try {
    const response = await fetch('http://localhost:8000/api/church/priests/');
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки информации о батюшке');
    }
    
    const data = await response.json();
    const priests = data.results || data; // Обрабатываем пагинацию
    
    if (priests.length === 0) {
      container.innerHTML = `
        <div class="church-priest-card">
          <div class="priest-card-content">
            <h3 class="priest-name">Информация временно недоступна</h3>
            <p class="priest-title">Пожалуйста, обратитесь в храм напрямую</p>
          </div>
        </div>
      `;
    } else {
      // Показываем первого активного священника
      const priest = priests[0];
      container.innerHTML = createPriestCard(priest);
    }
    
  } catch (error) {
    console.error('Ошибка загрузки информации о батюшке:', error);
    container.innerHTML = `
      <div class="church-priest-card error">
        <div class="priest-card-content">
          <p>⚠️ Не удалось загрузить информацию о батюшке</p>
        </div>
      </div>
    `;
  }
}

// Загрузка расписания богослужений
async function loadSchedule(container) {
  try {
    const response = await fetch('http://localhost:8000/api/church/schedule/');
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки расписания');
    }
    
    const data = await response.json();
    const schedule = data.results || data; // Обрабатываем пагинацию
    
    if (schedule.length === 0) {
      container.innerHTML = `
        <div class="schedule-placeholder">
          <p>Расписание богослужений временно недоступно</p>
          <p class="schedule-subtitle">Пожалуйста, уточните информацию в храме</p>
        </div>
      `;
    } else {
      container.innerHTML = createScheduleHTML(schedule);
    }
    
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error);
    container.innerHTML = `
      <div class="schedule-placeholder error">
        <p>⚠️ Не удалось загрузить расписание богослужений</p>
      </div>
    `;
  }
}

// Загрузка объявлений от батюшки
async function loadAnnouncements(container) {
  try {
    const response = await fetch('http://localhost:8000/api/church/announcements/');
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки объявлений');
    }
    
    const data = await response.json();
    const announcements = data.results || data; // Обрабатываем пагинацию
    
    if (announcements.length === 0) {
      container.innerHTML = `
        <div class="announcements-placeholder">
          <p>Нет актуальных объявлений</p>
          <p class="announcements-subtitle">Следите за обновлениями!</p>
        </div>
      `;
    } else {
      container.innerHTML = announcements.map(announcement => 
        createAnnouncementCard(announcement)
      ).join('');
    }
    
  } catch (error) {
    console.error('Ошибка загрузки объявлений:', error);
    container.innerHTML = `
      <div class="announcements-placeholder error">
        <p>⚠️ Не удалось загрузить объявления</p>
      </div>
    `;
  }
}

// Загрузка галереи
async function loadGallery(container, mediaType = 'all') {
  try {
    let url = 'http://localhost:8000/api/church/media/';
    
    if (mediaType === 'photo') {
      url = 'http://localhost:8000/api/church/media/photos/';
    } else if (mediaType === 'video') {
      url = 'http://localhost:8000/api/church/media/videos/';
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки галереи');
    }
    
    const data = await response.json();
    const media = data.results || data; // Обрабатываем пагинацию
    
    if (media.length === 0) {
      container.innerHTML = `
        <div class="gallery-placeholder">
          <p>Галерея событий пока пуста</p>
          <p class="gallery-subtitle">Следите за обновлениями!</p>
        </div>
      `;
    } else {
      container.innerHTML = media.map(item => 
        createMediaCard(item)
      ).join('');
    }
    
  } catch (error) {
    console.error('Ошибка загрузки галереи:', error);
    container.innerHTML = `
      <div class="gallery-placeholder error">
        <p>⚠️ Не удалось загрузить галерею</p>
      </div>
    `;
  }
}

// Настройка фильтров галереи
function setupGalleryFilters(page) {
  const filterButtons = page.querySelectorAll('.gallery-filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Убираем активный класс у всех кнопок
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Добавляем активный класс к нажатой кнопке
      button.classList.add('active');
      
      const mediaType = button.dataset.type;
      const galleryContainer = page.querySelector('.church-gallery-content');
      
      // Показываем лоадер
      galleryContainer.innerHTML = `
        <div class="gallery-loader">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>
      `;
      
      // Загружаем галерею с фильтром
      loadGallery(galleryContainer, mediaType);
    });
  });
}

// Создание карточки священника
function createPriestCard(priest) {
  if (!priest) {
    return `
      <div class="church-priest-card error">
        <div class="priest-card-content">
          <p>⚠️ Информация о батюшке недоступна</p>
        </div>
      </div>
    `;
  }
  
  const phone = priest.phone || 'Телефон не указан';
  const phoneHref = priest.phone ? `tel:${priest.phone.replace(/\D/g, '')}` : '#';
  
  return `
    <div class="church-priest-card">
      ${priest.photo_url ? `
        <div class="priest-photo">
          <img src="${priest.photo_url}" alt="Фотография ${priest.name}" 
               onerror="this.style.display='none'">
        </div>
      ` : ''}
      <div class="priest-card-content">
        <h3 class="priest-name">${priest.name || 'Батюшка'}</h3>
        <div class="priest-title">${priest.title || 'Настоятель храма'}</div>
        <div class="priest-contact">
          <span class="contact-icon">📱</span>
          <a href="${phoneHref}" class="priest-phone">${phone}</a>
        </div>
        ${priest.email ? `
          <div class="priest-contact">
            <span class="contact-icon">✉️</span>
            <a href="mailto:${priest.email}" class="priest-email">${priest.email}</a>
          </div>
        ` : ''}
        ${priest.biography ? `
          <div class="priest-bio">
            <p>${priest.biography}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Создание расписания
function createScheduleHTML(schedule) {
  if (!Array.isArray(schedule)) {
    console.error('Schedule is not an array:', schedule);
    return `
      <div class="schedule-placeholder error">
        <p>⚠️ Ошибка формата расписания</p>
      </div>
    `;
  }
  
  // Сначала сортируем по дате, затем по дню недели
  const sortedSchedule = [...schedule].sort((a, b) => {
    // Если есть дата - сортируем по дате
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    // Если только у одного есть дата - тот с датой идёт первым
    if (a.date) return -1;
    if (b.date) return 1;
    // Если нет дат - сортируем по дню недели
    const dayOrder = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 7,
      'holiday': 8
    };
    return (dayOrder[a.day_of_week] || 9) - (dayOrder[b.day_of_week] || 9);
  });
  
  // Группируем по дням недели ИЛИ по датам
  const days = {
    'monday': 'Понедельник',
    'tuesday': 'Вторник',
    'wednesday': 'Среда',
    'thursday': 'Четверг',
    'friday': 'Пятница',
    'saturday': 'Суббота',
    'sunday': 'Воскресенье',
    'holiday': 'Праздничный день'
  };
  
  // Создаём группы: сначала по датам, потом по дням недели
  const groups = {};
  
  sortedSchedule.forEach(service => {
    const key = service.date || service.day_of_week;
    if (!groups[key]) {
      groups[key] = {
        type: service.date ? 'date' : 'day',
        day_of_week: service.day_of_week,
        date: service.date,
        date_display: service.date_display,
        services: []
      };
    }
    groups[key].services.push(service);
  });
  
  let html = '<div class="schedule-grid">';
  
  // Отображаем группы в правильном порядке
  Object.entries(groups).forEach(([key, group]) => {
    if (group.type === 'date') {
      // Для служб с конкретной датой
      const date = new Date(group.date);
      const dateDisplay = date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: group.date_display.includes(new Date().getFullYear().toString()) ? undefined : 'numeric'
      });
      
      html += `
        <div class="schedule-day">
          <div class="day-header with-date">
            <h4>${dateDisplay}</h4>
          </div>
          <div class="day-services">
      `;
      
      group.services.forEach(service => {
        html += `
          <div class="service-item">
            <div class="service-time">${service.time_display || service.time}</div>
            <div class="service-name">${service.service_name || 'Богослужение'}</div>
            ${service.description ? `
              <div class="service-description">${service.description}</div>
            ` : ''}
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    } else {
      // Для регулярных служб по дням недели
      const dayName = days[group.day_of_week] || group.day_of_week;
      
      html += `
        <div class="schedule-day">
          <div class="day-header ${group.day_of_week}">
            <h4>${dayName}</h4>
          </div>
          <div class="day-services">
      `;
      
      group.services.forEach(service => {
        html += `
          <div class="service-item">
            <div class="service-time">${service.time_display || service.time}</div>
            <div class="service-name">${service.service_name || 'Богослужение'}</div>
            ${service.description ? `
              <div class="service-description">${service.description}</div>
            ` : ''}
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
  });
  
  html += '</div>';
  return html;
}

// Создание карточки объявления
function createAnnouncementCard(announcement) {
  if (!announcement) return '';
  
  const date = announcement.created_at 
    ? new Date(announcement.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Дата не указана';
  
  const typeBadges = {
    'general': 'Общее',
    'service': 'Служба',
    'event': 'Мероприятие',
    'prayer': 'Молитва',
    'urgent': 'СРОЧНО'
  };
  
  const typeColors = {
    'general': '#6c757d',
    'service': '#007bff',
    'event': '#ffc107',
    'prayer': '#17a2b8',
    'urgent': '#dc3545'
  };
  
  const badgeText = typeBadges[announcement.announcement_type] || 'Объявление';
  const badgeColor = typeColors[announcement.announcement_type] || '#6c757d';
  
  return `
    <div class="announcement-card ${announcement.announcement_type}">
      <div class="announcement-header">
        <div class="announcement-badge" style="background:${badgeColor}">
          ${badgeText}
        </div>
        <div class="announcement-date">${date}</div>
      </div>
      <h3 class="announcement-title">${announcement.title || 'Без заголовка'}</h3>
      <div class="announcement-content">
        <p>${announcement.content || 'Содержание отсутствует'}</p>
      </div>
      ${announcement.priest_name ? `
        <div class="announcement-author">
          <span class="author-icon">☦️</span>
          <span>${announcement.priest_name}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// Создание карточки медиа
function createMediaCard(media) {
  if (!media) return '';
  
  const date = media.event_date
    ? new Date(media.event_date).toLocaleDateString('ru-RU', {
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