# Suporter Frontend - Streamer Dashboard Web Application

A modern, high-performance **Vite + React** web application for managing streamer projects, generating flexible OBS Studio Overlay URLs, and testing real-time stream alerts against the Golang REST API (`http://localhost:8080`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18+`
- **Backend API**: Running on `http://localhost:8080` (`cd ../backend && make run`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser!

### 4. Build for Production
```bash
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.

---

## 🏗️ Architecture & Features

- **Auth System**: Registration & Login with JWT token storage (`localStorage`).
- **Project Management**: Create stream projects, generate OBS Overlay URLs, and select screen positioning presets (`?align=top-right`, `center`, `bottom-left`, etc.).
- **Live Alert Simulator**: Trigger real-time stream alerts (`POST /api/v1/projects/:uuid/alert`) with custom sender names, messages, duration, and style presets (`donation`, `subscriber`, `follower`, `default`).
- **Direct Swagger Access**: Header link directly to `http://localhost:8080/swagger/index.html`.
