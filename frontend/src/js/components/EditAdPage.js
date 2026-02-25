// src/js/components/EditAdPage.js
import { auth } from "../utils/auth.js";
import { CONFIG } from "../../config.js";

export async function createEditAdPage(adId) {
  const page = document.createElement("div");
  page.className = "edit-ad-page";

  // Проверка авторизации
  if (!auth.isLoggedIn()) {
    page.innerHTML = `
      <div class="auth-required">
        <div class="card">
          <div class="card-content" style="text-align:center;padding:60px 20px">
            <p style="font-size:1.5rem;color:#bf2600;margin-bottom:20px">Требуется авторизация</p>
            <p style="margin-bottom:30px">Пожалуйста, войдите в систему для редактирования объявления</p>
            <a href="/login" class="btn-primary" style="display:inline-block;padding:12px 30px">Войти</a>
          </div>
        </div>
      </div>
    `;
    return page;
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Редактировать объявление</h1>
      <p class="page-subtitle">Внесите изменения в ваше объявление</p>
    </div>
    
    <div class="edit-ad-container">
      <div class="edit-ad-loading">
        <div class="spinner"></div>
        <p>Загрузка объявления...</p>
      </div>
      
      <div class="edit-ad-form-container" style="display:none">
        <form id="editAdForm" class="create-ad-form" enctype="multipart/form-data">
          <input type="hidden" id="adId" name="adId" value="${adId}">
          
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
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="ad_type">Тип объявления *</label>
                <select id="ad_type" name="ad_type" required>
                  <option value="sale">Продам</option>
                  <option value="buy">Куплю</option>
                  <option value="rent">Сдам в аренду</option>
                  <option value="free">Отдам в хорошие руки</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="village">Населённый пункт *</label>
                <select id="village" name="village" required>
                  <option value="bunyakovo">Буняково</option>
                  <option value="ryabtsevo">Рябцево</option>
                  <option value="other">Я из другого места</option>
                </select>
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
            </div>
          </div>
          
          <div class="form-section">
            <h3>Фотографии</h3>
            
            <div class="image-upload-container">
              <p class="current-images-label">Текущие фотографии:</p>
              <div id="currentImages" class="current-images-grid"></div>
              
              <p class="upload-instruction">Загрузите новые фото (заменят текущие):</p>
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
                <p>Выбрать до 3 фотографий</p>
                <p class="upload-hint">JPG, PNG, WebP до 5 МБ каждая</p>
              </label>
              <div id="imagePreview" class="image-preview"></div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary btn-block">Сохранить изменения</button>
            <a href="/marketplace/my-ads" class="btn-secondary btn-block">Отмена</a>
          </div>
        </form>
      </div>
      
      <div class="edit-ad-error" style="display:none">
        <p>Не удалось загрузить объявление. Возможно, оно не существует или не принадлежит вам.</p>
        <a href="/marketplace/my-ads" class="btn-secondary" style="display:inline-block;margin-top:15px">Вернуться к моим объявлениям</a>
      </div>
    </div>
    
    <div class="edit-ad-message" id="editAdMessage" style="display:none"></div>
  `;

  const loadingEl = page.querySelector(".edit-ad-loading");
  const formContainer = page.querySelector(".edit-ad-form-container");
  const errorEl = page.querySelector(".edit-ad-error");
  const editAdMessage = page.querySelector("#editAdMessage");

  // Загружаем данные объявления
  try {
    const response = await fetch(
      `${CONFIG.API_URL}/marketplace/ads/${adId}/`,
      {
        headers: auth.getAuthHeader(),
      },
    );

    if (!response.ok) {
      throw new Error(
        "Объявление не найдено или недоступно для редактирования",
      );
    }

    const ad = await response.json();
    populateForm(ad);
    loadingEl.style.display = "none";
    formContainer.style.display = "block";
  } catch (error) {
    console.error("Ошибка загрузки объявления:", error);
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    errorEl.querySelector("p").textContent =
      error.message || "Не удалось загрузить объявление";
  }

  // Функция заполнения формы данными объявления
  function populateForm(ad) {
    const form = page.querySelector("#editAdForm");

    form.title.value = ad.title;
    form.description.value = ad.description;
    form.ad_type.value = ad.ad_type;
    form.village.value = ad.village;
    form.phone.value = ad.phone || "";
    form.email.value = ad.email || "";
    form.address.value = ad.address || "";

    if (ad.price !== null) {
      form.price.value = ad.price;
    }

    // Показ/скрытие поля цены
    const priceGroup = page.querySelector("#priceGroup");
    const priceInput = page.querySelector("#price");

    if (ad.ad_type === "free") {
      priceGroup.style.display = "none";
      priceInput.required = false;
    } else if (ad.ad_type === "buy") {
      priceGroup.style.display = "none";
      priceInput.required = false;
    } else {
      priceGroup.style.display = "block";
      priceInput.required = true;
    }

    // Обработчик изменения типа объявления
    const adTypeSelect = page.querySelector("#ad_type");
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

    // Отображение текущих изображений
    const currentImagesGrid = page.querySelector("#currentImages");
    if (ad.images && ad.images.length > 0) {
      currentImagesGrid.innerHTML = ad.images
        .map(
          (img) => `
        <div class="current-image-item">
          <img src="${img.image_url}" alt="Текущее фото" loading="lazy">
        </div>
      `,
        )
        .join("");
    } else {
      currentImagesGrid.innerHTML =
        '<p class="no-images">Нет текущих фотографий</p>';
    }

    // Предпросмотр новых изображений
    const imagesInput = page.querySelector("#images");
    const imagePreview = page.querySelector("#imagePreview");

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
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Валидация цены
      const adType = adTypeSelect.value;
      if (adType !== "free" && adType !== "buy" && !priceInput.value) {
        showMessage("Укажите цену для этого типа объявления", "error");
        return;
      }

      showMessage("Сохранение изменений...", "info");

      try {
        // Создаём данные для отправки
        const formData = new FormData();
        formData.append("title", form.title.value.trim());
        formData.append("description", form.description.value.trim());
        formData.append("ad_type", adType);
        formData.append("village", form.village.value);

        if (priceInput.value && adType !== "free") {
          formData.append("price", priceInput.value);
        }

        formData.append("phone", form.phone.value.trim());
        formData.append("email", form.email.value.trim());

        if (form.address.value) {
          formData.append("address", form.address.value.trim());
        }

        // Добавляем новые изображения (если есть)
        if (imagesInput.files.length > 0) {
          Array.from(imagesInput.files).forEach((file, index) => {
            formData.append("images", file);
          });
        }

        const response = await fetch(
          `${CONFIG.API_URL}/marketplace/ads/${adId}/`,
          {
            method: "PUT",
            headers: {
              ...auth.getAuthHeader(),
              // Не указываем Content-Type — браузер сам установит с boundary
            },
            body: formData,
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.detail || error.error || "Ошибка сохранения изменений",
          );
        }

        showMessage(
          "Изменения сохранены! Объявление отправлено на модерацию.",
          "success",
        );

        // Через 2 секунды перенаправляем на мои объявления
        setTimeout(() => {
          window.location.href = "/marketplace/my-ads";
        }, 2000);
      } catch (error) {
        showMessage(error.message || "Ошибка сохранения", "error");
      }
    });
  }

  function showMessage(text, type) {
    editAdMessage.textContent = text;
    editAdMessage.style.display = "block";
    editAdMessage.className = `edit-ad-message ${type}`;
    // Автоматически скрываем через 5 секунд для успеха
    if (type === "success") {
      setTimeout(() => {
        editAdMessage.style.display = "none";
      }, 5000);
    }
  }

  return page;
}
