FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations + seed on every boot (both are idempotent), then start server.
# Shell form so $PORT (injected by Railway) expands.
CMD alembic upgrade head && python seed.py && gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
