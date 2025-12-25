#!/usr/bin/env bash
set -euo pipefail

API_PORT=4000
APP_DIR=/opt/pulsetter
DB_URL=${DATABASE_URL:-"postgres://pulsetter_dashboard:pulsetter_dashboard@localhost:5432/pulsetter_dashboard"}
JWT_SECRET=${JWT_SECRET:-"change_me_local_secret"}

# Install deps
sudo apt-get update
sudo apt-get install -y curl gnupg nginx postgresql-client

# Node 18 LTS
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
# PM2 for process management
sudo npm install -g pm2

cd "$APP_DIR"

# Env file for backend
cat > .env <<EOF
NODE_ENV=production
PORT=${API_PORT}
DATABASE_URL=${DB_URL}
JWT_SECRET=${JWT_SECRET}
SMARTLEAD_API_KEY=
INSTANTLY_API_TOKEN=
CLAY_API_KEY=
EOF

# Apply schema
psql "${DB_URL}" -f config/schema.sql

# Install backend deps
npm install

# Seed admin (change email/password if you want)
JWT_SECRET=${JWT_SECRET} DATABASE_URL=${DB_URL} <<'EOF' npm run seed:admin
admin@pulsetter.com
changeme123
EOF

# Build frontend with localhost API base
cd frontend
npm install
VITE_API_BASE="http://localhost:${API_PORT}/api/v1" npm run build
cd ..

# Serve frontend via nginx from /var/www/pulsetter
sudo mkdir -p /var/www/pulsetter
sudo rm -rf /var/www/pulsetter/*
sudo cp -r frontend/dist/* /var/www/pulsetter/

# Nginx config for localhost
sudo tee /etc/nginx/sites-available/pulsetter.conf > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;

    location /api/ {
        proxy_pass http://localhost:${API_PORT}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        root /var/www/pulsetter;
        try_files \$uri /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/pulsetter.conf /etc/nginx/sites-enabled/pulsetter.conf
sudo nginx -t && sudo systemctl reload nginx

# PM2 to run backend
cd "$APP_DIR"
pm2 stop pulsetter-api >/dev/null 2>&1 || true
JWT_SECRET=${JWT_SECRET} DATABASE_URL=${DB_URL} PORT=${API_PORT} NODE_ENV=production pm2 start src/index.js --name pulsetter-api
pm2 save

echo "Deployed. Visit http://localhost (frontend) and http://localhost:${API_PORT}/api/v1/health (API)."
