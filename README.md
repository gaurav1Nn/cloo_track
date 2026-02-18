# 🎫 Support Ticket System

A full-stack support ticket system with AI-powered classification. Users submit tickets, an LLM (Google Gemini) auto-suggests category and priority, and a dashboard shows aggregate statistics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.1 + Django REST Framework |
| Database | PostgreSQL 15 |
| Frontend | React 18 + Vite |
| LLM | Google Gemini 2.0 Flash |
| Infrastructure | Docker + Docker Compose + Nginx |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/gaurav1Nn/cloo_track.git
cd cloo_track

# 2. Set your Gemini API key (optional — app works without it)
export GEMINI_API_KEY=your_api_key_here

# 3. Run everything
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/

> The app is fully functional without a Gemini API key — the LLM auto-suggestion feature simply won't be available.

## Features

### Submit Tickets
- Title and description fields with validation
- **AI-powered classification**: Gemini auto-suggests category and priority when you write a description
- User can accept or override LLM suggestions
- Loading state during AI classification
- Form clears on success, ticket appears instantly

### Ticket Management
- Browse all tickets, newest first
- Filter by category, priority, and status (all combinable)
- Search by title and description
- Change ticket status with one click (Open → In Progress → Resolved → Closed)

### Stats Dashboard
- Total tickets, open count, average tickets per day
- Priority and category breakdowns with visual progress bars
- Auto-refreshes when tickets are created or updated

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create a new ticket (201) |
| `GET` | `/api/tickets/` | List tickets with `?category=`, `?priority=`, `?status=`, `?search=` |
| `PATCH` | `/api/tickets/<id>/` | Update ticket (status, category, priority) |
| `GET` | `/api/tickets/stats/` | Aggregated statistics |
| `POST` | `/api/tickets/classify/` | LLM classification of a description |

## Why Gemini?

I chose **Google Gemini 2.0 Flash** for the LLM integration because:

1. **Free tier**: Generous free quota — no billing needed for development and evaluation
2. **Speed**: Flash model is optimized for low latency, ideal for real-time classification
3. **Quality**: Strong classification accuracy with structured prompts
4. **Simple SDK**: `google-generativeai` Python package is straightforward to integrate

## Design Decisions

### Backend
- **Single serializer** for create/update/list — DRF auto-validates choices on PATCH (rejects invalid values like `{"status": "banana"}`)
- **DB-level aggregation** in stats endpoint using `aggregate()` with `Count` + `filter` — no Python-level loops
- **Hybrid avg_tickets_per_day** — DB aggregation for counts, minimal Python division (pure DB division is fragile)
- **Graceful LLM failure** — if Gemini is unreachable, returns 503; ticket submission still works without suggestions
- **Input validation on classify** — rejects empty/short descriptions before calling Gemini API
- **Gemini JSON parsing** — regex extraction handles Gemini's tendency to wrap JSON in markdown code fences
- **3 Gunicorn workers** — prevents LLM calls (3-5s latency) from blocking other requests

### Frontend
- **Empty dropdown defaults** — forces user to select category/priority (prevents accidental wrong submissions)
- **LLM override tracking** — if user manually changes a dropdown, subsequent classify calls don't overwrite their selection
- **Debounced search** (300ms) — reduces API calls while typing
- **Empty state handling** — "No tickets yet" vs "No tickets match your filters"
- **Relative API URLs** (`/api`) — Nginx proxies to backend, avoids CORS issues

### Infrastructure
- **Docker-first approach** — started with working containers, built features on top
- **Postgres healthcheck** — `pg_isready` with `condition: service_healthy`
- **Entrypoint wait loop** — socket-level check as belt-and-suspenders with Docker healthcheck
- **Nginx reverse proxy** — serves React SPA, proxies `/api/` to Django
- **Auto-migrations** — `manage.py migrate --noinput` runs on every container start

## Project Structure

```
├── backend/
│   ├── config/           # Django project settings
│   ├── tickets/          # Tickets app (models, views, serializers, LLM)
│   ├── Dockerfile
│   ├── entrypoint.sh     # Wait for DB → migrate → gunicorn
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # API service (relative URLs)
│   │   └── components/   # React components
│   ├── Dockerfile        # Multi-stage: Node build → Nginx serve
│   └── nginx.conf        # Proxy /api/ → backend
├── docker-compose.yml
└── README.md
```
