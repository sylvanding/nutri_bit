# 部署指南 - 福宝 (NutriBit)

## 🎯 部署概览

福宝项目采用现代化的云原生部署架构，支持多环境部署、自动扩缩容、高可用性和容灾备份。

### 部署环境
- **开发环境** (Development): 用于日常开发和功能测试
- **测试环境** (Testing): 用于集成测试和性能测试
- **预发布环境** (Staging): 用于发布前的最终验证
- **生产环境** (Production): 面向用户的正式环境

### 部署架构
```mermaid
graph TB
    subgraph "CDN层"
        A[CDN<br/>CloudFlare/阿里云CDN]
    end
    
    subgraph "负载均衡层"
        B[Application Load Balancer<br/>ALB/SLB]
    end
    
    subgraph "应用层"
        C[Kubernetes Cluster]
        D[前端服务<br/>React App]
        E[后端服务<br/>Node.js/Python]
        F[AI服务<br/>ML Models]
    end
    
    subgraph "数据层"
        G[(主数据库<br/>PostgreSQL)]
        H[(缓存层<br/>Redis Cluster)]
        I[(文件存储<br/>S3/OSS)]
    end
    
    subgraph "监控层"
        J[监控告警<br/>Prometheus+Grafana]
        K[日志收集<br/>ELK Stack]
        L[APM<br/>Jaeger/SkyWalking]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    E --> G
    E --> H
    D --> I
    
    C --> J
    C --> K
    C --> L
```

## 🚀 前端部署

### 构建流程
```bash
# 1. 安装依赖
npm ci --production=false

# 2. 运行测试
npm run test

# 3. 代码质量检查
npm run lint

# 4. 构建生产版本
npm run build

# 5. 构建优化检查
npm run build:analyze
```

### Nginx配置
```nginx
# /etc/nginx/sites-available/nutribit
server {
    listen 80;
    listen [::]:80;
    server_name nutribit.com www.nutribit.com;
    
    # HTTPS重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nutribit.com www.nutribit.com;
    
    # SSL证书配置
    ssl_certificate /etc/ssl/certs/nutribit.com.crt;
    ssl_certificate_key /etc/ssl/private/nutribit.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline'" always;
    
    # 根目录
    root /var/www/nutribit/dist;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://backend-service:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Docker化部署
```dockerfile
# Dockerfile.frontend
# 多阶段构建
FROM node:18-alpine as builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM nginx:alpine

# 复制构建文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 修改权限
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# 切换用户
USER nextjs

EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes部署清单
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nutribit-frontend
  namespace: nutribit
  labels:
    app: nutribit-frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: nutribit-frontend
  template:
    metadata:
      labels:
        app: nutribit-frontend
    spec:
      containers:
      - name: frontend
        image: nutribit/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nutribit-frontend-service
  namespace: nutribit
spec:
  selector:
    app: nutribit-frontend
  ports:
  - name: http
    port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nutribit-frontend-ingress
  namespace: nutribit
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - nutribit.com
    - www.nutribit.com
    secretName: nutribit-tls
  rules:
  - host: nutribit.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nutribit-frontend-service
            port:
              number: 80
  - host: www.nutribit.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nutribit-frontend-service
            port:
              number: 80
```

## 🖥️ 后端部署

### Node.js服务部署
```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 修改权限
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Python AI服务部署
```dockerfile
# Dockerfile.ai-service
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制源代码
COPY . .

# 创建非root用户
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes后端部署
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nutribit-backend
  namespace: nutribit
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nutribit-backend
  template:
    metadata:
      labels:
        app: nutribit-backend
    spec:
      containers:
      - name: backend
        image: nutribit/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nutribit-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: nutribit-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: nutribit-secrets
              key: jwt-secret
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nutribit-backend-service
  namespace: nutribit
spec:
  selector:
    app: nutribit-backend
  ports:
  - name: http
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

## 🗄️ 数据库部署

### PostgreSQL主从配置
```yaml
# k8s/postgresql-master.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql-master
  namespace: nutribit
