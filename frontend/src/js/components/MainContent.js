// src/js/components/MainContent.js

export function createMainContent() {
  const main = document.createElement("main");
  main.className = "main-content";

  // Исправленный код информера БЕЗ инлайн-стилей
  const weatherHTML = `
    <div id="gsInformerID-VNKIQvtnHEpVvB" class="gsInformer">
      <div class="gsIContent">
        <div id="cityLink">
          <a href="https://www.gismeteo.ru/weather-domodedovo-4369/" target="_blank" title="Погода в Домодедово">
            <img src="https://nst1.gismeteo.ru/assets/flat-ui/img/gisloader.svg" width="24" height="24" alt="Погода в Домодедово">
          </a>
        </div>
        <div class="gsLinks">
          <table>
            <tr>
              <td>
                <div class="leftCol">
                  <a href="https://www.gismeteo.ru/" target="_blank" title="Погода">
                    <img alt="Погода" src="https://nst1.gismeteo.ru/assets/flat-ui/img/logo-mini2.png" align="middle" border="0" width="11" height="16" />
                    <img src="https://nst1.gismeteo.ru/assets/flat-ui/img/informer/gismeteo.svg" border="0" align="middle" style="left:5px;top:1px">
                  </a>
                </div>
                <div class="rightCol">
                  <a href="https://www.gismeteo.ru/weather-domodedovo-4369/2-weeks/" target="_blank" title="Погода в Домодедово на 2 недели">
                    <img src="https://nst1.gismeteo.ru/assets/flat-ui/img/informer/forecast-2weeks.ru.svg" border="0" align="middle" style="top:auto" alt="Погода в Домодедово на 2 недели">
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;

  main.innerHTML = `
    <div class="content-grid">
      <!-- Погода -->
      <section class="card weather-card">
        <div class="card-header">
          <h2 class="card-title">🌤️ Погода</h2>
          <div class="card-badge">Домодедово</div>
        </div>
        <div class="card-content weather-content">
          ${weatherHTML}
        </div>
      </section>
      
      <!-- Важная информация -->
      <section class="card important-info-card">
        <div class="card-header">
          <h2 class="card-title">ℹ️ Информация</h2>
          <div class="card-badge">Срочно</div>
        </div>
        <div class="card-content important-info-content">
          <div class="important-info-placeholder">
            <p>Здесь будет отображаться важная информация для жителей Буняково и Рябцево.</p>
            <p class="important-info-subtitle">Следите за обновлениями!</p>
          </div>
        </div>
      </section>
      
      <!-- Полезные телефоны -->
      <section class="card useful-phones-card">
        <div class="card-header">
          <h2 class="card-title">☎️ Полезные телефоны</h2>
          <div class="card-badge">Важно</div>
        </div>
        <div class="card-content useful-phones-content">
          <div class="content-loader">
            <div class="spinner"></div>
            <p>Загрузка телефонов...</p>
          </div>
        </div>
      </section>
      
      <!-- Новости -->
      <section class="card news-card">
        <div class="card-header">
          <h2 class="card-title">📰 Новости</h2>
          <div class="card-badge">Свежее</div>
        </div>
        <div class="card-content news-content">
          <div class="news-placeholder">
            <p>Здесь будут появляться актуальные новости о жизни в Буняково и Рябцево.</p>
            <p class="news-subtitle">Следите за обновлениями!</p>
          </div>
        </div>
      </section>
      
      <!-- Полезные ссылки -->
      <section class="card links-card">
        <div class="card-header">
          <h2 class="card-title">🔗 Полезные ссылки</h2>
          <div class="card-badge">Сервисы</div>
        </div>
        <div class="card-content">
          <ul class="useful-links">
          <ul class="useful-links">
            <li><span class="link-icon">🚕</span> <a href="https://taxi.yandex.ru/" target="_blank" rel="noopener noreferrer">Заказ такси</a></li>
            <li><span class="link-icon">🚆</span> <a href="https://rasp.yandex.ru/all-transport/vostryakovo-platform--moscow-paveletskaya" target="_blank" rel="noopener noreferrer">Электрички в Москву</a></li>
            <li><span class="link-icon">🚆</span> <a href="https://rasp.yandex.ru/all-transport/moscow-paveletskaya--vostryakovo-platform" target="_blank" rel="noopener noreferrer">Электрички из Москвы</a></li>
            <li><span class="link-icon">🏛️</span> <a href="https://domod.ru/about/territorial_control/" target="_blank" rel="noopener noreferrer">Администрация Домодедово</a></li>
            <li><span class="link-icon">🍕</span> <a href="https://alanca.ru" target="_blank" rel="noopener noreferrer">Заказ еды</a></li>
            <li><span class="link-icon">🔥</span> <a href="https://mosoblgaz.ru/payment/prices/?ysclid=mlvr20femk237889861" target="_blank" rel="noopener noreferrer">Газ тарифы</a></li>
            <li><span class="link-icon">🔌</span> <a href="https://www.mosenergosbyt.ru/individuals/tariffs-n-payments/tariffs-mo/?ysclid=mlvxv2pz3v528477528" target="_blank" rel="noopener noreferrer">Электричество тарифы</a></li>
          </ul>
        </div>
      </section>
    </div>
  `;

  // Загружаем контент после возврата компонента
  Promise.resolve().then(() => {
    loadImportantInfo(main.querySelector(".important-info-content"));
    loadNews(main.querySelector(".news-content"));
    loadUsefulPhones(main.querySelector(".useful-phones-content"));
  });

  return main;
}

async function loadImportantInfo(container) {
  try {
    const response = await fetch(
      "http://localhost:8000/api/community/news-items/important/",
    );

    if (!response.ok) {
      throw new Error("Ошибка загрузки важной информации");
    }

    const items = await response.json();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="news-placeholder">
          <p>Нет важной информации для отображения</p>
        </div>
      `;
    } else {
      container.innerHTML = items
        .map((item) => createNewsItem(item, "important"))
        .join("");
    }
  } catch (error) {
    console.error("Ошибка загрузки важной информации:", error);
    container.innerHTML = `
      <div class="news-placeholder error">
        <p>⚠️ Не удалось загрузить важную информацию</p>
      </div>
    `;
  }
}

