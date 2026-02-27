## Proektadjiite-RecipeCreator

AI‑assisted recipe generator with a Flask backend and a Vite/React (TypeScript, Tailwind, shadcn/ui) frontend. This README covers **all commands you need to develop, test, and run the app locally or with Docker.**

---

### Project structure

- **Root**
  - `docker-compose.yml` – multi‑service stack (backend + frontend)
  - `.env.example` – root environment template (secrets, DB URL, OpenAI, CORS, DockerHub username)
- **Backend** (`backend/`)
  - Flask API (JWT auth, SQLAlchemy, CORS)
  - `requirements.txt` – Python dependencies
  - `.env.example` – backend‑specific env template
  - `Dockerfile` – production backend image (Gunicorn on port 5000)
- **Frontend** (`frontend/`)
  - Vite + React + TypeScript + Tailwind + shadcn/ui app
  - `package.json` – scripts and JS/TS deps
  - `.env.example` – frontend env template (API base URL)
  - `Dockerfile` – production static build served by nginx on port 80

---

### Prerequisites

- **Node.js** 20+ (Node 22 used in Docker; 18+ will probably work but 20+ is safest)
- **npm** (or `pnpm`/`yarn` if you prefer, but commands below use `npm`)
- **Python** 3.12 (or 3.10+; Docker image uses 3.12)
- **pip** (Python package manager)
- **Docker & Docker Compose** (optional but recommended for an easy full‑stack run)

---

### 1. Environment configuration

#### Root `.env`

1. From the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and set as needed:
   - **`SECRET_KEY` / `JWT_SECRET_KEY`** – change to strong secrets in non‑dev
   - **`DATABASE_URL`** – defaults to `sqlite:///app.db` (good for local dev)
   - **`OPENAI_API_KEY`** – required for AI‑enhanced recipes
   - **`CORS_ORIGINS`** – e.g. `http://localhost:5173` for local Vite dev, or `http://localhost` when using Docker nginx
   - **`DOCKERHUB_USERNAME`** – used for Docker images / compose

#### Backend `.env`

```bash
cp backend/.env.example backend/.env
```

Key values:
- `SECRET_KEY`, `JWT_SECRET_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `CORS_ORIGINS`

#### Frontend `.env`

```bash
cp frontend/.env.example frontend/.env
```

Key value:
- **`VITE_API_BASE_URL`** – URL of the backend when running `npm run dev` in the frontend.
  - Example for local Flask on port 5001: `http://localhost:5001`

---

### 2. Running with Docker (recommended)

This is the quickest way to get **both backend and frontend** running in a production‑like setup.

From the project root:

```bash
docker compose build
docker compose up
```

This will:
- Build the **backend** image from `backend/Dockerfile` (Flask + Gunicorn on `:5000`)
- Build the **frontend** image from `frontend/Dockerfile` (nginx static site on `:80`)
- Start both on a shared `recipe-network`

Once healthy:
- **App URL**: `http://localhost` (frontend nginx, which proxies `/api` to backend if configured that way)

To run in the background:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

If you change code or dependencies, rebuild:

```bash
docker compose build --no-cache
```

---

### 3. Running locally without Docker

You can run backend and frontend separately on your host machine.

#### 3.1 Backend – Flask API

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Make sure `backend/.env` and root `.env` are set as described above.

Start the backend (development):

```bash
export FLASK_APP=app.py        # if needed
export FLASK_ENV=development   # optional
flask run --host=0.0.0.0 --port=5001
```

or start with `python` if the app uses a factory pattern:

```bash
python app.py
```

> **Note**: Adjust the port to match what you set as `VITE_API_BASE_URL` in the frontend `.env` (examples here use `5001`).

#### 3.2 Frontend – Vite dev server

From the project root:

```bash
cd frontend
npm install
```

Ensure `frontend/.env` has `VITE_API_BASE_URL` pointing to your running backend (e.g. `http://localhost:5001`).

Start the dev server:

```bash
npm run dev
```

By default Vite listens on `http://localhost:5173` (check the terminal for the exact URL). The frontend will call the backend using `VITE_API_BASE_URL`.

---

### 4. Frontend commands (from `frontend/`)

- **Install deps**

```bash
npm install
```

- **Start dev server**

```bash
npm run dev
```

- **Build for production**

```bash
npm run build
```

- **Preview production build locally**

```bash
npm run preview
```

- **Lint**

```bash
npm run lint
```

- **Run tests (once)**

```bash
npm test
```

- **Run tests in watch mode**

```bash
npm run test:watch
```

---

### 5. Backend commands (from `backend/`)

- **Create / activate virtualenv (recommended)**

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

- **Install dependencies**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

- **Run Flask app (development)**

```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5001
```

- **Run backend tests (pytest)**

```bash
pytest
```

- **Run via Gunicorn (locally, similar to Docker)**

```bash
gunicorn -b 0.0.0.0:5000 app:app
```

---

### 6. Building and publishing Docker images (optional)

If you want to build/push images manually (in addition to `docker compose build`), set `DOCKERHUB_USERNAME` in `.env` and run from the project root:

#### Backend image

```bash
docker build -t ${DOCKERHUB_USERNAME}/recipecreator-backend:latest -f backend/Dockerfile .
docker push ${DOCKERHUB_USERNAME}/recipecreator-backend:latest
```

#### Frontend image

```bash
docker build -t ${DOCKERHUB_USERNAME}/recipecreator-frontend:latest -f frontend/Dockerfile .
docker push ${DOCKERHUB_USERNAME}/recipecreator-frontend:latest
```

These tags line up with the ones referenced in `docker-compose.yml`.

---

### 7. Troubleshooting

- **Frontend can’t reach backend**
  - Double‑check `VITE_API_BASE_URL` in `frontend/.env`
  - Confirm backend is actually running and listening on that host/port
  - Check CORS settings (`CORS_ORIGINS`) in `.env` / `backend/.env`

- **Docker compose healthcheck fails for backend**
  - Inspect backend container logs:

    ```bash
    docker compose logs backend
    ```

  - Verify DB URL and secrets are valid

- **Port conflicts**
  - Vite dev: change port with `npm run dev -- --port 5174`
  - Flask dev: change `--port` in `flask run`
  - Docker: update `docker-compose.yml` if you want something other than `80:80`

---

### 8. Quick start summary

**Fastest way (Docker):**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose build
docker compose up
```

Open `http://localhost` in your browser.

**Local dev (no Docker):**

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask run --host=0.0.0.0 --port=5001

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`.