spec:
  serviceName: postgresql-master
  replicas: 1
  selector:
    matchLabels:
      app: postgresql-master
  template:
    metadata:
      labels:
        app: postgresql-master
    spec:
      containers:
      - name: postgresql
        image: postgres:14
        env:
        - name: POSTGRES_DB
          value: nutribit
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: password
        - name: POSTGRES_REPLICATION_USER
          value: replicator
        - name: POSTGRES_REPLICATION_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: replication-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        - name: postgresql-config
          mountPath: /etc/postgresql/postgresql.conf
          subPath: postgresql.conf
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
      volumes:
      - name: postgresql-config
        configMap:
          name: postgresql-config
  volumeClaimTemplates:
  - metadata:
      name: postgresql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
      storageClassName: fast-ssd
```

### Redis集群配置
```yaml
# k8s/redis-cluster.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
  namespace: nutribit
spec:
  serviceName: redis-cluster
  replicas: 6
  selector:
    matchLabels:
      app: redis-cluster
  template:
    metadata:
      labels:
        app: redis-cluster
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command:
        - redis-server
        - /etc/redis/redis.conf
        - --cluster-enabled
        - "yes"
        - --cluster-config-file
        - /data/nodes.conf
        - --cluster-node-timeout
        - "5000"
        - --appendonly
        - "yes"
        ports:
        - containerPort: 6379
        - containerPort: 16379
        volumeMounts:
        - name: redis-data
          mountPath: /data
        - name: redis-config
          mountPath: /etc/redis
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 1Gi
      volumes:
      - name: redis-config
        configMap:
          name: redis-config
  volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## 🚀 CI/CD流水线

### GitLab CI配置
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy-dev
  - deploy-staging
  - deploy-prod

variables:
  DOCKER_REGISTRY: registry.nutribit.com
  KUBE_NAMESPACE: nutribit

# 测试阶段
test:frontend:
  stage: test
  image: node:18
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml

test:backend:
  stage: test
  image: node:18
  services:
    - postgres:14
    - redis:7
  variables:
    DATABASE_URL: postgres://test:test@postgres:5432/test
    REDIS_URL: redis://redis:6379
  script:
    - cd backend
    - npm ci
    - npm run test:integration
  
# 构建阶段
build:frontend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t $DOCKER_REGISTRY/nutribit-frontend:$CI_COMMIT_SHA -f frontend/Dockerfile frontend/
    - docker push $DOCKER_REGISTRY/nutribit-frontend:$CI_COMMIT_SHA
  only:
    - main
    - develop

build:backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t $DOCKER_REGISTRY/nutribit-backend:$CI_COMMIT_SHA -f backend/Dockerfile backend/
    - docker push $DOCKER_REGISTRY/nutribit-backend:$CI_COMMIT_SHA
  only:
    - main
    - develop

# 开发环境部署
deploy:dev:
  stage: deploy-dev
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/nutribit-frontend frontend=$DOCKER_REGISTRY/nutribit-frontend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE-dev
    - kubectl set image deployment/nutribit-backend backend=$DOCKER_REGISTRY/nutribit-backend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE-dev
    - kubectl rollout status deployment/nutribit-frontend -n $KUBE_NAMESPACE-dev
    - kubectl rollout status deployment/nutribit-backend -n $KUBE_NAMESPACE-dev
  environment:
    name: development
    url: https://dev.nutribit.com
  only:
    - develop

# 预发布环境部署
deploy:staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/nutribit-frontend frontend=$DOCKER_REGISTRY/nutribit-frontend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE-staging
    - kubectl set image deployment/nutribit-backend backend=$DOCKER_REGISTRY/nutribit-backend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE-staging
    - kubectl rollout status deployment/nutribit-frontend -n $KUBE_NAMESPACE-staging
    - kubectl rollout status deployment/nutribit-backend -n $KUBE_NAMESPACE-staging
  environment:
    name: staging
    url: https://staging.nutribit.com
  when: manual
  only:
    - main