async function loadNews(container) {
  try {
    const response = await fetch(
      "http://localhost:8000/api/community/news-items/news/",
    );

    if (!response.ok) {
      throw new Error("Ошибка загрузки новостей");
    }

    const items = await response.json();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="news-placeholder">
          <p>Нет новостей для отображения</p>
          <p class="news-subtitle">Следите за обновлениями!</p>
        </div>
      `;
    } else {
      container.innerHTML = items
        .map((item) => createNewsItem(item, "news"))
        .join("");
    }
  } catch (error) {
    console.error("Ошибка загрузки новостей:", error);
    container.innerHTML = `
      <div class="news-placeholder error">
        <p>📰 Не удалось загрузить новости</p>
      </div>
    `;
  }
}

function createNewsItem(item, type) {
  const date = item.published_at
    ? new Date(item.published_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Дата не указана";

  // Ограничиваем длину текста для превью (150 символов)
  const preview =
    item.content.length > 150
      ? item.content.substring(0, 150) + "..."
      : item.content;

  return `
    <div class="news-item ${type}-item">
      <div class="news-item-header">
        <h3 class="news-item-title">${item.title}</h3>
        <span class="news-item-date">${date}</span>
      </div>
      <div class="news-item-content">
        <p>${preview}</p>
      </div>
    </div>
  `;
}

// Загрузка полезных телефонов
async function loadUsefulPhones(container) {
  try {
    const response = await fetch(
      "http://localhost:8000/api/community/useful-phones/",
    );

    if (!response.ok) {
      throw new Error("Ошибка загрузки телефонов");
    }

    const data = await response.json();
    const phones = data.results || data;

    if (phones.length === 0) {
      container.innerHTML = `
        <div class="phones-placeholder">
          <p>Нет полезных телефонов для отображения</p>
        </div>
      `;
    } else {
      container.innerHTML = createPhonesHTML(phones);
    }
  } catch (error) {
    console.error("Ошибка загрузки полезных телефонов:", error);
    container.innerHTML = `
      <div class="phones-placeholder error">
        <p>⚠️ Не удалось загрузить телефоны</p>
      </div>
    `;
  }
}

// Создание HTML для телефонов
function createPhonesHTML(phones) {
  // Группируем по категориям
  const categories = {
    emergency: "🚨 Экстренные службы",
    administration: "🏛️ Администрация",
    medical: "🏥 Медицинские",
    transport: "🚌 Транспорт",
    police: "👮 Полиция",
    utility: "💧 Коммунальные службы",
    other: "ℹ️ Другое",
  };

  let html = "";

  Object.entries(categories).forEach(([categoryKey, categoryName]) => {
    const categoryPhones = phones.filter((p) => p.category === categoryKey);

    if (categoryPhones.length > 0) {
      html += `
        <div class="phones-category">
          <h3 class="category-title">${categoryName}</h3>
          <div class="phones-list">
      `;

      categoryPhones.forEach((phone) => {
        const phoneHref = `tel:${phone.phone.replace(/\D/g, "")}`;

        html += `
          <div class="phone-item">
            <div class="phone-name">${phone.name}</div>
            <a href="${phoneHref}" class="phone-number contact-link">
              📞 ${phone.phone}
            </a>
            ${
              phone.description
                ? `
              <div class="phone-description">${phone.description}</div>
            `
                : ""
            }
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }
  });

  return html;
}

