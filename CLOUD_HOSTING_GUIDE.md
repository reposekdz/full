# ☁️ CLOUD HOSTING GUIDE - Garden TVET School Management System

## 🎯 System Architecture Overview

**Stack:**
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Real-time**: Socket.IO
- **SMS**: Africa's Talking API
- **Storage**: File uploads (images, documents)

---

## 🌍 RECOMMENDED CLOUD PROVIDERS (Best to Worst)

### 1. ⭐ AWS (Amazon Web Services) - BEST CHOICE
**Why:** Most reliable, scalable, Rwanda region available

**Services Needed:**
- **EC2** (Backend) - t3.medium ($30/month)
- **RDS MySQL** (Database) - db.t3.small ($25/month)
- **S3** (File storage) - ~$5/month
- **CloudFront** (CDN for frontend) - ~$10/month
- **Route 53** (DNS) - $1/month
- **Total: ~$71/month**

**Deployment:**
```bash
# Backend on EC2
ssh ubuntu@your-ec2-ip
git clone your-repo
cd backend
npm install --production
pm2 start server.js

# Frontend on S3 + CloudFront
npm run build
aws s3 sync dist/ s3://your-bucket
```

---

### 2. ⭐ DigitalOcean - EASIEST & AFFORDABLE
**Why:** Simple, great for Node.js, good pricing

**Services Needed:**
- **Droplet** (4GB RAM) - $24/month
- **Managed MySQL** - $15/month
- **Spaces** (Storage) - $5/month
- **Total: ~$44/month**

**Deployment:**
```bash
# One-click Node.js droplet
# Install MySQL, Nginx, PM2
# Deploy both frontend & backend on same server
```

---

### 3. ⭐ Heroku - FASTEST DEPLOYMENT
**Why:** Zero DevOps, automatic scaling

**Services Needed:**
- **Dyno** (Standard) - $25/month
- **JawsDB MySQL** - $10/month
- **Total: ~$35/month**

**Deployment:**
```bash
# One command deployment
heroku create garden-tvet
git push heroku main
heroku addons:create jawsdb:kitefin
```

---

### 4. Azure - GOOD FOR ENTERPRISE
**Why:** Microsoft ecosystem, good support

**Services Needed:**
- **App Service** - $55/month
- **Azure Database for MySQL** - $30/month
- **Blob Storage** - $5/month
- **Total: ~$90/month**

---

### 5. Google Cloud Platform (GCP)
**Why:** Good performance, AI/ML features

**Services Needed:**
- **Compute Engine** - $25/month
- **Cloud SQL** - $25/month
- **Cloud Storage** - $5/month
- **Total: ~$55/month**

---

### 6. Vercel + PlanetScale - MODERN STACK
**Why:** Serverless, auto-scaling

**Services Needed:**
- **Vercel** (Frontend) - Free/$20/month
- **Railway** (Backend) - $5-20/month
- **PlanetScale** (MySQL) - Free/$29/month
- **Total: ~$25-69/month**

---

### 7. Render - SIMPLE & MODERN
**Why:** Easy deployment, good pricing

**Services Needed:**
- **Web Service** - $7/month
- **PostgreSQL** (or MySQL) - $7/month
- **Total: ~$14/month**

---

## 🏆 BEST CHOICE FOR YOUR SYSTEM: DigitalOcean

### Why DigitalOcean?
✅ **Affordable** - $44/month total
✅ **Simple** - Easy to manage
✅ **Reliable** - 99.99% uptime
✅ **Fast** - Good performance
✅ **Scalable** - Easy to upgrade
✅ **Support** - Great documentation
✅ **Rwanda-friendly** - Works well in Africa

---

## 📋 COMPLETE DEPLOYMENT GUIDE (DigitalOcean)

### Step 1: Create Droplet
```bash
# Choose:
- Ubuntu 22.04 LTS
- 4GB RAM / 2 CPUs ($24/month)
- Datacenter: Frankfurt (closest to Rwanda)
- Add SSH key
```

### Step 2: Initial Server Setup
```bash
# SSH into server
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (web server)
apt install -y nginx

# Install MySQL
apt install -y mysql-server
mysql_secure_installation
```

### Step 3: Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE school_management;
CREATE USER 'school_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON school_management.* TO 'school_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import your database
mysql -u school_user -p school_management < backup.sql
```

### Step 4: Deploy Backend
```bash
# Create app directory
mkdir -p /var/www/garden-tvet
cd /var/www/garden-tvet

# Clone repository
git clone https://github.com/your-repo/garden-tvet.git .

# Install dependencies
cd backend
npm install --production

# Create .env file
nano .env
```

**Backend .env:**
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=school_user
DB_PASSWORD=strong_password
DB_NAME=school_management
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username
```

```bash
# Start with PM2
pm2 start server.js --name garden-backend
pm2 save
pm2 startup
```

