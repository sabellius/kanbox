# Deployment Guide

> Production deployment instructions for Kanbox

This guide covers deploying Kanbox to production environments. Choose the deployment strategy that best fits your needs and budget.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Hosting](#database-hosting)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you've completed these steps:

### Security

- [ ] Changed `JWT_SECRET` to a cryptographically random 64+ character string
- [ ] Set strong MongoDB password (not default "password")
- [ ] Verified `.env` file is in `.gitignore` (never commit credentials!)
- [ ] Enabled HTTPS/SSL for production domain
- [ ] Configured CORS to allow only your production frontend URL
- [ ] Reviewed and removed all `console.log()` statements with sensitive data
- [ ] Set `NODE_ENV=production` in backend environment

### Code Quality

- [ ] All tests passing (if tests are implemented)
- [ ] ESLint shows no errors: `npm run lint`
- [ ] Code formatted with Prettier: `npm run format`
- [ ] Removed debug code and commented-out sections
- [ ] Updated dependencies: `npm update` and `npm audit fix`

### Database

- [ ] Ran all migrations: `npm run migrate:up`
- [ ] Created database backup
- [ ] Verified indexes are created
- [ ] Tested database connection string

### Application

- [ ] Built frontend: `npm run build` in frontend directory
- [ ] Tested production build locally
- [ ] Verified all environment variables are set
- [ ] Updated API base URL in frontend (if needed)
- [ ] Tested file uploads with production Cloudinary account

### Documentation

- [ ] Updated README.md with live demo link
- [ ] Added deployment status badges
- [ ] Documented any production-specific setup steps
- [ ] Created CHANGELOG.md for version tracking

---

## Environment Setup

### Production Environment Variables

**Backend (`.env`):**

```bash
# Production configuration
NODE_ENV="production"
PORT=3000

# Generate a new strong secret for production!
# Command: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="[YOUR_128_CHARACTER_PRODUCTION_SECRET_HERE]"

# MongoDB Atlas connection string (recommended for production)
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kanbox_production?retryWrites=true&w=majority"

# Production frontend URL
CORS_ORIGIN="https://your-app-domain.com"

# Cloudinary (same credentials, but consider separate account for production)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLOUDINARY_FOLDER="production/kanbox"
```

**Frontend (`.env.production`):**

```bash
# Production Cloudinary cloud name
VITE_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"

# API URL (if frontend and backend are on different domains)
# VITE_API_URL="https://api.your-domain.com/api"
```

---

## Database Hosting

### Option 1: MongoDB Atlas (Recommended)

**Pros:** Managed service, automatic backups, scalable, free tier available
**Cons:** Network latency if not in same region as backend

#### Setup Steps:

1. **Create MongoDB Atlas Account**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Choose free M0 tier (512MB storage) or paid tier for production

2. **Create Cluster**
   - Select cloud provider (AWS/GCP/Azure)
   - Choose region closest to your backend servers
   - Cluster name: `kanbox-production`

3. **Configure Network Access**
   - Whitelist your backend server IP address
   - Or allow access from anywhere: `0.0.0.0/0` (less secure)

4. **Create Database User**
   - Database Access → Add New Database User
   - Username: `kanbox-api`
   - Password: Generate strong password
   - Permissions: Read and write to any database

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy MongoDB URI
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `kanbox_production`

**Example Connection String:**

```
mongodb+srv://kanbox-api:YOUR_PASSWORD@cluster0.abc123.mongodb.net/kanbox_production?retryWrites=true&w=majority
```

6. **Test Connection**
   ```bash
   # Update backend/.env with new MONGODB_URI
   cd backend
   npm start
   # Should connect successfully
   ```

### Option 2: Self-Hosted MongoDB

**Pros:** Full control, no monthly fees
**Cons:** Requires server management, manual backups, scaling complexity

#### Setup with Docker on VPS:

```bash
# On your production server
docker run -d \
  --name mongodb-production \
  -p 27017:27017 \
  -v /data/mongodb:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=YOUR_STRONG_PASSWORD \
  --restart unless-stopped \
  mongo:7

# Connection string:
# mongodb://admin:YOUR_STRONG_PASSWORD@YOUR_SERVER_IP:27017/kanbox_production?authSource=admin
```

**Security Considerations:**

- Configure firewall to only allow backend server IP
- Use strong password
- Enable MongoDB authentication
- Regularly backup database

---

## Deployment Options

### Option 1: Render (Easiest for Full-Stack)

**Pricing:** Free tier available, $7/month for paid tier
**Pros:** Easy setup, automatic HTTPS, continuous deployment from GitHub
**Cons:** Free tier has cold starts (slow first request after inactivity)

#### Backend Deployment:

1. **Create Render Account**
   - Sign up at https://render.com
   - Connect GitHub account

2. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Select branch: `main`
   - Name: `kanbox-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run migrate:up`
   - Start Command: `cd backend && npm start`
   - Plan: Free or Starter ($7/month)

3. **Configure Environment Variables**
   - In service settings → Environment
   - Add all variables from backend `.env`
   - Especially: `NODE_ENV`, `JWT_SECRET`, `MONGODB_URI`, `CORS_ORIGIN`

4. **Add Custom Domain (Optional)**
   - Settings → Custom Domain
   - Add domain: `api.your-domain.com`
   - Update DNS CNAME record

#### Frontend Deployment:

1. **Build Frontend**

   ```bash
   cd frontend
   npm run build
   # Output in: dist/
   ```

2. **Copy Build to Backend Public Folder**

   ```bash
   cp -r frontend/dist/* backend/public/
   ```

3. **Commit and Push**
   - Render will automatically rebuild and deploy
   - Backend will serve frontend at root URL

**Alternative: Separate Frontend Service**

1. **Create Static Site on Render**
   - New → Static Site
   - Connect repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Update CORS**
   - Update backend `CORS_ORIGIN` to frontend URL

### Option 2: Railway

**Pricing:** $5/month for 500 hours, then usage-based
**Pros:** Simple setup, great DX, includes database hosting
**Cons:** More expensive than competitors at scale

#### Deployment Steps:

1. **Create Railway Account**
   - Sign up at https://railway.app
   - Connect GitHub

2. **Create New Project**
   - New Project → Deploy from GitHub repo
   - Select repository

3. **Add MongoDB Service**
   - Add service → Database → MongoDB
   - Railway provides connection string automatically
   - Copy to backend environment variables

4. **Configure Backend**
   - Select backend service
   - Settings → Environment Variables
   - Add all production variables

5. **Enable Custom Domain**
   - Settings → Networking → Generate Domain
   - Or add custom domain

### Option 3: DigitalOcean App Platform

**Pricing:** $12/month for basic tier
**Pros:** Managed databases included, good performance
**Cons:** Less generous free tier than competitors

#### Deployment Steps:

1. **Create App**
   - DigitalOcean dashboard → Apps → Create App
   - Connect GitHub repository

2. **Configure App**
   - Type: Web Service
   - Build Command: `cd backend && npm install`
   - Run Command: `cd backend && npm start`
   - HTTP Port: `3000`

3. **Add Database**
   - Resources → Add Resource → Database
   - MongoDB managed database
   - Connection details in environment

4. **Environment Variables**
   - Settings → Environment Variables
   - Add all production variables

### Option 4: Vercel (Frontend) + Railway (Backend)

**Best for:** Separating frontend and backend deployments
**Pros:** Vercel excellent for frontend, Railway easy for backend
**Cons:** Managing two services

#### Frontend on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts, select project settings
# Vercel will build and deploy automatically

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
# Add: VITE_CLOUDINARY_CLOUD_NAME, VITE_API_URL
```

#### Backend on Railway:

Follow Railway steps from Option 2.

#### Update CORS:

```bash
# Backend .env on Railway
CORS_ORIGIN="https://your-app.vercel.app"
```

---

## Post-Deployment Configuration

### 1. Run Database Migrations

```bash
# SSH into production server or use Render/Railway shell
cd backend
npm run migrate:up

# Verify migrations
npm run migrate:executed
```

### 2. Verify Health Endpoint

```bash
# Test backend health
curl https://your-backend-url.com/health

# Expected response:
# {"status":"OK","timestamp":"2026-01-24T12:00:00.000Z"}
```

### 3. Test API Endpoints

```bash
# Create test user
curl -X POST https://your-backend-url.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "fullName": "Test User"
  }'