//       <!-- Полезные ссылки -->
//       <section class="card links-card">
//         <div class="card-header">
//           <h2 class="card-title">🔗 Полезные ссылки</h2>
//           <div class="card-badge">Сервисы</div>
//         </div>
//         <div class="card-content">
//           <ul class="useful-links">
//             <li><span class="link-icon">🚕</span> <a href="https://taxi.yandex.ru/" target="_blank" rel="noopener noreferrer">Заказ такси</a></li>
//             <li><span class="link-icon">🚆</span> <a href="https://rasp.yandex.ru/all-transport/vostryakovo-platform--moscow-paveletskaya" target="_blank" rel="noopener noreferrer">Электрички в Москву</a></li>
//             <li><span class="link-icon">🚆</span> <a href="https://rasp.yandex.ru/all-transport/moscow-paveletskaya--vostryakovo-platform" target="_blank" rel="noopener noreferrer">Электрички из Москвы</a></li>
//             <li><span class="link-icon">🏛️</span> <a href="https://domod.ru/about/territorial_control/" target="_blank" rel="noopener noreferrer">Администрация Домодедово</a></li>
//             <li><span class="link-icon">🍕</span> <a href="https://alanca.ru" target="_blank" rel="noopener noreferrer">Заказ еды</a></li>
//             <li><span class="link-icon">🔥</span> <a href="https://mosoblgaz.ru/payment/prices/?ysclid=mlvr20femk237889861" target="_blank" rel="noopener noreferrer">Газ тарифы</a></li>
//             <li><span class="link-icon">🔌</span> <a href="https://www.mosenergosbyt.ru/individuals/tariffs-n-payments/tariffs-mo/?ysclid=mlvxv2pz3v528477528" target="_blank" rel="noopener noreferrer">Электричество тарифы</a></li>
//           </ul>
//         </div>
//       </section>
//     </div>
//   `;

//   // Загружаем контент после возврата компонента
//   Promise.resolve().then(() => {
//     loadImportantInfo(main.querySelector('.important-info-content'));
//     loadNews(main.querySelector('.news-content'));
//     loadUsefulPhones(main.querySelector('.useful-phones-content'));
//   });

//   return main;
// }

// async function loadImportantInfo(container) {
//   try {
//     const response = await fetch('http://localhost:8000/api/community/news-items/important/');

//     if (!response.ok) {
//       throw new Error('Ошибка загрузки важной информации');
//     }

//     const items = await response.json();

//     if (items.length === 0) {
//       container.innerHTML = `
//         <div class="news-placeholder">
//           <p>Нет важной информации для отображения</p>
//         </div>
//       `;
//     } else {
//       container.innerHTML = items.map(item => createNewsItem(item, 'important')).join('');
//     }