# 生产环境部署
deploy:prod:
  stage: deploy-prod
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/nutribit-frontend frontend=$DOCKER_REGISTRY/nutribit-frontend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE
    - kubectl set image deployment/nutribit-backend backend=$DOCKER_REGISTRY/nutribit-backend:$CI_COMMIT_SHA -n $KUBE_NAMESPACE
    - kubectl rollout status deployment/nutribit-frontend -n $KUBE_NAMESPACE
    - kubectl rollout status deployment/nutribit-backend -n $KUBE_NAMESPACE
  environment:
    name: production
    url: https://nutribit.com
  when: manual
  only:
    - main
```

### GitHub Actions配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test

  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
        images: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        kubectl-version: 'latest'
```

## 📊 监控与日志

### Prometheus监控配置
```yaml
# monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
    
    - job_name: 'nutribit-frontend'
      static_configs:
      - targets: ['nutribit-frontend-service:80']
    
    - job_name: 'nutribit-backend'
      static_configs:
      - targets: ['nutribit-backend-service:3000']
```

### Grafana仪表板
```json
{
  "dashboard": {
    "title": "福宝 - 应用监控",
    "panels": [
      {
        "title": "QPS",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### ELK日志收集
```yaml
# logging/elasticsearch.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: logging
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: elasticsearch:8.8.0
        env:
        - name: discovery.type
          value: single-node
        - name: ES_JAVA_OPTS
          value: "-Xms2g -Xmx2g"
        ports:
        - containerPort: 9200
        - containerPort: 9300
        volumeMounts:
        - name: elasticsearch-data
          mountPath: /usr/share/elasticsearch/data
        resources:
          requests:
            cpu: 1000m
            memory: 4Gi
          limits:
            cpu: 2000m
            memory: 8Gi
  volumeClaimTemplates:
  - metadata:
      name: elasticsearch-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

## 🔒 安全配置

### SSL/TLS证书配置
```yaml
# security/cert-manager.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@nutribit.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx

---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: nutribit-tls
  namespace: nutribit
spec:
  secretName: nutribit-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - nutribit.com
  - www.nutribit.com
  - api.nutribit.com
```

### 网络安全策略
```yaml
# security/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nutribit-network-policy
  namespace: nutribit
spec:
  podSelector:
    matchLabels:
      app: nutribit-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nutribit-frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

## 🚨 灾难恢复

### 数据备份策略
```bash
#!/bin/bash
# scripts/backup.sh

# 数据库备份
kubectl exec -n nutribit postgresql-master-0 -- pg_dump -U nutribit nutribit > backup/nutribit-$(date +%Y%m%d-%H%M%S).sql

# Redis备份
kubectl exec -n nutribit redis-cluster-0 -- redis-cli BGSAVE
kubectl cp nutribit/redis-cluster-0:/data/dump.rdb backup/redis-$(date +%Y%m%d-%H%M%S).rdb

# 上传到云存储
aws s3 cp backup/ s3://nutribit-backup/$(date +%Y/%m/%d)/ --recursive

# 清理本地备份(保留7天)
find backup/ -name "*.sql" -mtime +7 -delete
find backup/ -name "*.rdb" -mtime +7 -delete
```

### 自动故障转移
```yaml
# ha/postgresql-failover.yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgresql-ha
  namespace: nutribit
spec:
  instances: 3
  
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
      
  bootstrap:
    initdb:
      database: nutribit
      owner: nutribit
      secret:
        name: postgresql-secret
        
  storage:
    size: 100Gi
    storageClass: fast-ssd
    
  monitoring:
    enabled: true
    
  backup:
    barmanObjectStore:
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
      wal:
        retention: "7d"
      data:
        retention: "30d"
