# Render Deployment (PostgreSQL Migration)

To enable free deployment on Render, we need to migrate the application from MySQL to PostgreSQL, as Render provides a free managed PostgreSQL database.

## User Review Required

> [!IMPORTANT] > **Database Switch**: The application will be configured to support PostgreSQL. This involves adding the `psycopg2-binary` dependency.
> **Data Seeding**: The existing `init.sql` (MySQL specific) will be replaced/augmented by a Python-based seeding script (`seed_db.py`) that works with SQLAlchemy. This ensures compatibility across both MySQL (local) and PostgreSQL (Render).

## Proposed Changes

### Backend

#### [MODIFY] [requirements.txt](file:///d:/github/Container/fullstack_container/backend/requirements.txt)

- Add `psycopg2-binary` for PostgreSQL support.

#### [MODIFY] [database.py](file:///d:/github/Container/fullstack_container/backend/app/database.py)

- Update `SQLALCHEMY_DATABASE_URL` handling to replace `postgres://` with `postgresql://` (fix for SQLAlchemy 1.4+ with Render).

#### [NEW] [seed_db.py](file:///d:/github/Container/fullstack_container/backend/app/seed_db.py)

- Create a script to initialize the database schema and seed it with data (converted from `init.sql`).
- This script will use SQLAlchemy models, making it database-agnostic.

#### [NEW] [render.yaml](file:///d:/github/Container/fullstack_container/render.yaml)

- Define the Render Blueprint for:
  - **Web Service**: The FastAPI backend (Docker).
  - **Database**: The free PostgreSQL instance.
  - **Environment Variables**: Link the DB to the service.

### Documentation

#### [MODIFY] [DEPLOYMENT.md](file:///d:/github/Container/fullstack_container/DEPLOYMENT.md)

- Update the Render deployment section with specific instructions for this new setup.

## Verification Plan

### Automated Tests

- Run the new `seed_db.py` locally with a SQLite or Postgres container to verify it inserts data correctly.
- `python backend/app/seed_db.py`

### Manual Verification

- Deploy to Render (User action).
- Verify the API is accessible and returns data (e.g., `/api/menu`).
