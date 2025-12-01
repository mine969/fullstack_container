# Deployment Guide

This project is configured for deployment on **Vercel** (Frontend) and **Render** (Backend).

## 1. Backend Deployment (Render)

We will deploy the backend first to get the API URL.

1.  Push your code to **GitHub**.
2.  Sign up/Log in to [Render](https://render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will detect the `render.yaml` file and propose creating:
    *   A **PostgreSQL Database** (`food-delivery-db`)
    *   A **Web Service** (`food-delivery-api`)
6.  Click **Apply**.
7.  Wait for the deployment to finish.
8.  Copy the **URL** of the `food-delivery-api` service (e.g., `https://food-delivery-api.onrender.com`).

**Note:** The `render.yaml` sets up a PostgreSQL database. The application code uses `mysql+pymysql`. You might need to change the driver in `backend/app/database.py` to `postgresql` if you use Render's DB, OR simply use an external MySQL provider (like Aiven) and set the `DATABASE_URL` environment variable manually in the Render dashboard.

## 2. Frontend Deployment (Vercel)

1.  Sign up/Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: Click `Edit` and select `frontend-demo`.
    *   **Environment Variables**:
        *   Name: `NEXT_PUBLIC_API_URL`
        *   Value: The Render Backend URL (e.g., `https://food-delivery-api.onrender.com`) **without the trailing slash**.
5.  Click **Deploy**.

## 3. Final Verification

1.  Open your Vercel deployment URL.
2.  Try to log in or view the menu.
3.  If you see data, everything is connected!
