#!/bin/bash

# Garden TVET School Management System - DigitalOcean Deployment Script
# Run this on a fresh Ubuntu 22.04 droplet

set -e

echo "=========================================="
echo "🚀 Garden TVET Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${GREEN}[1/10] Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/10] Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version

echo -e "${GREEN}[3/10] Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}[4/10] Installing Nginx...${NC}"
apt install -y nginx
systemctl enable nginx
systemctl start nginx

echo -e "${GREEN}[5/10] Installing MySQL...${NC}"
apt install -y mysql-server
systemctl enable mysql
systemctl start mysql

echo -e "${GREEN}[6/10] Securing MySQL...${NC}"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'TempPassword123!';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}[7/10] Creating database...${NC}"
read -p "Enter database name [school_management]: " DB_NAME
DB_NAME=${DB_NAME:-school_management}

read -p "Enter database user [school_user]: " DB_USER
DB_USER=${DB_USER:-school_user}

read -sp "Enter database password: " DB_PASS
echo ""

mysql -u root -pTempPassword123! <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}[8/10] Setting up application directory...${NC}"
mkdir -p /var/www/garden-tvet
cd /var/www/garden-tvet

echo -e "${YELLOW}Do you want to clone from Git? (y/n)${NC}"
read -p "> " CLONE_GIT

if [ "$CLONE_GIT" = "y" ]; then
  read -p "Enter Git repository URL: " GIT_URL
  git clone $GIT_URL .
else
  echo -e "${YELLOW}Please upload your files to /var/www/garden-tvet${NC}"
  echo "Press Enter when ready..."
  read
fi

echo -e "${GREEN}[9/10] Configuring backend...${NC}"
cd /var/www/garden-tvet/backend

# Create .env file
cat > .env <<EOF
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME
DB_PORT=3306
JWT_SECRET=$(openssl rand -base64 32)
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username
EOF

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install --production

echo -e "${YELLOW}Running database migrations...${NC}"
if [ -f "migrations/parent_system_fixed.sql" ]; then
  mysql -u $DB_USER -p$DB_PASS $DB_NAME < migrations/parent_system_fixed.sql
fi

echo -e "${YELLOW}Starting backend with PM2...${NC}"
pm2 start server.js --name garden-backend
pm2 save
pm2 startup

echo -e "${GREEN}[10/10] Configuring Nginx...${NC}"
read -p "Enter your domain name (or press Enter to use IP): " DOMAIN
DOMAIN=${DOMAIN:-$(curl -s ifconfig.me)}

cat > /etc/nginx/sites-available/garden-tvet <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 50M;

    # Frontend
    location / {
        root /var/www/html/garden-tvet;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    # Uploads
    location /uploads {
        alias /var/www/garden-tvet/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/garden-tvet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo -e "${GREEN}Building frontend...${NC}"
cd /var/www/garden-tvet
npm install
npm run build
mkdir -p /var/www/html/garden-tvet
cp -r dist/* /var/www/html/garden-tvet/

echo -e "${GREEN}Setting up firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable

echo -e "${GREEN}Creating backup script...${NC}"
cat > /root/backup.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/garden-tvet/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup.sh") | crontab -

echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "📊 System Information:"
echo "  - Backend: http://$DOMAIN/api/health"
echo "  - Frontend: http://$DOMAIN"
echo "  - Database: $DB_NAME"
echo ""
echo "🔐 Next Steps:"
echo "  1. Update Africa's Talking credentials in /var/www/garden-tvet/backend/.env"
echo "  2. Setup SSL: certbot --nginx -d $DOMAIN"
echo "  3. Test the application"
echo ""
echo "📝 Useful Commands:"
echo "  - View backend logs: pm2 logs garden-backend"
echo "  - Restart backend: pm2 restart garden-backend"
echo "  - View Nginx logs: tail -f /var/log/nginx/access.log"
echo "  - Run backup: /root/backup.sh"
echo ""
echo "🎉 Your school management system is now live!"
echo "=========================================="
