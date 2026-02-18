#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "import socket; socket.create_connection(('db', 5432))" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is up!"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
