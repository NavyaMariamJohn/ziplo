# 🚀 Ziplo Deployment Guide

Follow these steps to deploy your full-stack URL shortener application to **Render** (Backend & Database) and **Vercel** (Frontend).

---

## 🏗️ 1. Database Setup (PostgreSQL)

You can use **Render's Managed PostgreSQL** for a seamless experience.

1.  Log in to [Render](https://render.com/).
2.  Click **New +** and select **PostgreSQL**.
3.  Name your database (e.g., `ziplo-db`).
4.  Select the **Free** tier (or according to your needs).
5.  Click **Create Database**.
6.  Once created, copy the **Internal Database URL** (for backend use on Render) or **External Database URL** (for local testing).

---

## ⚙️ 2. Backend Deployment (Flask)

1.  Click **New +** on Render and select **Web Service**.
2.  Connect your GitHub repository.
3.  Set the following:
    *   **Name**: `ziplo-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
4.  Add **Environment Variables**:
    *   `DATABASE_URL`: (Paste your Internal PostgreSQL URL here)
    *   `SECRET_KEY`: (Any random string for JWT)
5.  Click **Deploy**. Copy your service's URL (e.g., `https://ziplo-backend.onrender.com`).

---

## 💻 3. Frontend Deployment (React/Vite)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: **Vite**
5.  Add **Environment Variables**:
    *   `VITE_API_URL`: (Paste your Render Backend URL + `/api`)
        *   Example: `https://ziplo-backend.der.com/api`
6.  Click **Deploy**.

---

## 🧪 4. Final Verification

1.  Visit your Vercel URL.
2.  Try creating a short link.
3.  Check the analytics to ensure data is persisting in your new PostgreSQL database.

---

> [!TIP]
> **HTTPS**: Both Render and Vercel provide automatic SSL (HTTPS), so your links will be secure by default.