//   } catch (error) {
//     console.error('Ошибка загрузки важной информации:', error);
//     container.innerHTML = `
//       <div class="news-placeholder error">
//         <p>⚠️ Не удалось загрузить важную информацию</p>
//       </div>
//     `;
//   }
// }

// async function loadNews(container) {
//   try {
//     const response = await fetch('http://localhost:8000/api/community/news-items/news/');

//     if (!response.ok) {
//       throw new Error('Ошибка загрузки новостей');
//     }

//     const items = await response.json();

//     if (items.length === 0) {
//       container.innerHTML = `
//         <div class="news-placeholder">
//           <p>Нет новостей для отображения</p>
//           <p class="news-subtitle">Следите за обновлениями!</p>
//         </div>
//       `;
//     } else {
//       container.innerHTML = items.map(item => createNewsItem(item, 'news')).join('');
//     }

//   } catch (error) {
//     console.error('Ошибка загрузки новостей:', error);
//     container.innerHTML = `
//       <div class="news-placeholder error">
//         <p>📰 Не удалось загрузить новости</p>
//       </div>
//     `;
//   }
// }

// function createNewsItem(item, type) {
//   const date = item.published_at
//     ? new Date(item.published_at).toLocaleDateString('ru-RU', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//       })
//     : 'Дата не указана';

//   // Ограничиваем длину текста для превью (150 символов)
//   const preview = item.content.length > 150
//     ? item.content.substring(0, 150) + '...'
//     : item.content;

//   return `
//     <div class="news-item ${type}-item">
//       <div class="news-item-header">
//         <h3 class="news-item-title">${item.title}</h3>
//         <span class="news-item-date">${date}</span>
//       </div>
//       <div class="news-item-content">
//         <p>${preview}</p>
//       </div>
//     </div>
//   `;
// }

// // Загрузка полезных телефонов
// async function loadUsefulPhones(container) {
//   try {
//     const response = await fetch('http://localhost:8000/api/community/useful-phones/');

//     if (!response.ok) {
//       throw new Error('Ошибка загрузки телефонов');
//     }

//     const data = await response.json();
//     const phones = data.results || data;

//     if (phones.length === 0) {
//       container.innerHTML = `
//         <div class="phones-placeholder">
//           <p>Нет полезных телефонов для отображения</p>
//         </div>
//       `;
//     } else {
//       container.innerHTML = createPhonesHTML(phones);
//     }

//   } catch (error) {
//     console.error('Ошибка загрузки полезных телефонов:', error);
//     container.innerHTML = `
//       <div class="phones-placeholder error">
//         <p>⚠️ Не удалось загрузить телефоны</p>
//       </div>
//     `;
//   }
// }

// // Создание HTML для телефонов
// function createPhonesHTML(phones) {
//   // Группируем по категориям
//   const categories = {
//     'emergency': '🚨 Экстренные службы',
//     'administration': '🏛️ Администрация',
//     'medical': '🏥 Медицинские',
//     'transport': '🚌 Транспорт',
//     'utility': '💧 Коммунальные службы',
//     'other': 'ℹ️ Другое'
//   };

//   let html = '';

//   Object.entries(categories).forEach(([categoryKey, categoryName]) => {
//     const categoryPhones = phones.filter(p => p.category === categoryKey);

//     if (categoryPhones.length > 0) {
//       html += `
//         <div class="phones-category">
//           <h3 class="category-title">${categoryName}</h3>
//           <div class="phones-list">
//       `;

//       categoryPhones.forEach(phone => {
//         const phoneHref = `tel:${phone.phone.replace(/\D/g, '')}`;

//         html += `
//           <div class="phone-item">
//             <div class="phone-name">${phone.name}</div>
//             <a href="${phoneHref}" class="phone-number contact-link">
//               📞 ${phone.phone}
//             </a>
//             ${phone.description ? `
//               <div class="phone-description">${phone.description}</div>
//             ` : ''}
//           </div>
//         `;
//       });

//       html += `
//           </div>
//         </div>
//       `;
//     }
//   });

//   return html;
// }
