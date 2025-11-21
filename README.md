# Food Delivery App Prototype

This is a Dockerized fullstack prototype for the Food Delivery App.

## Tech Stack

- **Frontend**: Next.js (JavaScript, Tailwind CSS)
- **Backend**: FastAPI (Python)
- **Database**: MySQL
- **Proxy**: Nginx

## Prerequisites

- Docker & Docker Compose installed.

## How to Run (For Teammates)

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd fullstack_container
    ```

2.  **Start the application**:

    ```bash
    docker-compose up -d --build
    ```

3.  **Access the App**:
    - **Frontend**: [http://localhost](http://localhost)
    - **API Docs**: [http://localhost/docs](http://localhost/docs)
    - **Backend API**: [http://localhost/api](http://localhost/api)

## Development Notes

- The `nginx` service routes traffic:
  - `/` -> Frontend (Port 3000)
  - `/api` -> Backend (Port 8000)
- **Frontend Code**: Located in `frontend-demo/`
- **Backend Code**: Located in `backend/`
- **Database**: Data is persisted in the `db` container. To reset, run `docker-compose down -v`.

## Troubleshooting

- If ports 80 or 3306 are busy, stop other services or edit `docker-compose.yml`.
- Use `docker-compose logs -f` to see server logs.
