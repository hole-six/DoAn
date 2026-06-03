# Checklist chay local va deploy production Effort Job

## 1. Local development

### Backend

Tao file `backend/.env` tu `backend/.env.example`.

Gia tri mac dinh local:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/da_nang_it_jobs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend

Tao file `frontend/.env` tu `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_URL=http://localhost:5173
VITE_SOCKET_URL=http://localhost:5000
```

Chay:

```bash
npm run dev
```

## 2. Production tren VPS

Tao file `.env.production` o thu muc root du an tren VPS tu `.env.production.example`.

Bat buoc doi:

```env
FRONTEND_URL=https://effortit.site
CLIENT_URL=https://effortit.site
CORS_ORIGINS=https://effortit.site,https://www.effortit.site
NODE_OPTIONS=--max-old-space-size=4096
VITE_API_URL=https://effortit.site/api
VITE_PUBLIC_URL=https://effortit.site
VITE_SOCKET_URL=https://effortit.site
GOOGLE_CALLBACK_URL=https://effortit.site/api/auth/google/callback
```

Them cac khoa rieng:

```env
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GEMINI_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Effort Job <no-reply@effortit.site>
DEPLOY_WEBHOOK_SECRET=...
```

## 3. Build thu cong tren VPS

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run build
export NODE_OPTIONS=--max-old-space-size=4096
npm --prefix frontend run build
rsync -a --delete frontend/dist/ /var/www/itjob-frontend/
pm2 start ecosystem.config.cjs
pm2 save
```

Backend tu doc `.env.production`, `.env`, `backend/.env.production`, hoac `backend/.env`.

## 4. Nginx

Dung `deploy/itjob-nginx.conf`. File nay da dat `server_name effortit.site www.effortit.site`.

Nginx can proxy:

- `/api/` ve backend port `5000`
- `/uploads/` ve backend port `5000`
- `/socket.io/` ve backend port `5000` voi WebSocket upgrade
- cac route frontend ve `index.html`

## 5. Webhook deploy tu Git

Webhook server doc `.env.production` tu root du an. Endpoint:

```text
GET  /health
POST /webhook
```

GitHub webhook:

- Payload URL: `https://effortit.site/webhook` neu ban proxy webhook qua Nginx, hoac `http://IP:9001/webhook` neu mo port rieng.
- Content type: `application/json`
- Secret: trung voi `DEPLOY_WEBHOOK_SECRET`
- Event: push branch `DEPLOY_BRANCH`

Khi push dung branch, webhook se:

1. `git fetch --all --prune`
2. `git reset --hard origin/<branch>`
3. `npm ci` backend/frontend
4. build backend/frontend
5. sync `frontend/dist`
6. `pm2 reload itjob-backend --update-env`

## 6. Kiem tra sau deploy

```bash
curl https://effortit.site/api/trangthai
curl https://effortit.site/api/deploy/health
pm2 logs itjob-backend
pm2 logs itjob-webhook
```

Mo trinh duyet kiem tra:

- Dang nhap admin khong bi roi phien bat thuong.
- Thong bao realtime co badge.
- Chat realtime qua `/socket.io`.
- Upload PDF CV va quet nhanh CV chinh.
- Email goi y viec lam dung domain production.
