// /**
//  * Основное приложение
//  */

// import { createHeader, updateActiveNavigation } from './components/Header.js';
// import { createFooter } from './components/Footer.js';
// import { createMainContent } from './components/MainContent.js';

// // Инициализация приложения
// export function initApp() {
//   // Создаём и вставляем хедер
//   const header = createHeader(navigate);
//   document.body.prepend(header);

//   const main = createMainContent(navigate);
//   document.body.prepend(main);

//   // Создаём и вставляем футер
//   const footer = createFooter();
//   document.body.appendChild(footer);

//   // Загружаем модуль по умолчанию
//   navigate('/main');

//   // Обработчик кастомного события навигации
//   document.addEventListener('navigate', (event) => {
//     if (event.detail && event.detail.path) {
//       navigate(event.detail.path);
//     }
//   });
// }
