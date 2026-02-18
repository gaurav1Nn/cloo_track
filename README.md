# Support Ticket System

A full-stack support ticket management platform with AI-powered ticket classification. Users submit tickets describing their issues, and the system automatically categorizes them and suggests a priority level using Google's Gemini LLM — users can review and override these suggestions before submitting.

## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| **Backend**    | Django 5 + Django REST Framework        |
| **Database**   | PostgreSQL 15                           |
| **Frontend**   | React 18 (Vite)                         |
| **LLM**        | Google Gemini 2.5 Flash                 |
| **Infra**      | Docker + Docker Compose + Nginx         |

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd clootrack
   ```

2. **Configure your API key:**
   Create a `.env` file in the project root:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```
   This single command will:
   - Start a PostgreSQL 15 database
   - Build and run the Django backend (with automatic migrations)
   - Build and serve the React frontend via Nginx
   - Connect all services together

4. **Open the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

No additional setup steps are required. The app is fully functional after `docker-compose up --build`.

## LLM Integration — Why Gemini?

**Model:** `gemini-2.5-flash`

I chose Google Gemini for the following reasons:

1. **Cost-effective:** Gemini Flash models offer excellent performance at a fraction of the cost of larger models, making it ideal for a classification task that doesn't require advanced reasoning.
2. **Speed:** Flash models are optimized for low latency, which is crucial for real-time ticket classification as users type.
3. **Generous free tier:** Google AI Studio provides a free API key with generous rate limits, making it easy for reviewers to test.
4. **JSON output reliability:** Gemini handles structured JSON output well with clear prompting, reducing the need for complex output parsing.

### How Classification Works

1. User enters a ticket description in the form
2. On blur (leaving the description field), the frontend calls `POST /api/tickets/classify/`
3. The backend sends the description to Gemini with a structured classification prompt
4. Gemini returns a JSON object with `suggested_category` and `suggested_priority`
5. The frontend pre-fills the Category and Priority dropdowns with the AI suggestions
6. A green banner shows the AI suggestion — the user can accept or override before submitting
7. On ticket creation, if category/priority are not provided, the backend auto-classifies via LLM

### Prompt Design

The classification prompt (in `backend/tickets/llm_service.py`) provides:

- **Explicit category definitions:** billing, technical, account, general — each with example scenarios
- **Priority escalation guidelines:** critical (system down, data loss) → low (cosmetic, feature requests)
- **Strict output format:** JSON-only response, no markdown or explanation
- **Input validation:** Descriptions under 10 characters are rejected before calling the LLM

### Graceful Error Handling

- If `GEMINI_API_KEY` is not set → LLM is skipped, ticket creation still works with defaults
- If Gemini API is unreachable → returns `503 Service Unavailable`, form remains functional
- If Gemini returns unparseable output → falls back gracefully, logs a warning
- Category/priority default to `general`/`medium` when LLM is unavailable

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create a ticket (category/priority auto-filled by LLM if omitted) |
| `GET` | `/api/tickets/` | List tickets, newest first. Filters: `?category=`, `?priority=`, `?status=`, `?search=` |
| `PATCH` | `/api/tickets/<id>/` | Update ticket (e.g., change status, override category/priority) |
| `GET` | `/api/tickets/stats/` | Aggregated statistics (DB-level aggregation) |
| `POST` | `/api/tickets/classify/` | LLM-suggested category + priority for a description |

### Stats Endpoint — DB-Level Aggregation

The `/api/tickets/stats/` endpoint uses **Django ORM `aggregate()` with `Count` and `Q` filters** — no Python-level loops. All counting happens at the PostgreSQL level in a single query:

```python
stats = Ticket.objects.aggregate(
    total_tickets=Count('id'),
    open_tickets=Count('id', filter=Q(status='open')),
    in_progress_tickets=Count('id', filter=Q(status='in_progress')),
    resolved_tickets=Count('id', filter=Q(status='resolved')),
    priority_low=Count('id', filter=Q(priority='low')),
    # ... all breakdowns via single DB query
)
```

