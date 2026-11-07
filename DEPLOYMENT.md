# Aurora Luxe — Production Deployment Guide

This guide explains how to deploy **Aurora Luxe** on **Netlify**, **Vercel**, **Varying VPS / Linux Servers**, and traditional Node.js hosting platforms.

---

## 1. Environment Variables

Before deploying, ensure you configure the following environment variables in your hosting provider's dashboard:

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for your database (SQLite for local/simple VPS, PostgreSQL for production) | `postgresql://user:password@host:5432/dbname?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your deployed website | `https://auroraluxe.ma` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of your admin password | (Generate via bcrypt) |
| `WHATSAPP_TOKEN` | Optional Meta Cloud API token for instant order notifications | `EAA...` |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional WhatsApp Phone Number ID | `104829...` |

---

## 2. Deploying on Vercel

Vercel is ideal for Next.js applications:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into Vercel.
3. Configure Environment Variables (`DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, etc.).
4. **Build Command**: `prisma generate && next build`
5. Click **Deploy**.

---

## 3. Deploying on Netlify

1. Import your git repository into Netlify.
2. Build Settings:
   - **Build Command**: `npx prisma generate && npm run build`
   - **Publish Directory**: `.next`
3. Add your Environment Variables in **Site settings > Build & deploy > Environment**.
4. Click **Deploy site**.

---

## 4. Deploying on a VPS / Linux Server (PM2 + Nginx)

For high-performance self-hosting on Ubuntu / Debian / AlmaLinux:

1. **Install Node.js (v18+) & Git**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs build-essential
   ```
2. **Clone Repository & Install Dependencies**:
   ```bash
   git clone <your-repo-url> aurora-luxe
   cd aurora-luxe
   npm install
   ```
3. **Configure `.env`**:
   Create a `.env` file with your production `DATABASE_URL` (PostgreSQL recommended for multi-instance VPS).
4. **Run Database Migrations & Seed (if needed)**:
   ```bash
   npx prisma migrate deploy
   npm run build
   ```
5. **Start with PM2**:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "aurora-luxe" -- start
   pm2 save
   pm2 startup
   ```
6. **Configure Nginx Reverse Proxy**:
   Point Nginx to `http://localhost:3000` with SSL enabled via Let's Encrypt (`certbot`).

---

## 5. File Uploads & Persistent Storage

- Uploaded images and videos are saved to `public/uploads/`.
- On serverless platforms like Vercel or Netlify, ephemeral filesystems mean uploaded files in `public/uploads` may not persist across serverless function re-spawns. For production scale on serverless, configure an external cloud storage provider (AWS S3, Cloudinary, or Supabase Storage) by updating `app/api/admin/upload/route.ts`.
- On VPS or dedicated servers, `public/uploads/` persists automatically on disk.