# Login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Get boards (authenticated)
curl https://your-backend-url.com/api/boards \
  -b cookies.txt
```

### 4. Configure Custom Domain

**Example with Render:**

1. Add custom domain in Render dashboard
2. Update DNS records with your domain registrar:
   ```
   Type: CNAME
   Name: api (or www for frontend)
   Value: your-app-name.onrender.com
   ```
3. Wait for DNS propagation (5 minutes - 48 hours)
4. Render automatically provisions SSL certificate

### 5. Update Frontend URLs

```bash
# If using separate frontend deployment
# Update frontend/.env.production
VITE_API_URL="https://api.your-domain.com/api"

# Rebuild and redeploy frontend
npm run build
```

### 6. Test File Uploads

1. Create board and card via UI
2. Upload image as card cover
3. Verify image displays correctly from Cloudinary CDN
4. Check Cloudinary dashboard for uploaded files

---

## Monitoring & Maintenance

### Application Monitoring

**Option 1: Built-in Platform Monitoring**

- Most platforms (Render, Railway) provide basic metrics
- CPU usage, memory, request count
- Available in platform dashboard

**Option 2: External Monitoring (Recommended)**

1. **UptimeRobot** (Free)
   - Monitor endpoint availability
   - Alert via email/SMS if down
   - Setup: https://uptimerobot.com
   - Monitor: `https://your-backend-url.com/health`