### Step 5: Deploy Frontend
```bash
# Build frontend
cd /var/www/garden-tvet
npm install
npm run build

# Move build to Nginx directory
cp -r dist /var/www/html/garden-tvet
```

### Step 6: Configure Nginx
```bash
nano /etc/nginx/sites-available/garden-tvet
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/html/garden-tvet;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/garden-tvet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup SSL (HTTPS)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### Step 8: Setup Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Step 9: Setup Backups
```bash
# Create backup script
nano /root/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u school_user -pstrong_password school_management > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/garden-tvet/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /root/backup.sh
```

---

## 🚀 ALTERNATIVE: One-Click Deployment Scripts

### Deploy to DigitalOcean (Automated)
```bash
# Create deploy.sh
#!/bin/bash
echo "🚀 Deploying Garden TVET to DigitalOcean..."

# Update code
cd /var/www/garden-tvet
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart garden-backend

# Frontend
cd ..
npm install
npm run build
cp -r dist/* /var/www/html/garden-tvet/

echo "✅ Deployment complete!"
```

---

## 💰 COST COMPARISON (Monthly)

| Provider | Basic | Recommended | Enterprise |
|----------|-------|-------------|------------|
| **DigitalOcean** | $44 | $79 | $150 |
| **AWS** | $71 | $120 | $300+ |
| **Heroku** | $35 | $75 | $200+ |
| **Azure** | $90 | $150 | $400+ |
| **Render** | $14 | $50 | $150 |
| **Vercel+Railway** | $25 | $69 | $200+ |

---

## 📊 PERFORMANCE REQUIREMENTS

### Minimum (100 users):
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 2TB/month

### Recommended (500 users):
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Bandwidth**: 5TB/month

### Enterprise (2000+ users):
- **CPU**: 8 cores
- **RAM**: 16GB
- **Storage**: 250GB SSD
- **Bandwidth**: 10TB/month

---

## 🔒 SECURITY CHECKLIST

- [ ] SSL certificate installed (HTTPS)
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Database password strong
- [ ] JWT secret changed
- [ ] API rate limiting enabled
- [ ] Regular backups automated
- [ ] Monitoring setup (PM2, Nginx logs)
- [ ] Environment variables secured
- [ ] File upload limits set

---

## 📱 DOMAIN & DNS SETUP

### 1. Buy Domain (Recommended):
- **Namecheap** - $10/year
- **GoDaddy** - $12/year
- **Google Domains** - $12/year

### 2. Point to Server:
```
A Record: @ → your-droplet-ip
A Record: www → your-droplet-ip
```

### 3. Wait for DNS propagation (24-48 hours)

---

## 🎯 RECOMMENDED SETUP FOR RWANDA

### Best Configuration:
```
Provider: DigitalOcean
Datacenter: Frankfurt (closest to Rwanda)
Droplet: 4GB RAM / 2 CPUs ($24/month)
Database: Managed MySQL ($15/month)
Storage: Spaces ($5/month)
Domain: .rw domain ($20/year)
SSL: Free (Let's Encrypt)

Total: ~$44/month + $20/year domain
```

### Why This Works:
✅ Low latency to Rwanda
✅ Affordable pricing
✅ Easy to manage
✅ Reliable uptime
✅ Good support
✅ Scalable

---

## 🚀 QUICK DEPLOY COMMANDS

### DigitalOcean One-Liner:
```bash
curl -sSL https://raw.githubusercontent.com/your-repo/deploy.sh | bash
```

### Manual Deploy:
```bash
# 1. Create droplet
# 2. SSH in
ssh root@your-ip

# 3. Run setup
wget https://raw.githubusercontent.com/your-repo/setup.sh
chmod +x setup.sh
./setup.sh

# 4. Done! Visit your-domain.com
```

---

## 📞 SUPPORT & MONITORING

### Monitoring Tools:
- **PM2 Monitoring**: `pm2 monit`
- **Nginx Logs**: `tail -f /var/log/nginx/access.log`
- **MySQL Logs**: `tail -f /var/log/mysql/error.log`
- **Uptime Robot**: Free uptime monitoring

### Alerts:
- Email alerts for downtime
- SMS alerts for critical errors
- Slack integration for team notifications

---

## 🎉 FINAL RECOMMENDATION

**For Garden TVET School:**

**Use DigitalOcean with this setup:**
- 4GB Droplet in Frankfurt ($24/month)
- Managed MySQL ($15/month)
- Spaces for file storage ($5/month)
- .rw domain ($20/year)
- **Total: $44/month**

**Why:**
✅ Affordable for schools
✅ Easy to manage
✅ Reliable performance
✅ Good for Rwanda location
✅ Room to scale
✅ Great support

**Deploy in 30 minutes with our automated script!**

---

**Need help deploying? Contact your development team!**
