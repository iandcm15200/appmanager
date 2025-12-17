# Deployment Guide - APManager Widget

Production deployment guide for the APManager Student Search Zendesk Widget.

## 🎯 Overview

This guide covers deploying the widget and backend to production environments with best practices for security, performance, and reliability.

## 📋 Pre-Deployment Checklist

### Backend Requirements

- [ ] Node.js 18+ installed
- [ ] PostgreSQL or SQLite configured
- [ ] SSL certificate for HTTPS
- [ ] Environment variables configured
- [ ] Firewall rules configured
- [ ] Backup strategy in place

### Widget Requirements

- [ ] Zendesk admin access
- [ ] Widget ZIP built and tested
- [ ] API URL configured
- [ ] Translations complete
- [ ] Animation performance verified

### Security Requirements

- [ ] HTTPS enabled (required)
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Credentials encrypted
- [ ] Logs sanitized
- [ ] Security headers configured

## 🚀 Backend Deployment

### Option 1: Deploy to Heroku

#### Step 1: Prepare Application

```bash
cd backend

# Create Procfile
echo "web: node server.js" > Procfile

# Add engines to package.json
npm install
```

Edit `package.json`:
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### Step 2: Deploy

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create apmanager-widget-api

# Set environment variables
heroku config:set PORT=3000
heroku config:set APMANAGER_BASE_URL=https://apmanager.aplatam.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### Step 3: Add Database

```bash
# If using PostgreSQL
heroku addons:create heroku-postgresql:mini

# Or upload SQLite file
heroku ps:copy estudiantes.db
```

### Option 2: Deploy to AWS EC2

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Select: Ubuntu Server 22.04 LTS
4. Instance type: t3.small (minimum)
5. Configure security group:
   - SSH: Port 22 (your IP only)
   - HTTP: Port 80 (0.0.0.0/0)
   - HTTPS: Port 443 (0.0.0.0/0)
   - Custom: Port 3000 (for testing)

#### Step 2: Setup Server

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-repo/appmanager.git
cd appmanager/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
PORT=3000
APMANAGER_BASE_URL=https://apmanager.aplatam.com
DB_PATH=/home/ubuntu/estudiantes.db
NODE_ENV=production
LOG_LEVEL=info
EOF

# Start with PM2
pm2 start server.js --name apmanager-api
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/apmanager-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/apmanager-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

### Option 3: Deploy to DigitalOcean

#### Step 1: Create Droplet

1. Go to DigitalOcean → Create → Droplets
2. Select: Ubuntu 22.04
3. Plan: Basic - $12/month (2GB RAM)
4. Add SSH key
5. Create droplet

#### Step 2: Setup (Same as AWS EC2)

Follow AWS EC2 steps 2-5 above.

### Option 4: Deploy to Docker

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t apmanager-api .

# Run container
docker run -d \
  --name apmanager-api \
  -p 3000:3000 \
  -e APMANAGER_BASE_URL=https://apmanager.aplatam.com \
  -e NODE_ENV=production \
  -v $(pwd)/estudiantes.db:/app/estudiantes.db \
  apmanager-api

# Check logs
docker logs -f apmanager-api
```

#### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - APMANAGER_BASE_URL=https://apmanager.aplatam.com
      - NODE_ENV=production
    volumes:
      - ./estudiantes.db:/app/estudiantes.db
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## 📦 Widget Deployment

### Step 1: Build Production Widget

```bash
# Ensure all files are ready
./build-widget-zip.sh

# Verify structure
unzip -l apmanager-student-search.zip
```

### Step 2: Upload to Zendesk

1. Go to Zendesk Admin Center
2. Navigate to: Apps and integrations → Zendesk Support apps → Manage
3. Click "Upload private app"
4. Select `apmanager-student-search.zip`
5. Click "Upload"

### Step 3: Configure Production Settings

1. After upload, click "Install"
2. Configure settings:
   - **API URL**: `https://api.yourdomain.com` (your production backend)
3. Select installation locations:
   - ✅ Ticket sidebar
   - ✅ New ticket sidebar
4. Click "Install"

### Step 4: Test in Production

1. Open any ticket
2. Verify widget loads
3. Test authentication
4. Test search functionality
5. Test tipification

## 🔒 Security Configuration

### Backend Security Headers

Add to `server.js`:

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

### Rate Limiting

```bash
npm install express-rate-limit
```

Add to `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### CORS Configuration

Update CORS in `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://yourdomain.zendesk.com',
    'https://your-subdomain.zendesk.com'
  ],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Environment Variables

Never commit sensitive data:

```bash
# .env
PORT=3000
APMANAGER_BASE_URL=https://apmanager.aplatam.com
DB_PATH=/secure/path/estudiantes.db
NODE_ENV=production
LOG_LEVEL=warn
SECRET_KEY=your-secret-key-here
```

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

## 📊 Monitoring

### Setup PM2 Monitoring

```bash
# Enable monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor in real-time
pm2 monit
```

### Setup Application Monitoring

#### Option 1: PM2 Plus

```bash
pm2 link your-secret-key your-public-key
```

#### Option 2: New Relic

```bash
npm install newrelic
```

Create `newrelic.js`:
```javascript
exports.config = {
  app_name: ['APManager Widget API'],
  license_key: 'your-new-relic-key',
  logging: { level: 'info' }
};
```

Add to `server.js`:
```javascript
require('newrelic');
```

### Health Check Endpoint

Already implemented at `/health`:

```bash
curl https://api.yourdomain.com/health
```

Setup monitoring:
```bash
# With UptimeRobot, Pingdom, or StatusCake
# Monitor: https://api.yourdomain.com/health
# Interval: 5 minutes
# Expected: 200 OK
```

## 🔄 Backup Strategy

### Database Backup

```bash
# Daily backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="estudiantes.db"

# Create backup
cp "$DB_FILE" "$BACKUP_DIR/estudiantes_$DATE.db"

# Compress
gzip "$BACKUP_DIR/estudiantes_$DATE.db"

# Keep only last 30 days
find "$BACKUP_DIR" -name "estudiantes_*.db.gz" -mtime +30 -delete

echo "Backup completed: estudiantes_$DATE.db.gz"
EOF

chmod +x backup-db.sh
```

Setup cron:
```bash
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /path/to/backup-db.sh
```

### Application Backup

```bash
# Backup entire application
tar -czf apmanager-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  backend/
```

## 📈 Performance Optimization

### Enable Compression

```bash
npm install compression
```

Add to `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### Cache Static Assets

In Nginx:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email ON estudiantes(email);
CREATE INDEX IF NOT EXISTS idx_telefono ON estudiantes(telefono);
CREATE INDEX IF NOT EXISTS idx_lead_id ON estudiantes(lead_id);

-- Analyze database
ANALYZE estudiantes;
```

## 🐛 Troubleshooting

### Check Backend Status

```bash
# Check if process is running
pm2 status

# View logs
pm2 logs apmanager-api --lines 100

# Restart if needed
pm2 restart apmanager-api
```

### Check Network

```bash
# Test backend from outside
curl -I https://api.yourdomain.com/health

# Check SSL
curl -vI https://api.yourdomain.com/health

# Test specific endpoint
curl -X POST https://api.yourdomain.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"searchTerm":"test@email.com"}'
```

### Common Issues

**Issue:** 502 Bad Gateway
**Fix:**
```bash
# Check if backend is running
pm2 status

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

**Issue:** Database locked
**Fix:**
```bash
# Check for long-running queries
lsof | grep estudiantes.db

# Restart application
pm2 restart apmanager-api
```

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Last Updated:** December 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
