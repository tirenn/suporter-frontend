# Suporter Frontend - Streamer Dashboard Web Application

A modern, high-performance **Vite + React** web application for managing streamer projects, generating flexible OBS Studio Overlay URLs, and testing real-time stream alerts.

---

## 🛠️ Tech Stack

- **React 18**
- **Vite**
- **TailwindCSS / Lucide Icons**
- **Secret & Environment Management**: [Doppler](https://www.doppler.com/)

---

## 🔐 Doppler Setup (Frontend Service)

1. Create a project named **`suporter-frontend`** on [Doppler](https://doppler.com).
2. Import secrets from [`.env.example`](file:///c:/Users/Ryzen/Documents/Projects/suporter/frontend/.env.example):
   - `VITE_BACKEND_URL`: URL to your Backend API (e.g., `http://localhost:8080` or `https://api.yourdomain.com`).
   - `VITE_RECAPTCHA_SITE_KEY`: Google reCAPTCHA v2 Site Key.
   - `VITE_GA_MEASUREMENT_ID`: Google Analytics Measurement ID (optional).
3. Setup and link locally:
```bash
doppler login
doppler setup --project suporter-frontend --config dev
```
4. Run locally with Doppler:
```bash
# Run local dev server with injected variables
doppler run -- npm run dev

# Build with injected variables
doppler run -- npm run build
```

---

## 🤖 GitHub Actions CI/CD for Frontend Repo

If this frontend repository is hosted independently:
- **`ci.yml`**: Runs `npm ci` and verifies production bundle build on every PR and merge to `main`.
- **`deploy.yml`**: Runs `1. Build Check` ➔ `2. Deploy to VPS on Tag` (`git tag v1.0.0 && git push origin v1.0.0`), retrieves secrets via Doppler, connects to your VPS over SSH, and rebuilds/restarts the frontend Docker container.

### Required GitHub Secrets for Frontend:
- `DOPPLER_TOKEN`: Doppler Service Token for `suporter-frontend` (Production config).
- `SSH_HOST`: VPS IP address / hostname.
- `SSH_USER`: SSH username on VPS (e.g. `root`).
- `SSH_KEY`: SSH private key.
- `SSH_PORT`: *(optional, default 22)*.
- `TARGET_DIR`: `/root/Projects/suporter-frontend`.

---

## 🚀 Quick Start Guide

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Build for production
npm run build
```
