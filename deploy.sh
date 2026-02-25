#!/bin/bash
# deploy.sh — Запускать ТОЛЬКО на сервере!

set -e  # Остановить скрипт при любой ошибке

echo "🚀 Деплой проекта bunyakovo_ryabtsevo..."

# Переходим в папку проекта (адаптируйте путь под ваш сервер!)
cd /home/deploy/bunyakovo_ryabtsevo/bunyakovo_ryabtsevo || exit

# 1. Обновляем код из GitHub
echo "📦 Pulling updates from GitHub..."
git pull

# 2. Бэкенд: миграции и статика
echo "🐍 Setting up backend..."
cd backend
source ../.venv/bin/activate
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# 3. Фронтенд: сборка через Yarn
echo "🎨 Building frontend..."
cd ../frontend
yarn install --frozen-lockfile  # Используем точные версии из yarn.lock
yarn build

# 4. Перезапуск сервисов
echo "♻️ Restarting services..."
# Если sudo требует пароль, можно настроить sudoers или использовать NOPASSWD
sudo systemctl restart gunicorn-bunyakovo
sudo systemctl restart nginx

echo "✅ Деплой завершён успешно!"