2. **Sentry** (Error Tracking)

   ```bash
   npm install @sentry/node
   ```

   ```javascript
   // backend/src/app.js
   import * as Sentry from "@sentry/node";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });

   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.errorHandler());
   ```

### Database Backups

**MongoDB Atlas:**

- Automatic backups enabled by default
- Backups retained for 2 days (free tier) or longer (paid)
- Restore from Backup page in Atlas dashboard

**Self-Hosted MongoDB:**

```bash
# Create backup
mongodump --uri="mongodb://admin:password@localhost:27017/kanbox_production?authSource=admin" --out=/backups/$(date +%Y%m%d)

# Automate with cron job
0 2 * * * /usr/bin/mongodump --uri="..." --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://..." /backups/20260124
```

### Logs

**Render:**

- View logs in dashboard → Logs tab
- Filter by severity (info, error)
- Download logs for analysis

**Railway:**

- Real-time logs in project dashboard
- Search and filter capabilities

**Custom Logging:**

```bash
npm install winston
```

```javascript
// backend/src/config/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console());
}

export default logger;
```

### Performance Monitoring

**Add Response Time Logging:**

```javascript
// backend/src/app.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

---

## Troubleshooting

### Deployment Fails

**Issue:** Build command fails

**Solutions:**

1. Check build logs for specific error
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `dependencies`, not `devDependencies`
4. Test build locally: `npm install --production && npm start`

**Issue:** "Module not found" errors

**Solutions:**

1. Check import paths use correct case (Linux is case-sensitive)
2. Verify all imports use file extensions: `.js`
3. Ensure dependencies are installed: `npm install`

### Database Connection Issues

**Issue:** "MongoNetworkError" or "MongoServerError"

**Solutions:**

1. Verify `MONGODB_URI` environment variable is set
2. Check MongoDB Atlas network whitelist includes backend IP
3. Test connection string locally
4. Ensure database user has correct permissions

**Issue:** "Authentication failed"

**Solutions:**

1. Verify username and password in connection string
2. Check `authSource=admin` is in connection string
3. Ensure database user exists in MongoDB Atlas

### CORS Errors

**Issue:** Frontend can't connect to backend API

**Solutions:**

1. Verify `CORS_ORIGIN` in backend matches exact frontend URL
2. Include trailing slash or not, but be consistent
3. Check axios/fetch includes `withCredentials: true`
4. Clear browser cache and cookies

### SSL/HTTPS Issues

**Issue:** "Mixed content" errors

**Solutions:**

1. Ensure all API requests use `https://` not `http://`
2. Cloudinary images should use `https://res.cloudinary.com`
3. Check for hardcoded `http://` URLs in code

