# 🚀 Deployment Guide - Digital Exhibition

Panduan deployment untuk production environment.

## 📋 Production Requirements

### Server Requirements
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Storage:** Minimum 20GB SSD
- **CPU:** 2+ cores recommended
- **Network:** Public IP with domain name

### Software Requirements
- **Node.js** >= 16.0.0 LTS
- **PM2** (Process Manager)
- **Nginx** (Reverse Proxy)
- **SSL Certificate** (Let's Encrypt recommended)

## 🔧 Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Verify PM2 installation
pm2 --version
```

### 3. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## 📁 Application Deployment

### 1. Deploy Application Code

```bash
# Create application directory
sudo mkdir -p /var/www/digital-exhibition
sudo chown $USER:$USER /var/www/digital-exhibition

# Clone repository
cd /var/www/digital-exhibition
git clone <your-repository-url> .

# Or upload files via SCP/SFTP
```

### 2. Backend Deployment

```bash
# Navigate to server directory
cd /var/www/digital-exhibition/server

# Install production dependencies
npm ci --only=production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create production environment file
cp .env.example .env.production
```

**Configure Production Environment (`server/.env.production`):**

```env
# Server Configuration
PORT=3000
NODE_ENV=production
CLIENT_URL=https://your-domain.com

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# Firebase Configuration
# (Firebase config loaded from firebase-secret.json)
```

### 3. Frontend Deployment

```bash
# Navigate to client directory
cd /var/www/digital-exhibition/client-fipex

# Install dependencies
npm ci

# Build for production
npm run build

# Move build files to web root
sudo mkdir -p /var/www/html/digital-exhibition
sudo cp -r dist/* /var/www/html/digital-exhibition/
sudo chown -R www-data:www-data /var/www/html/digital-exhibition
```

### 4. Firebase Configuration

```bash
# Copy Firebase service account to server
scp firebase-secret.json user@your-server:/var/www/digital-exhibition/server/config/

# Set proper permissions
chmod 600 /var/www/digital-exhibition/server/config/firebase-secret.json
```

## 🔧 Process Management with PM2

### 1. Create PM2 Ecosystem File

**File: `/var/www/digital-exhibition/ecosystem.config.js`**

```javascript
module.exports = {
  apps: [{
    name: 'digital-exhibition-api',
    script: './server/app.js',
    cwd: '/var/www/digital-exhibition',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### 2. Start Application with PM2

```bash
# Create logs directory
mkdir -p /var/www/digital-exhibition/logs

# Start application
cd /var/www/digital-exhibition
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs digital-exhibition-api
```

### 3. PM2 Management Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs digital-exhibition-api

# Restart application
pm2 restart digital-exhibition-api

# Stop application
pm2 stop digital-exhibition-api

# Monitor resources
pm2 monit

# Reload application (zero-downtime)
pm2 reload digital-exhibition-api
```

## 🌐 Nginx Configuration

### 1. Create Nginx Configuration

**File: `/etc/nginx/sites-available/digital-exhibition`**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (Static Files)
    location / {
        root /var/www/html/digital-exhibition;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File Uploads
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### 2. Enable Nginx Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/digital-exhibition /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Or using snap
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Obtain SSL Certificate

```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (recommended: 2)
```

### 3. Auto-renewal Setup

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Setup cron job for auto-renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Firewall Configuration

### 1. Configure UFW Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### 2. Additional Security

```bash
# Disable root login (edit /etc/ssh/sshd_config)
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart ssh

# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Monitoring and Logging

### 1. Setup Log Rotation

**File: `/etc/logrotate.d/digital-exhibition`**

```
/var/www/digital-exhibition/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. System Monitoring

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor memory usage
free -h

# Monitor PM2 processes
pm2 monit
```

### 3. Application Monitoring

```bash
# View application logs
pm2 logs digital-exhibition-api

# Monitor application metrics
pm2 show digital-exhibition-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Deployment Automation

### 1. Create Deployment Script

**File: `/var/www/digital-exhibition/deploy.sh`**

```bash
#!/bin/bash

# Digital Exhibition Deployment Script

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backend deployment
echo "🔧 Deploying backend..."
cd server
npm ci --only=production

# Frontend deployment
echo "🎨 Building frontend..."
cd ../client-fipex
npm ci
npm run build

# Update frontend files
echo "📁 Updating frontend files..."
sudo rm -rf /var/www/html/digital-exhibition/*
sudo cp -r dist/* /var/www/html/digital-exhibition/
sudo chown -R www-data:www-data /var/www/html/digital-exhibition

# Restart application
echo "🔄 Restarting application..."
cd ..
pm2 reload digital-exhibition-api

# Test deployment
echo "🧪 Testing deployment..."
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 2. Make Script Executable

```bash
chmod +x /var/www/digital-exhibition/deploy.sh
```

### 3. Run Deployment

```bash
cd /var/www/digital-exhibition
./deploy.sh
```

## 🔍 Health Checks

### 1. Application Health Check

```bash
# Check API health
curl https://your-domain.com/health

# Expected response:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

### 2. Service Status Check

```bash
# Check all services
sudo systemctl status nginx
pm2 status
sudo systemctl status fail2ban

# Check SSL certificate
sudo certbot certificates
```

### 3. Performance Check

```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/

# Create curl-format.txt:
echo "     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n" > curl-format.txt
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs digital-exhibition-api

# Check environment variables
pm2 show digital-exhibition-api

# Restart application
pm2 restart digital-exhibition-api
```

#### 2. Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

#### 4. High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart application if needed
pm2 restart digital-exhibition-api
```

## 📋 Production Checklist

- [ ] Server properly configured
- [ ] Node.js and PM2 installed
- [ ] Application code deployed
- [ ] Environment variables configured
- [ ] Firebase service account configured
- [ ] PM2 process running
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Log rotation configured
- [ ] Backup strategy implemented
- [ ] Health checks passing
- [ ] Performance optimized

## 🔄 Maintenance

### Regular Tasks

#### Daily
- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Verify health checks

#### Weekly
- [ ] Review error logs
- [ ] Check SSL certificate status
- [ ] Monitor disk usage
- [ ] Review security logs

#### Monthly
- [ ] Update system packages
- [ ] Review and rotate logs
- [ ] Performance optimization
- [ ] Security audit

---

**Production Deployment Complete! 🎉**

Your Digital Exhibition platform is now live and ready for users!