#!/bin/bash
# deploy.sh — Запускать ТОЛЬКО на сервере!
# Автор: Vadim Gushchin

set -e  # Остановить скрипт при любой ошибке

# === НАСТРОЙКИ ===
PROJECT_ROOT="/home/deploy/bunyakovo_ryabtsevo/bunyakovo_ryabtsevo"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV="$PROJECT_ROOT/.venv"

echo "🚀 Деплой проекта bunyakovo_ryabtsevo..."
echo "📁 Проект: $PROJECT_ROOT"

# Переходим в корень проекта
cd "$PROJECT_ROOT" || exit 1

# === 1. Обновляем код из GitHub ===
echo "📦 Pulling updates from GitHub..."
git pull

# === 2. Бэкенд: миграции и статика ===
echo "🐍 Setting up backend..."
cd "$BACKEND_DIR"

# Активируем виртуальное окружение
source "$VENV/bin/activate"

# (Опционально) Бэкап БД перед миграцией
# echo "💾 Creating database backup..."
# pg_dump bunyakovo_db > "$PROJECT_ROOT/backups/backup_$(date +%Y%m%d_%H%M).sql" 2>/dev/null || true

# Миграции и сборка статики
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Права на статику (используем переменную, а не хардкод!)
chmod -R o+rX "$BACKEND_DIR/staticfiles/"

# === 3. Подготовка папки media (если нет) ===
echo "📁 Checking media folder..."
mkdir -p "$BACKEND_DIR/media"
chmod -R 755 "$BACKEND_DIR/media"

# === 4. Фронтенд: сборка через Yarn ===
echo "🎨 Building frontend..."
cd "$FRONTEND_DIR"

# Установка зависимостей (--frozen-lockfile для стабильности)
yarn install --frozen-lockfile || {
    echo "⚠️ yarn install failed, trying without --frozen-lockfile..."
    yarn install
}

# Сборка
yarn build

# === 5. Перезапуск сервисов ===
echo "♻️ Restarting services..."

# Перезапуск Gunicorn (если sudo запросит пароль — скрипт остановится)
sudo systemctl restart gunicorn-bunyakovo

# Перезапуск Nginx
sudo systemctl restart nginx

# === Готово ===
echo ""
echo "✅ Деплой завершён успешно!"
echo "🌐 Сайт: https://буняково-рябцево.рф"
echo "🔧 Админка: https://буняково-рябцево.рф/admin"