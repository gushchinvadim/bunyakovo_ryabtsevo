export function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="footer-container">
      <nav class="footer-nav" aria-label="Футер навигация">
        <ul>
          <li><a href="/church">Покровская церковь</a></li>
          <li><a href="/history">История</a></li>
          <li><a href="/about">О нас</a></li>
          <li><a href="/marketplace">Барахолка</a></li>
          <li><a href="/">Главная</a></li>
          <li><a href="mailto:bunryab@yandex.ru?subject=Информация с сайта Буняково-Рябцево">Обратная связь</a></li>
        </ul>
      </nav>
      <p class="copyright">&copy; Буняково-Рябцево ${new Date().getFullYear()}</p>
    </div>
  `;

  return footer;
}