```

## 📈 性能优化

### 应用层优化
```yaml
# performance/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nutribit-backend-hpa
  namespace: nutribit
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nutribit-backend
  minReplicas: 3
  maxReplicas: 20
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
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### 缓存策略
```yaml
# performance/redis-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
  namespace: nutribit
data:
  redis.conf: |
    # 内存优化
    maxmemory 1gb
    maxmemory-policy allkeys-lru
    
    # 持久化配置
    save 900 1
    save 300 10
    save 60 10000
    
    # 网络优化
    tcp-keepalive 300
    timeout 0
    
    # 日志配置
    loglevel notice
    logfile ""
```

## 🔧 运维脚本

### 部署脚本
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "部署到 $ENVIRONMENT 环境，版本: $VERSION"

# 检查kubectl连接
kubectl cluster-info

# 更新配置
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml

# 部署应用
kubectl set image deployment/nutribit-frontend frontend=nutribit/frontend:$VERSION -n nutribit-$ENVIRONMENT
kubectl set image deployment/nutribit-backend backend=nutribit/backend:$VERSION -n nutribit-$ENVIRONMENT

# 等待部署完成
kubectl rollout status deployment/nutribit-frontend -n nutribit-$ENVIRONMENT --timeout=600s
kubectl rollout status deployment/nutribit-backend -n nutribit-$ENVIRONMENT --timeout=600s

# 健康检查
echo "正在进行健康检查..."
sleep 30

# 验证部署
kubectl get pods -n nutribit-$ENVIRONMENT
kubectl get services -n nutribit-$ENVIRONMENT

echo "部署完成！"
```

### 回滚脚本
```bash
#!/bin/bash
# scripts/rollback.sh

ENVIRONMENT=${1:-staging}
REVISION=${2:-1}

echo "回滚 $ENVIRONMENT 环境到版本 $REVISION"

# 回滚部署
kubectl rollout undo deployment/nutribit-frontend --to-revision=$REVISION -n nutribit-$ENVIRONMENT
kubectl rollout undo deployment/nutribit-backend --to-revision=$REVISION -n nutribit-$ENVIRONMENT

# 等待回滚完成
kubectl rollout status deployment/nutribit-frontend -n nutribit-$ENVIRONMENT
kubectl rollout status deployment/nutribit-backend -n nutribit-$ENVIRONMENT

echo "回滚完成！"
```

## 📋 部署检查清单

### 部署前检查
- [ ] 代码已通过所有测试
- [ ] 安全扫描无高危漏洞
- [ ] 性能测试达标
- [ ] 数据库迁移脚本准备就绪
- [ ] 配置文件已更新
- [ ] SSL证书有效期充足
- [ ] 备份策略已启用
- [ ] 监控告警已配置

### 部署后验证
- [ ] 应用可正常访问
- [ ] API接口响应正常
- [ ] 数据库连接正常
- [ ] 缓存服务正常
- [ ] 文件上传功能正常
- [ ] 支付接口正常
- [ ] 第三方服务集成正常
- [ ] 监控指标正常
- [ ] 日志收集正常
- [ ] 告警测试正常

## 🆘 故障排除

### 常见问题诊断
```bash
# 查看Pod状态
kubectl get pods -n nutribit

# 查看Pod详细信息
kubectl describe pod <pod-name> -n nutribit

# 查看Pod日志
kubectl logs <pod-name> -n nutribit --tail=100

# 进入Pod进行调试
kubectl exec -it <pod-name> -n nutribit -- /bin/sh

# 查看资源使用情况
kubectl top nodes
kubectl top pods -n nutribit

# 查看事件
kubectl get events -n nutribit --sort-by='.lastTimestamp'
```

### 性能问题排查
```bash
# 查看响应时间
curl -w "@curl-format.txt" -o /dev/null -s "https://api.nutribit.com/health"

# 数据库性能分析
kubectl exec -it postgresql-master-0 -n nutribit -- psql -U nutribit -c "SELECT * FROM pg_stat_activity;"

# Redis性能监控
kubectl exec -it redis-cluster-0 -n nutribit -- redis-cli INFO stats
```

---

*文档版本: v1.0*  
*最后更新: 2025年9月10日*
