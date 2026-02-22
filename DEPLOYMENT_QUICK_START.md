# ☁️ CLOUD DEPLOYMENT - QUICK GUIDE

## 🎯 BEST OPTION: DigitalOcean ($44/month)

### One-Command Deployment:
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Run deployment script
wget https://raw.githubusercontent.com/your-repo/deploy-digitalocean.sh
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

**Done in 10 minutes!** ✅

---

## 🚀 ALL DEPLOYMENT OPTIONS

### 1. DigitalOcean (Recommended) - $44/month
```bash
# Create 4GB droplet
# Run: ./deploy-digitalocean.sh
# Visit: http://your-ip
```

### 2. Heroku (Easiest) - $35/month
```bash
heroku create garden-tvet
heroku addons:create jawsdb:kitefin
git push heroku main
```

### 3. AWS (Most Powerful) - $71/month
```bash
# Launch EC2 t3.medium
# Create RDS MySQL
# Deploy with Elastic Beanstalk
```

### 4. Render (Simplest) - $14/month
```bash
# Connect GitHub repo
# Click "Deploy"
# Done!
```

### 5. Railway (Modern) - $20/month
```bash
railway login
railway init
railway up
```

---

## 💰 COST COMPARISON

| Provider | Monthly | Setup Time | Difficulty |
|----------|---------|------------|------------|
| **DigitalOcean** | $44 | 10 min | Easy |
| **Heroku** | $35 | 5 min | Very Easy |
| **AWS** | $71 | 30 min | Medium |
| **Render** | $14 | 5 min | Very Easy |
| **Railway** | $20 | 5 min | Easy |

---

## 🏆 RECOMMENDATION FOR RWANDA

**Use DigitalOcean Frankfurt datacenter**

**Why:**
- ✅ Closest to Rwanda (low latency)
- ✅ Affordable pricing
- ✅ Easy to manage
- ✅ Reliable uptime
- ✅ Good support

**Setup:**
1. Create account: digitalocean.com
2. Create droplet (4GB, Frankfurt)
3. Run deployment script
4. Point domain to droplet IP
5. Setup SSL with certbot

**Total time: 15 minutes**
**Total cost: $44/month**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Domain name purchased (.rw or .com)
- [ ] Africa's Talking account created
- [ ] SMS API credentials ready
- [ ] Database backup downloaded
- [ ] Environment variables prepared
- [ ] SSL certificate plan (Let's Encrypt free)

---

## 🔒 SECURITY SETUP

```bash
# After deployment, run:
certbot --nginx -d yourdomain.com
ufw enable
ufw allow 'Nginx Full'
ufw allow OpenSSH
```

---

## 📊 MONITORING

```bash
# Check backend status
pm2 status

# View logs
pm2 logs garden-backend

# Monitor resources
htop
```

---

## 🎉 QUICK START

**For DigitalOcean (Recommended):**

1. **Create Droplet** (2 minutes)
   - Go to digitalocean.com
   - Create → Droplets
   - Ubuntu 22.04, 4GB RAM, Frankfurt
   - Add SSH key

2. **Deploy** (10 minutes)
   ```bash
   ssh root@your-ip
   wget https://raw.githubusercontent.com/your-repo/deploy-digitalocean.sh
   chmod +x deploy-digitalocean.sh
   ./deploy-digitalocean.sh
   ```

3. **Configure** (3 minutes)
   - Update SMS credentials
   - Point domain to IP
   - Setup SSL

4. **Done!** 🎉
   - Visit: https://yourdomain.com
   - Login and test

---

## 📞 SUPPORT

**Need help deploying?**
- Email: support@gardentvet.rw
- Phone: +250 XXX XXX XXX
- Docs: /CLOUD_HOSTING_GUIDE.md

---

**Your school management system will be live in 15 minutes!** 🚀
