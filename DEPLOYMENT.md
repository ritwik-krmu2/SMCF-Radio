# SMCF Radio — Production Deployment Guide

## 1. Prerequisites
- Node.js version 18.0.0 or higher (Node 20+ recommended).
- npm version 9.0.0 or higher.
- A modern static web host (Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront).
- *(Optional)* A Supabase project for persistent cloud PostgreSQL storage.

---

## 2. Deploying the Frontend

### Option A: Deploy to Vercel (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import the `SMCF-Radio` repository.
4. Set the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Configure Environment Variables under **Settings > Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (optional).
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key (optional).
6. Click **Deploy**. Vercel will build and provision an edge CDN URL with free automated SSL.

### Option B: Deploy to Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add a `public/_redirects` file for single-page application routing if using path navigation:
   ```
   /*    /index.html   200
   ```
4. Click **Deploy Site**.

### Option C: Self-Hosted Docker / Nginx Container
Create a `Dockerfile` in the root:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
Build and run:
```bash
docker build -t smcf-radio:1.0 .
docker run -d -p 80:80 --name smcf-radio-app smcf-radio:1.0
```

---

## 3. Setting Up the Supabase Database (Optional Cloud Mode)

To connect SMCF Radio to a live PostgreSQL database:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab in the Supabase Dashboard.
3. Open the file `supabase/migrations/20261114_initial_schema.sql` from this repository.
4. Paste the complete SQL migration into the editor and click **Run**.
5. Copy your **Project URL** and **anon public API Key** from **Project Settings > API**.
6. Set them in your hosting environment:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```
7. Re-deploy the frontend. The platform will automatically connect to Supabase.

---

## 4. Production Verification Checklist
- [x] Run `npm run lint` (`tsc --noEmit`) to verify 0 TypeScript compiler warnings.
- [x] Run `npm test` (`vitest run`) to confirm all 14 automated tests pass.
- [x] Run `npm run build` to verify clean bundle minification.
- [x] Verify audio playback operates cleanly without cross-origin errors on both desktop and mobile viewports.
- [x] Verify student login (`student@smcf.edu.in` / `student123`) and admin login (`admin@smcf.edu.in` / `admin123`).

