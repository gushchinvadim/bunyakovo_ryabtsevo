// src/js/components/CreateAdPage.js
import { auth } from "../utils/auth.js";
import { CONFIG } from "../../config.js";

export function createCreateAdPage() {
  const page = document.createElement("div");
  page.className = "create-ad-page";

  // Проверка авторизации
  if (!auth.isLoggedIn()) {
    page.innerHTML = `
      <div class="auth-required">
        <div class="card">
          <div class="card-content" style="text-align:center;padding:60px 20px">
            <p style="font-size:1.5rem;color:#bf2600;margin-bottom:20px">Требуется авторизация</p>
            <p style="margin-bottom:30px">Пожалуйста, войдите в систему, чтобы разместить объявление</p>
            <a href="/login" class="btn-primary" style="display:inline-block;padding:12px 30px">Войти</a>
          </div>
        </div>
      </div>
    `;
    return page;
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Разместить объявление</h1>
      <p class="page-subtitle">Заполните форму для публикации объявления</p>
    </div>
    
    <div class="create-ad-container">
      <form id="createAdForm" class="create-ad-form" enctype="multipart/form-data">
        <div class="form-section">
          <h3>Основная информация</h3>
          
          <div class="form-group">
            <label for="title">Заголовок объявления *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              maxlength="200"
              placeholder="Например: Продам велосипед в отличном состоянии"
            >
            <small>Кратко и понятно опишите суть объявления</small>
          </div>
          
          <div class="form-group">
            <label for="description">Описание *</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              rows="6"
              placeholder="Подробно опишите товар/услугу, состояние, особенности и т.д."
            ></textarea>
            <small>Максимум 1000 символов</small>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="ad_type">Тип объявления *</label>
              <select id="ad_type" name="ad_type" required>
                <option value="sale">Продам</option>
                <option value="buy">Куплю</option>
                <option value="rent">Сдам в аренду</option>
                <option value="free">Отдам в хорошие руки</option>
                <option value="handmade">Услуги мастера</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="village">Населённый пункт *</label>
              <select id="village" name="village" required>
                <option value="">Выберите...</option>
                <option value="bunyakovo">Буняково</option>
                <option value="ryabtsevo">Рябцево</option>
                <option value="other">Я из другого места</option>
              </select>
              <small class="profile-hint" style="display:none;color:#655130;font-size:0.85rem;margin-top:4px;">
                <span>ℹ️</span> Взято из вашего профиля
              </small>
            </div>
          </div>
          
          <div class="form-group" id="priceGroup">
            <label for="price">Цена (₽)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01"
              placeholder="0.00"
            >
            <small>Для "Продам" и "Сдам в аренду" обязательно. Для "Отдам" не указывается.</small>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Контактная информация</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="phone">Телефон для связи *</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                required
                placeholder="+7 (999) 123-45-67"
              >
              <small class="profile-hint" style="display:none;color:#655130;font-size:0.85rem;margin-top:4px;">
                <span>ℹ️</span> Взято из вашего профиля
              </small>
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder="example@email.com"
              >
              <small class="profile-hint" style="display:none;color:#655130;font-size:0.85rem;margin-top:4px;">
                <span>ℹ️</span> Взято из вашего профиля
              </small>
            </div>
          </div>
          
          <div class="form-group">
            <label for="address">Адрес (опционально)</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              placeholder="Улица, дом, квартира"
            >
            <small>Будет виден только в подробностях объявления</small>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Фотографии (до 3 штук)</h3>
          
          <div class="image-upload-container">
            <input 
              type="file" 
              id="images" 
              name="images" 
              accept="image/*" 
              multiple 
              max="3"
            >
            <label for="images" class="image-upload-label">
              <span>📷</span>
              <p>Выберите до 3 фотографий</p>
              <p class="upload-hint">JPG, PNG, WebP до 5 МБ каждая</p>
            </label>
            <div id="imagePreview" class="image-preview"></div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary btn-block">Опубликовать объявление</button>
          <a href="/marketplace" class="btn-secondary btn-block">Отмена</a>
        </div>
      </form>
      
      <div class="create-ad-message" id="createAdMessage" style="display:none"></div>
    </div>
  `;

  const createAdForm = page.querySelector("#createAdForm");
  const adTypeSelect = page.querySelector("#ad_type");
  const priceGroup = page.querySelector("#priceGroup");
  const priceInput = page.querySelector("#price");
  const villageSelect = page.querySelector("#village");
  const phoneInput = page.querySelector("#phone");
  const emailInput = page.querySelector("#email");
  const imagesInput = page.querySelector("#images");
  const imagePreview = page.querySelector("#imagePreview");
  const createAdMessage = page.querySelector("#createAdMessage");

  // Показ/скрытие поля цены в зависимости от типа объявления
  adTypeSelect.addEventListener("change", () => {
    if (adTypeSelect.value === "free") {
      priceGroup.style.display = "none";
      priceInput.required = false;
      priceInput.value = "";
    } else if (adTypeSelect.value === "buy") {
      priceGroup.style.display = "none";
      priceInput.required = false;
    } else {
      priceGroup.style.display = "block";
      priceInput.required = true;
    }
  });

  // Предпросмотр изображений
  imagesInput.addEventListener("change", () => {
    imagePreview.innerHTML = "";

    if (imagesInput.files.length > 3) {
      showMessage("Можно загрузить максимум 3 изображения", "error");
      imagesInput.value = "";
      return;
    }

    Array.from(imagesInput.files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showMessage(`Файл ${file.name} превышает 5 МБ`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "preview-image";
        imgWrapper.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <span class="remove-image" data-file="${file.name}">&times;</span>
          <span class="image-name">${file.name}</span>
        `;
        imagePreview.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  // Удаление изображения из предпросмотра
  imagePreview.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-image")) {
      const fileName = e.target.dataset.file;
      const files = Array.from(imagesInput.files);
      const filteredFiles = files.filter((f) => f.name !== fileName);

      const dataTransfer = new DataTransfer();
      filteredFiles.forEach((file) => dataTransfer.items.add(file));
      imagesInput.files = dataTransfer.files;

      e.target.parentElement.remove();
    }
  });

  // Отправка формы
  createAdForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Валидация цены
    if (
      adTypeSelect.value !== "free" &&
      adTypeSelect.value !== "buy" &&
      !priceInput.value
    ) {
      showMessage("Укажите цену для этого типа объявления", "error");
      return;
    }

    showMessage("Публикация объявления...", "info");

    try {
      const formData = new FormData();
      formData.append("title", createAdForm.title.value.trim());
      formData.append("description", createAdForm.description.value.trim());
      formData.append("ad_type", adTypeSelect.value);
      formData.append("village", villageSelect.value);

      if (priceInput.value && adTypeSelect.value !== "free") {
        formData.append("price", priceInput.value);
      }

      formData.append("phone", phoneInput.value.trim());
      formData.append("email", emailInput.value.trim());

      if (createAdForm.address.value) {
        formData.append("address", createAdForm.address.value.trim());
      }

      // Добавляем изображения
      if (imagesInput.files.length > 0) {
        Array.from(imagesInput.files).forEach((file, index) => {
          formData.append("images", file);
        });
      }

      const response = await fetch(
        `${CONFIG.API_URL}/marketplace/ads/`,
        {
          method: "POST",
          headers: {
            ...auth.getAuthHeader(),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || error.error || "Ошибка публикации объявления",
        );
      }

      showMessage(
        "Объявление успешно опубликовано! Ожидайте модерации.",
        "success",
      );

      // Очищаем форму
      createAdForm.reset();
      imagePreview.innerHTML = "";

      // Через 2 секунды перенаправляем на барахолку
      setTimeout(() => {
        window.location.href = "/marketplace";
      }, 2000);
    } catch (error) {
      showMessage(error.message || "Ошибка публикации", "error");
    }
  });

  function showMessage(text, type) {
    createAdMessage.textContent = text;
    createAdMessage.style.display = "block";
    createAdMessage.className = `create-ad-message ${type}`;
  }

  // 🔑 КЛЮЧЕВОЕ ДОБАВЛЕНИЕ: автозаполнение полей из профиля
  async function autoFillProfileData() {
    try {
      // Сначала пытаемся получить свежие данные из API
      const profile = await auth.getProfile();

      if (profile) {
        // Заполняем поля, если они не пустые
        if (profile.village && villageSelect.value === "") {
          villageSelect.value = profile.village;
          page.querySelector("#village + .profile-hint").style.display =
            "block";
        }

        if (profile.phone && phoneInput.value === "") {
          phoneInput.value = profile.phone;
          page.querySelector("#phone + .profile-hint").style.display = "block";
        }

        if (profile.email && emailInput.value === "") {
          emailInput.value = profile.email;
          page.querySelector("#email + .profile-hint").style.display = "block";
        }
      }
    } catch (error) {
      console.warn("Не удалось загрузить профиль для автозаполнения:", error);
      // Не показываем ошибку пользователю — поля останутся пустыми
    }
  }

  // Запускаем автозаполнение после рендеринга формы
  setTimeout(autoFillProfileData, 100);

  return page;
}
