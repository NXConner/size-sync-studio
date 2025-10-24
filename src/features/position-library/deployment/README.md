# Position Library Deployment Guide

This guide covers deploying the Position Library application with all its features including achievements, personalization, position creator, analytics, community, and challenges.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx         │    │   API Server    │
│   (React)       │◄───┤   (Reverse      │◄───┤   (Node.js)     │
│   Port: 3000    │    │    Proxy)       │    │   Port: 3001    │
└─────────────────┘    │   Port: 80/443  │    └─────────────────┘
                       └─────────────────┘             │
                                                       │
                       ┌─────────────────┐             │
                       │   PostgreSQL    │◄────────────┘
                       │   Database      │
                       │   Port: 5432    │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Cache)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- SSL certificates (for production)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd size-sync-studio
```

### 2. Environment Configuration

```bash
# Copy environment template
cp src/features/position-library/deployment/env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup

```bash
# Start database services
docker-compose -f src/features/position-library/deployment/docker-compose.yml up -d postgres redis

# Wait for services to be ready
docker-compose -f src/features/position-library/deployment/docker-compose.yml logs postgres

# Run database migrations
npx prisma migrate deploy
```

### 4. Build and Deploy

```bash
# Build all services
docker-compose -f src/features/position-library/deployment/docker-compose.yml build

# Start all services
docker-compose -f src/features/position-library/deployment/docker-compose.yml up -d

# Check service status
docker-compose -f src/features/position-library/deployment/docker-compose.yml ps
```

### 5. Verify Deployment

```bash
# Check API health
curl http://localhost:3001/api/v1/health

# Check frontend
curl http://localhost:3000

# Check database connection
docker-compose -f src/features/position-library/deployment/docker-compose.yml exec postgres psql -U postgres -d position_library -c "SELECT COUNT(*) FROM achievements;"
```

## Production Deployment

### 1. SSL Configuration

```bash
# Generate SSL certificates (use Let's Encrypt for production)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem

# Update nginx.conf to enable HTTPS
```

### 2. Environment Variables

```bash
# Production environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://user:password@db-host:5432/position_library
export JWT_SECRET=your-super-secure-jwt-secret
export CORS_ORIGIN=https://your-domain.com
```

### 3. Database Security

```bash
# Create production database user
docker-compose exec postgres psql -U postgres -c "
CREATE USER position_library_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE position_library TO position_library_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO position_library_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO position_library_user;
"
```

### 4. Monitoring Setup

```bash
# Add monitoring services to docker-compose.yml
# - Prometheus for metrics
# - Grafana for dashboards
# - ELK stack for logging
```

## Kubernetes Deployment

### 1. Create Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: position-library
```

### 2. Deploy Database

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: position-library
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: position_library
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### 3. Deploy API Server

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: position-library
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: position-library-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Scaling Configuration

### Horizontal Scaling

```yaml
# API Server scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: position-library
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```yaml
# PostgreSQL read replicas
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-read-replica
  namespace: position-library
spec:
  replicas: 2
  selector:
    matchLabels:
      app: postgres-read-replica
  template:
    metadata:
      labels:
        app: postgres-read-replica
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: PGUSER
          value: postgres
        - name: PGPASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: PGHOST
          value: postgres
        command: ["postgres", "-c", "hot_standby=on"]
```

## Backup and Recovery

### 1. Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="position_library_$DATE.sql"

# Create backup
docker-compose exec postgres pg_dump -U postgres position_library > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove old backups (keep 30 days)
find "$BACKUP_DIR" -name "position_library_*.sql.gz" -mtime +30 -delete
```

### 2. Application Backup

```bash
# Backup user uploads and custom data
tar -czf "uploads_$DATE.tar.gz" ./uploads/
tar -czf "custom_data_$DATE.tar.gz" ./data/
```

### 3. Recovery Process

```bash
# Restore database
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS position_library;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE position_library;"
docker-compose exec -T postgres psql -U postgres position_library < backup_file.sql

# Restore application data
tar -xzf uploads_backup.tar.gz
tar -xzf custom_data_backup.tar.gz
```

## Monitoring and Logging

### 1. Health Checks

```bash
# API health check
curl -f http://localhost:3001/api/v1/health || exit 1

# Database health check
docker-compose exec postgres pg_isready -U postgres || exit 1

# Redis health check
docker-compose exec redis redis-cli ping || exit 1
```

### 2. Log Aggregation

```yaml
# Fluentd configuration for log collection
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: position-library
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*position-library*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name position-library
    </match>
```

### 3. Metrics Collection

```yaml
# Prometheus configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: position-library
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'position-library-api'
      static_configs:
      - targets: ['api-server:3001']
    - job_name: 'postgres'
      static_configs:
      - targets: ['postgres:5432']
```

## Security Considerations

### 1. Network Security

```yaml
# Network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: position-library-network-policy
  namespace: position-library
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: nginx-ingress
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: position-library
    ports:
    - protocol: TCP
      port: 5432
    - protocol: TCP
      port: 6379
```

### 2. Secret Management

```bash
# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=secure_password \
  --namespace=position-library

kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret \
  --namespace=position-library
```

### 3. RBAC Configuration

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: position-library
  name: position-library-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose exec postgres psql -U postgres -c "SELECT 1;"
   
   # Check database logs
   docker-compose logs postgres
   ```

2. **API Server Issues**
   ```bash
   # Check API logs
   docker-compose logs api
   
   # Test API endpoints
   curl -v http://localhost:3001/api/v1/health
   ```

3. **Frontend Issues**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Test frontend
   curl -v http://localhost:3000
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX CONCURRENTLY idx_sessions_user_created 
   ON sessions(user_id, created_at);
   
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM sessions WHERE user_id = 'user123';
   ```

2. **Caching Strategy**
   ```bash
   # Redis configuration for caching
   redis-cli CONFIG SET maxmemory 256mb
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

3. **CDN Configuration**
   ```yaml
   # CloudFlare or similar CDN configuration
   # Cache static assets for better performance
   ```

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```bash
   # Weekly database vacuum
   docker-compose exec postgres psql -U postgres -c "VACUUM ANALYZE;"
   
   # Monthly database reindex
   docker-compose exec postgres psql -U postgres -c "REINDEX DATABASE position_library;"
   ```

2. **Log Rotation**
   ```bash
   # Configure logrotate for application logs
   # /etc/logrotate.d/position-library
   /var/log/position-library/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 root root
   }
   ```

3. **Security Updates**
   ```bash
   # Update base images regularly
   docker-compose pull
   docker-compose up -d --force-recreate
   ```

## Support and Documentation

- **API Documentation**: Available at `/api/docs` when running
- **Health Monitoring**: `/api/v1/health`
- **Metrics**: Available at `/metrics` (if enabled)
- **Logs**: Check container logs for debugging

For additional support, refer to the main project documentation or create an issue in the repository.
