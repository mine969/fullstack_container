# Deployment Guide

This project is configured for deployment on **Vercel** (Frontend) and **Render** (Backend).

## 1. Backend Deployment (Render)

We will deploy the backend first to get the API URL.

1.  Push your code to **GitHub**.
2.  Sign up/Log in to [Render](https://render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will detect the `render.yaml` file and propose creating:
    - A **PostgreSQL Database** (`food-delivery-db`)
    - A **Web Service** (`food-delivery-api`)
6.  Click **Apply**.
7.  Wait for the deployment to finish.
    - **Note**: The deployment process will automatically run `seed_db.py` to initialize the database tables and seed them with data.
8.  Copy the **URL** of the `food-delivery-api` service (e.g., `https://food-delivery-api.onrender.com`).

**Database Note:** The application has been updated to support PostgreSQL automatically when deployed on Render. The `render.yaml` blueprint handles the database creation and connection linking.

## 2. Frontend Deployment (Vercel)

1.  Sign up/Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: Click `Edit` and select `frontend-demo`.
    - **Environment Variables**:
      - Name: `NEXT_PUBLIC_API_URL`
      - Value: The Render Backend URL (e.g., `https://food-delivery-api.onrender.com`) **without the trailing slash**.
5.  Click **Deploy**.

## 3. Final Verification

1.  Open your Vercel deployment URL.
2.  Try to log in or view the menu.
3.  If you see data, everything is connected!

## 4. Oracle Cloud Deployment

For deploying the full stack (Frontend, Backend, Database) on a single Oracle Cloud VM using Docker Compose, please refer to the [Oracle Cloud Deployment Guide](docs/devops/oracle_deployment.md).
