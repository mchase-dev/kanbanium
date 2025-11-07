# Kanbanium Docker Documentation

This document provides detailed information about the Docker configuration for Kanbanium, including Dockerfile structure, image optimization, and best practices.

## Table of Contents

1. [Dockerfile Overview](#dockerfile-overview)
2. [Multi-Stage Build Benefits](#multi-stage-build-benefits)
3. [Image Optimization](#image-optimization)
4. [Docker Compose Configuration](#docker-compose-configuration)
5. [Networking](#networking)
6. [Volume Management](#volume-management)
7. [Security Best Practices](#security-best-practices)
8. [Performance Tuning](#performance-tuning)
9. [Troubleshooting](#troubleshooting)

---

## Dockerfile Overview

### Backend Dockerfile

The backend uses a **4-stage multi-stage build**:

#### Stage 1: Base Runtime Image
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5124 7138
RUN mkdir -p /app/logs && chmod 777 /app/logs
```

- Uses official ASP.NET Core runtime (smaller than SDK)
- Exposes HTTP (5124) and HTTPS (7138) ports
- Creates logs directory with write permissions

#### Stage 2: Build Image
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Kanbanium.csproj", "./"]
RUN dotnet restore "Kanbanium.csproj"
COPY . .
RUN dotnet build "Kanbanium.csproj" -c Release -o /app/build
```

- Uses SDK image for building (includes compiler, tools)
- Copies `.csproj` first for layer caching (dependencies rarely change)
- Restores NuGet packages separately
- Builds in Release configuration

#### Stage 3: Publish
```dockerfile
FROM build AS publish
RUN dotnet publish "Kanbanium.csproj" -c Release -o /app/publish /p:UseAppHost=false
```

- Publishes application to `/app/publish`
- `UseAppHost=false` creates a framework-dependent deployment (smaller size)

#### Stage 4: Final Runtime
```dockerfile
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5124
ENTRYPOINT ["/app/entrypoint.sh"]
```

- Copies only published artifacts (not source code or intermediate build files)
- Uses entrypoint script for database migration
- Sets production environment

**Why Multi-Stage?**
- Final image is ~210 MB (vs ~1.2 GB with SDK included)
- No source code or build tools in production image
- Better security and performance

### Frontend Dockerfile

The frontend uses a **2-stage multi-stage build**:

#### Stage 1: Build Stage
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
ARG VITE_API_URL=http://localhost:5124/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
```

- Uses Alpine variant (much smaller base image)
- `npm ci` for reproducible installs (uses package-lock.json)
- Build argument allows runtime API URL configuration
- Builds optimized production bundle

#### Stage 2: Nginx Serve
```dockerfile
FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

- Uses nginx Alpine for serving static files
- Copies custom nginx config for SPA routing
- Only includes built assets (no node_modules, source code)
- Includes health check
- Final image is ~50 MB

**Why Multi-Stage?**
- Final image is ~50 MB (vs ~1 GB with Node.js included)
- Production server (nginx) separate from build tools
- Better performance serving static files

---

## Multi-Stage Build Benefits

### 1. **Smaller Image Sizes**

| Service  | Single-Stage | Multi-Stage | Reduction |
|----------|--------------|-------------|-----------|
| Backend  | ~1.2 GB      | ~210 MB     | **82%**   |
| Frontend | ~1.0 GB      | ~50 MB      | **95%**   |

### 2. **Improved Security**

- No build tools or compilers in production images
- Reduced attack surface
- No source code in final image
- Only runtime dependencies included

### 3. **Faster Deployments**

- Smaller images transfer faster over network
- Quicker container startup times
- More efficient use of registry storage

### 4. **Layer Caching**

- Package restoration cached separately from source code
- Rebuilds only changed layers
- Dramatically faster rebuild times

**Example Build Time Improvement**:
```
First build:        ~5 minutes
Code change rebuild: ~30 seconds (with cache)
```

---

## Image Optimization

### Best Practices Implemented

#### 1. **Use Alpine Base Images**
```dockerfile
FROM node:20-alpine  # vs node:20
FROM nginx:alpine    # vs nginx:latest
```
**Benefit**: 5-10x smaller base images

#### 2. **Layer Ordering**
```dockerfile
# ✅ Good: Dependencies first (cached)
COPY package*.json ./
RUN npm ci
COPY . .  # Changes frequently

# ❌ Bad: Everything together
COPY . .
RUN npm ci
```

#### 3. **.dockerignore Files**
Prevent unnecessary files from being copied:
```
node_modules/
.git/
*.md
```
**Benefit**: Faster builds, smaller context

#### 4. **Multi-Stage Builds**
Only copy artifacts needed in production

#### 5. **Minimize Layers**
```dockerfile
# ✅ Good: Single RUN command
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    rm -rf /var/lib/apt/lists/*

# ❌ Bad: Multiple RUN commands
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
```

---

## Docker Compose Configuration

### Services

#### Database Service
```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready"]
```

**Key Features**:
- Uses official PostgreSQL Alpine image
- Environment variables from .env file
- Named volume for data persistence
- Health check for dependency ordering

#### Backend Service
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  depends_on:
    db:
      condition: service_healthy
  environment:
    - ConnectionStrings__DefaultConnection=...
    - Jwt__Key=${JWT_KEY}
```

**Key Features**:
- Builds from local Dockerfile
- Waits for database health check
- Environment variable injection
- Volume mount for logs

#### Frontend Service
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      VITE_API_URL: ${VITE_API_URL}
  depends_on:
    - backend
```

**Key Features**:
- Build-time arguments for API URL
- Depends on backend availability
- Port mapping to host

### Development Override

`docker-compose.dev.yml` provides development-specific configuration:

- **Hot Reload**: Mounts source code as volumes
- **SQLite**: Removes PostgreSQL dependency
- **Dev Servers**: Uses `dotnet watch` and `vite dev`
- **Exposed Ports**: All ports accessible for debugging

**Usage**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## Networking

### Bridge Network

Kanbanium uses a custom bridge network (`kanbanium-network`) for service communication.

**Benefits**:
- Services can communicate by name (DNS resolution)
- Isolation from other Docker networks
- Controlled network access

**Service Discovery**:
```javascript
// Frontend connects to backend by service name
const API_URL = 'http://backend:5124/api';

// Backend connects to database by service name
ConnectionString = "Host=db;Port=5432;...";
```

### Port Mapping

| Service  | Container Port | Host Port   | Protocol |
|----------|----------------|-------------|----------|
| Frontend | 80             | 3000        | HTTP     |
| Backend  | 5124           | 5124        | HTTP     |
| Backend  | 7138           | 7138        | HTTPS    |
| Database | 5432           | 5432        | TCP      |

**External Access**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5124`
- Swagger Docs: `http://localhost:5124/swagger`

---

## Volume Management

### Named Volumes

#### PostgreSQL Data
```yaml
volumes:
  postgres_data:
    driver: local
```

**Location**: `/var/lib/docker/volumes/kanbanium_postgres_data`

**Persistence**: Data survives container recreation

**Backup**:
```bash
docker run --rm -v kanbanium_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

#### Backend Logs
```yaml
volumes:
  backend_logs:
    driver: local
```

**Location**: `/var/lib/docker/volumes/kanbanium_backend_logs`

**Access Logs**:
```bash
docker volume inspect kanbanium_backend_logs
```

### Bind Mounts (Development)

Development mode mounts source code:
```yaml
volumes:
  - ./backend:/src:ro  # Read-only source mount
  - ./frontend:/app:ro
```

**Benefits**:
- Code changes reflected immediately
- No need to rebuild for every change

---

## Security Best Practices

### 1. **Non-Root User**

Consider adding non-root user in Dockerfile:
```dockerfile
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
USER appuser
```

### 2. **Secrets Management**

- ✅ Use environment variables for secrets
- ✅ Use Docker secrets (Swarm mode)
- ✅ Use external secret managers (AWS Secrets Manager, Azure Key Vault)
- ❌ Never hardcode secrets in Dockerfile
- ❌ Never commit .env files

### 3. **Image Scanning**

```bash
# Scan images for vulnerabilities
docker scout cves kanbanium-backend:latest
```

### 4. **Network Isolation**

- Services only expose necessary ports
- Database not exposed to host in production
- Use reverse proxy for SSL termination

### 5. **Read-Only Containers**

```yaml
backend:
  read_only: true
  tmpfs:
    - /tmp
    - /app/logs
```

### 6. **Resource Limits**

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

---

## Performance Tuning

### 1. **Build Cache Optimization**

Use BuildKit for better caching:
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 2. **Parallel Builds**

Build services in parallel:
```bash
docker-compose build --parallel
```

### 3. **Layer Caching**

- Order Dockerfile commands from least to most frequently changing
- Use specific COPY commands rather than COPY everything

### 4. **Health Checks**

Properly configure health checks for faster service readiness:
```yaml
healthcheck:
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s  # Allow time for startup
```

### 5. **Resource Allocation**

Adjust Docker Desktop resources:
- CPUs: 4+ cores recommended
- Memory: 8 GB+ recommended
- Swap: 1 GB
- Disk: 50 GB+

---

## Troubleshooting

### Common Issues

#### 1. **Build Fails with "Cannot find module"**

**Cause**: node_modules in build context

**Solution**:
```bash
# Add to .dockerignore
node_modules/

# Rebuild
docker-compose build --no-cache frontend
```

#### 2. **Backend Can't Connect to Database**

**Cause**: Database not ready yet

**Solution**: Check health checks
```bash
docker-compose ps
# Wait for db status to show "healthy"
```

#### 3. **Permission Denied on Volumes**

**Cause**: Volume ownership issues

**Solution**:
```bash
# Fix permissions
docker-compose exec backend chown -R app:app /app/logs
```

#### 4. **Out of Disk Space**

**Cause**: Old images and volumes accumulating

**Solution**:
```bash
# Clean up
docker system prune -a --volumes

# Check disk usage
docker system df
```

#### 5. **Port Already in Use**

**Cause**: Port conflict with existing service

**Solution**:
```bash
# Change port in .env file
BACKEND_PORT=5125
FRONTEND_PORT=3001

# Restart
docker-compose up -d
```

### Debugging Commands

```bash
# View logs
docker-compose logs -f backend

# Shell into container
docker-compose exec backend /bin/bash

# Inspect container
docker inspect kanbanium-backend

# Check networks
docker network ls
docker network inspect kanbanium_kanbanium-network

# Check volumes
docker volume ls
docker volume inspect kanbanium_postgres_data

# Resource usage
docker stats

# Events
docker events --filter 'container=kanbanium-backend'
```

---

## Advanced Topics

### Docker Swarm Deployment

Initialize swarm and deploy stack:
```bash
docker swarm init
docker stack deploy -c docker-compose.yml kanbanium
docker service scale kanbanium_backend=3
```

### Registry and Image Management

Push to private registry:
```bash
# Tag image
docker tag kanbanium-backend:latest registry.example.com/kanbanium-backend:latest

# Push
docker push registry.example.com/kanbanium-backend:latest
```

### CI/CD Integration

See `.github/workflows/ci.yml` for automated:
- Building images
- Running tests
- Pushing to registry
- Deploying to production