The `avg_tickets_per_day` uses a hybrid approach: DB-level `Min('created_at')` + minimal Python division, since pure DB-level date arithmetic is fragile across databases.

## Data Model

```
Ticket
├── title        CharField(max_length=200)   — required
├── description  TextField                   — required
├── category     CharField(choices)          — billing|technical|account|general, default='general'
├── priority     CharField(choices)          — low|medium|high|critical, default='medium'
├── status       CharField(choices)          — open|in_progress|resolved|closed, default='open'
└── created_at   DateTimeField(auto_now_add) — auto-set on creation
```

All constraints (choices, max_length, defaults) are enforced at the **database level** via Django model field definitions.

## Frontend Features

- **Dashboard view:** 4 stat cards (open, in-progress, resolved, avg/day), priority breakdown bars, category donut chart
- **Ticket table:** Sortable columns, colored status/priority badges, click-to-expand full description
- **Filters:** Search bar + category/priority/status dropdowns, all combinable
- **Create ticket modal:** AI auto-suggests category & priority on description blur, user can override
- **Status management:** Change ticket status directly from the table via dropdown
- **Auto-refresh:** Stats and ticket list refresh automatically when tickets are created or updated

## Project Structure

```
clootrack/
├── backend/
│   ├── config/              # Django project settings, URLs, WSGI
│   │   ├── settings.py      # DB config, CORS, GEMINI_API_KEY from env
│   │   └── urls.py          # API routing
│   ├── tickets/             # Main app
│   │   ├── models.py        # Ticket model with DB-level constraints
│   │   ├── serializers.py   # DRF serializers (create, classify)
│   │   ├── views.py         # ViewSet with CRUD, stats, classify
│   │   └── llm_service.py   # Gemini integration + prompt + parsing
│   ├── Dockerfile           # Python 3.11-slim, gunicorn
│   ├── entrypoint.sh        # Wait for DB, run migrations, start server
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # StatsBoard, TicketList, TicketForm, FilterBar
│   │   ├── api/             # ticketService.js — API client
│   │   ├── App.jsx          # Main layout with sidebar + modal
│   │   └── App.css          # Complete design system
│   ├── Dockerfile           # Node build + Nginx serve
│   ├── nginx.conf           # Reverse proxy config (API → backend:8000)
│   └── vite.config.js
├── docker-compose.yml       # PostgreSQL + Django + React/Nginx
├── .env                     # GEMINI_API_KEY (not committed)
├── .gitignore
└── README.md
```

## Design Decisions

1. **Gunicorn with 4 workers** — production-grade WSGI server instead of Django's dev server
2. **Nginx as frontend + reverse proxy** — serves the React SPA and proxies `/api/` requests to Django, eliminating CORS issues in production
3. **PostgreSQL health checks** — `docker-compose.yml` uses `pg_isready` health checks so the backend waits for the database to be fully ready before running migrations
4. **Entrypoint script pattern** — `entrypoint.sh` handles DB wait → migrate → collectstatic → gunicorn start in sequence
5. **Single serializer for CRUD** — `TicketSerializer` handles create, update, and list with DRF's built-in choice validation
6. **Category/priority optional on create** — allows the LLM to fill them automatically, with fallback defaults if LLM is unavailable
7. **Frontend classify on blur** — calls the LLM endpoint when the user leaves the description field, avoiding excessive API calls on every keystroke

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for LLM classification | Optional (app works without it) |
| `DB_NAME` | PostgreSQL database name | Set in docker-compose.yml |
| `DB_USER` | PostgreSQL user | Set in docker-compose.yml |
| `DB_PASSWORD` | PostgreSQL password | Set in docker-compose.yml |
| `DB_HOST` | PostgreSQL host | Set in docker-compose.yml |
| `DB_PORT` | PostgreSQL port | Set in docker-compose.yml |
