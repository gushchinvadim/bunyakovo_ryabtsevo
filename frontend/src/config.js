// Определяем базовый URL в зависимости от окружения
export const CONFIG = {
  // В продакшене — относительные пути (работают на любом домене)
  // На локалке с Webpack Dev Server — можно указать явно
  BASE_URL:
    process.env.NODE_ENV === "production" ? "" : "http://localhost:8000",

  STATIC_URL:
    process.env.NODE_ENV === "production"
      ? "/static"
      : "http://localhost:8000/static",
  MEDIA_URL:
    process.env.NODE_ENV === "production"
      ? "/media"
      : "http://localhost:8000/media",
  API_URL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8000/api",
};