### File Upload Fails

**Issue:** Cloudinary upload errors

**Solutions:**

1. Verify Cloudinary credentials are correct
2. Check API secret is set (backend only)
3. Ensure cloud name matches frontend and backend
4. Test upload directly in Cloudinary console

### Performance Issues

**Issue:** Slow response times

**Solutions:**

1. Check database indexes are created
2. Use `.lean()` for read-only queries
3. Implement caching (Redis)
4. Optimize N+1 queries with `.populate()`
5. Enable compression middleware

---

## Scaling Considerations

### Horizontal Scaling

**When to scale:**

- Response times > 500ms consistently
- CPU usage > 80%
- Memory usage > 90%

**How to scale:**

1. Add more backend instances (load balancing)
2. Use Redis for session storage
3. Implement Redis adapter for Socket.IO
4. Use CDN for static assets

### Database Optimization

```javascript
// Add indexes for common queries
boardSchema.index({ "members._id": 1 });
cardSchema.index({ listId: 1 });
cardSchema.index({ labels: 1 });

// Use aggregation for complex queries
const stats = await Board.aggregate([
  { $match: { "members._id": userId } },
  {
    $lookup: {
      from: "lists",
      localField: "_id",
      foreignField: "boardId",
      as: "lists",
    },
  },
  { $project: { title: 1, listCount: { $size: "$lists" } } },
]);
```

---

## Continuous Deployment

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Build frontend
        run: cd frontend && npm run build

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/deploy/...
```

---

## Security Checklist

- [ ] HTTPS enabled (automatic with Render/Vercel/Railway)
- [ ] Environment variables secured (not in code)
- [ ] Database connection encrypted (TLS)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS configured to specific origin
- [ ] HTTP-only cookies for JWT
- [ ] Strong JWT secret (128+ characters)
- [ ] Password hashing with bcrypt
- [ ] Regular dependency updates: `npm audit`
- [ ] Error messages don't expose stack traces
- [ ] MongoDB user has minimal required permissions

---

## Rollback Plan

If deployment introduces critical bugs:

1. **Identify issue** from logs and error reports
2. **Revert Git commit**
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Platform auto-redeploys** previous working version
4. **Verify fix** by testing endpoints
5. **Post-mortem** - document what went wrong

---

## Cost Estimates

### Free Tier Deployment

| Service           | Cost         | Limitations                                   |
| ----------------- | ------------ | --------------------------------------------- |
| Render (Backend)  | $0           | Cold starts after inactivity, 750 hours/month |
| Vercel (Frontend) | $0           | 100GB bandwidth/month, unlimited deployments  |
| MongoDB Atlas     | $0           | 512MB storage, shared CPU                     |
| Cloudinary        | $0           | 25GB storage, 25GB bandwidth/month            |
| **Total**         | **$0/month** | Good for demo/portfolio                       |

### Production Deployment

| Service             | Cost            | Features                        |
| ------------------- | --------------- | ------------------------------- |
| Render (Starter)    | $7/month        | Always on, 512MB RAM            |
| Vercel Pro          | $20/month       | Priority support, analytics     |
| MongoDB Atlas (M10) | $57/month       | 10GB storage, dedicated cluster |
| Cloudinary (Plus)   | $89/month       | 100GB storage, 100GB bandwidth  |
| **Total**           | **~$173/month** | Production-ready                |

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Vercel Deployment](https://vercel.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)

---

**Ready to deploy? Start with the free tier options and scale up as needed!**
