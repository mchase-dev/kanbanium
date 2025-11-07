# Kanbanium Deployment Guide

This guide covers deploying Kanbanium in various environments, from local development to production cloud deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Database Management](#database-management)
6. [Cloud Deployment Guides](#cloud-deployment-guides)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Any recent version

### Optional (for manual deployment)

- **.NET SDK**: 8.0
- **Node.js**: 20.x
- **PostgreSQL**: 16+ (or SQLite for development)

---

## Quick Start with Docker

Get Kanbanium running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/mchase-dev/kanbanium.git
cd kanbanium

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env and set your JWT_KEY and other configurations

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5124
# API Docs (Swagger): http://localhost:5124/swagger
```

Default login credentials:
- **Email**: `superuser@example.com`
- **Password**: `Superuser123!`

> **Security Warning**: Change the default superuser password immediately after first login!

---

## Local Development Setup

For active development with hot reload:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Use development docker-compose configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 3. Backend will run with dotnet watch (auto-reload on code changes)
# 4. Frontend will run on Vite dev server (hot module replacement)
```

### Running Without Docker (Manual Setup)

#### Backend

```bash
cd backend

# Restore dependencies
dotnet restore

# Update database
dotnet ef database update

# Run application
dotnet run
# or with hot reload:
dotnet watch run
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Production Deployment

### Server Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- OS: Ubuntu 22.04 LTS (recommended)

**Recommended**:
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- OS: Ubuntu 22.04 LTS

### Step 1: Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group (optional, allows non-root docker)
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/mchase-dev/kanbanium.git
cd kanbanium

# Copy and edit environment file
cp .env.example .env
nano .env
```

**Important environment variables for production**:

```bash
# Database
DATABASE_PROVIDER=PostgreSQL
POSTGRES_DB=kanbanium
POSTGRES_USER=kanbanium
POSTGRES_PASSWORD=<strong-random-password>

# Backend
ASPNETCORE_ENVIRONMENT=Production
JWT_KEY=<generate-secure-32-char-key>
CORS_ALLOWED_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com/api
```

**Generate secure JWT key**:
```bash
openssl rand -base64 32
```

### Step 3: Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 4: Setup Reverse Proxy (nginx)

Install nginx for SSL termination and reverse proxy:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create nginx configuration (`/etc/nginx/sites-available/kanbanium`):

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5124;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SignalR WebSocket support
    location /hubs/ {
        proxy_pass http://localhost:5124;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable site and obtain SSL certificates:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kanbanium /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificates (Let's Encrypt)
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### Step 5: Setup Automatic Startup

Create systemd service (`/etc/systemd/system/kanbanium.service`):

```ini
[Unit]
Description=Kanbanium Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/kanbanium
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kanbanium
sudo systemctl start kanbanium
```

---

## Database Management

### Backup Database

```bash
# PostgreSQL backup
docker-compose exec db pg_dump -U kanbanium kanbanium > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using pg_dump from host (if installed)
pg_dump -h localhost -U kanbanium -d kanbanium -f backup.sql
```

### Restore Database

```bash
# Stop backend service
docker-compose stop backend

# Restore from backup
docker-compose exec -T db psql -U kanbanium -d kanbanium < backup.sql

# Restart backend
docker-compose start backend
```

### Run Migrations Manually

```bash
# Using the migration script
chmod +x scripts/migrate.sh
./scripts/migrate.sh

# Or directly with dotnet ef
cd backend
dotnet ef database update
```

### Database Migration Rollback

```bash
cd backend

# List migrations
dotnet ef migrations list

# Rollback to specific migration
dotnet ef database update <PreviousMigrationName>
```

---

## Cloud Deployment Guides

### AWS Deployment

#### Option 1: ECS + RDS

1. **Create RDS PostgreSQL Instance**
   - Database: PostgreSQL 16
   - Instance: db.t3.micro (or larger)
   - Enable automatic backups

2. **Push Docker Images to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag kanbanium-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/kanbanium-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/kanbanium-backend:latest
   ```

3. **Create ECS Task Definitions**
   - Backend: Use environment variables from Secrets Manager
   - Frontend: Point VITE_API_URL to ALB endpoint

4. **Create Application Load Balancer**
   - Target groups for backend (5124) and frontend (80)
   - SSL certificate from ACM

#### Option 2: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker kanbanium

# Create environment
eb create production

# Deploy
eb deploy
```

### Azure Deployment

#### Azure Container Apps + Azure SQL

1. **Create Resource Group**
   ```bash
   az group create --name kanbanium-rg --location eastus
   ```

2. **Create Azure SQL Database**
   ```bash
   az sql server create --name kanbanium-sql --resource-group kanbanium-rg --location eastus --admin-user adminuser --admin-password <strong-password>
   az sql db create --resource-group kanbanium-rg --server kanbanium-sql --name kanbanium --service-objective S0
   ```

3. **Create Container Apps Environment**
   ```bash
   az containerapp env create --name kanbanium-env --resource-group kanbanium-rg --location eastus
   ```

4. **Deploy Containers**
   ```bash
   az containerapp create --name kanbanium-backend --resource-group kanbanium-rg --environment kanbanium-env --image <your-registry>/kanbanium-backend:latest --target-port 5124 --ingress external
   ```

### DigitalOcean Deployment

#### App Platform

1. **Connect GitHub Repository**
   - Go to App Platform in DigitalOcean dashboard
   - Connect your GitHub repository

2. **Configure Build**
   - Backend: Dockerfile detected automatically
   - Frontend: Dockerfile detected automatically

3. **Add Database**
   - Choose Managed PostgreSQL
   - Connect to backend via environment variables

4. **Configure Environment Variables**
   - Add all variables from .env.example
   - Use DigitalOcean's secret management

---

## Monitoring and Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

Check service health:

```bash
# Backend health
curl http://localhost:5124/health

# Frontend health
curl http://localhost:3000/health
```

### Performance Monitoring

Consider adding:
- **Application Insights** (Azure)
- **CloudWatch** (AWS)
- **Datadog**
- **New Relic**
- **Sentry** (error tracking)

---

## Security Checklist

- [ ] Change default superuser password
- [ ] Use strong, unique JWT_KEY (32+ characters)
- [ ] Use strong database passwords
- [ ] Enable HTTPS (SSL/TLS) with valid certificates
- [ ] Configure firewall (ufw or cloud security groups)
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Enable database backups
- [ ] Configure CORS allowed origins properly
- [ ] Use environment variables for secrets (never commit .env)
- [ ] Enable rate limiting on API endpoints
- [ ] Regular vulnerability scans

---

## Troubleshooting

### Common Issues

#### 1. Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait for db health check
# - Missing JWT_KEY: Set in .env file
# - Port conflict: Change BACKEND_PORT in .env
```

#### 2. Frontend can't connect to backend
```bash
# Verify VITE_API_URL is correct
docker-compose exec frontend env | grep VITE_API_URL

# Rebuild frontend with correct API URL
docker-compose up -d --build frontend
```

#### 3. Database migration errors
```bash
# Manually run migrations
./scripts/migrate.sh

# Or inside container
docker-compose exec backend dotnet ef database update
```

#### 4. Permission denied errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Make scripts executable
chmod +x scripts/*.sh
chmod +x backend/entrypoint.sh
```

### Log Locations

- **Backend logs**: `backend/logs/kanbanium-{date}.log`
- **Docker logs**: `docker-compose logs`
- **nginx logs** (if using): `/var/log/nginx/`

---

## Updating the Application

### Pull Latest Changes

```bash
# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose up -d --build

# Run any new migrations
./scripts/migrate.sh
```

### Zero-Downtime Deployment

For production environments, consider using:
- **Blue-Green Deployment**
- **Rolling Updates** (Kubernetes/Docker Swarm)
- **Load Balancer** with multiple instances

---

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes:

```bash
# Docker Swarm example
docker swarm init
docker stack deploy -c docker-compose.yml kanbanium
docker service scale kanbanium_backend=3
```

### Database Scaling

- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Built into EF Core
- **Caching**: Consider Redis for session/cache

---

## Backup and Disaster Recovery

### Automated Backups

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/kanbanium && docker-compose exec -T db pg_dump -U kanbanium kanbanium > backups/backup_$(date +\%Y\%m\%d).sql
```

### Disaster Recovery Plan

1. **Regular backups** (daily recommended)
2. **Off-site storage** (S3, Azure Blob, etc.)
3. **Test restores** monthly
4. **Document recovery procedures**
5. **Monitor backup success**
