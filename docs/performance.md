# 性能优化指南 - 食刻 (NutriBit)

## 🎯 性能目标

### 关键性能指标 (KPI)
- **首屏加载时间**: < 2秒
- **AI识别响应时间**: < 3秒
- **页面交互延迟**: < 100ms
- **应用启动时间**: < 1.5秒
- **内存占用**: < 150MB
- **网络请求成功率**: > 99.5%

### 用户体验标准
```typescript
interface PerformanceStandards {
  loading: {
    fast: "< 1秒 - 用户感觉即时";
    acceptable: "1-3秒 - 用户可以接受";
    slow: "> 3秒 - 需要优化提示";
  };
  
  interaction: {
    immediate: "< 16ms - 60fps流畅动画";
    responsive: "< 100ms - 用户感觉响应迅速";
    delayed: "> 300ms - 用户感觉明显延迟";
  };
  
  ai_processing: {
    realtime: "< 1秒 - 实时识别体验";
    fast: "1-3秒 - 快速识别";
    standard: "3-5秒 - 标准处理时间";
  };
}
```

## 🚀 前端性能优化

### 1. 资源优化

#### 图片优化策略
```typescript
// 自适应图片格式
const ImageOptimizer = {
  // WebP支持检测
  supportsWebP: () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  },
  
  // 响应式图片
  getOptimalImageUrl: (baseUrl: string, width: number) => {
    const format = ImageOptimizer.supportsWebP() ? 'webp' : 'jpg';
    const density = window.devicePixelRatio || 1;
    const actualWidth = Math.ceil(width * density);
    
    return `${baseUrl}?w=${actualWidth}&f=${format}&q=80`;
  },
  
  // 懒加载实现
  lazyLoad: (element: HTMLImageElement) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(element);
  }
};

// 使用示例
<img 
  src="placeholder.jpg"
  data-src={ImageOptimizer.getOptimalImageUrl(originalUrl, 400)}
  loading="lazy"
  onLoad={() => ImageOptimizer.lazyLoad}
/>
```

#### 代码分割与懒加载
```typescript
// 路由级别代码分割
const LazyHome = React.lazy(() => import('./pages/Home'));
const LazyNutrition = React.lazy(() => import('./pages/Nutrition'));
const LazyCommunity = React.lazy(() => import('./pages/Community'));

// 组件级别懒加载
const LazyChart = React.lazy(() => import('./components/Chart'));

// 动态导入
const loadHeavyFeature = async () => {
  const { HeavyFeature } = await import('./features/HeavyFeature');
  return HeavyFeature;
};

// 预加载关键路由
const preloadRoute = (routePath: string) => {
  const routeComponent = routeMap[routePath];
  if (routeComponent) {
    // 空闲时预加载
    requestIdleCallback(() => {
      import(routeComponent);
    });
  }
};
```

#### Bundle优化配置
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 分离第三方库
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@headlessui/react'],
          'chart-vendor': ['recharts', 'd3'],
          
          // 按功能分组
          'ai-module': [
            './src/services/ai',
            './src/utils/image-processing'
          ],
          'community-module': [
            './src/pages/Community',
            './src/components/Social'
          ]
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    
    // 资源内联
    assetsInlineLimit: 4096, // 4KB以下内联
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@tensorflow/tfjs'] // 大型库延迟加载
  }
});
```

### 2. 运行时优化

#### React性能优化
```typescript
// 组件优化示例
const NutritionCard = React.memo(({ 
  nutrition, 
  onEdit 
}: NutritionCardProps) => {
  // 使用useMemo缓存计算结果
  const nutritionScore = useMemo(() => {
    return calculateNutritionScore(nutrition);
  }, [nutrition]);
  
  // 使用useCallback缓存事件处理器
  const handleEdit = useCallback(() => {
    onEdit(nutrition.id);
  }, [nutrition.id, onEdit]);
  
  return (
    <Card>
      <ScoreDisplay score={nutritionScore} />
      <EditButton onClick={handleEdit} />
    </Card>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.nutrition.id === nextProps.nutrition.id &&
         prevProps.nutrition.updatedAt === nextProps.nutrition.updatedAt;
});

// 虚拟列表优化
const VirtualNutritionList = ({ items }: { items: NutritionRecord[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={120}
      itemData={items}
      overscanCount={5} // 预渲染5个项目
    >
      {({ index, style, data }) => (
        <div style={style}>
          <NutritionCard nutrition={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

#### 状态管理优化
```typescript
// Zustand性能优化
interface AppStore {
  // 分离频繁更新的状态
  ui: {
    loading: boolean;
    currentTab: string;
  };
  
  // 分离稳定的用户数据
  user: {
    profile: UserProfile;
    preferences: UserPreferences;
  };
  
  // 分离业务数据
  nutrition: {
    records: NutritionRecord[];
    dailySummary: DailySummary;
  };
}

// 选择性订阅
const useUIStore = () => useStore(store => store.ui);
const useUserStore = () => useStore(store => store.user);

// 浅比较优化
const useNutritionRecords = () => useStore(
  store => store.nutrition.records,
  shallow // 使用浅比较避免不必要的重渲染
);
```

### 3. 网络优化

#### 请求优化策略
```typescript
// HTTP缓存策略
const cacheConfig = {
  // 静态资源强缓存
  staticAssets: {
    maxAge: 31536000, // 1年
    immutable: true
  },
  
  // API数据缓存
  apiData: {
    userProfile: { maxAge: 3600 }, // 1小时
    nutritionData: { maxAge: 300 }, // 5分钟
    staticData: { maxAge: 86400 }   // 1天
  }
};

// 请求合并
class RequestBatcher {
  private batch: Map<string, Promise<any>> = new Map();
  
  async batchRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.batch.has(key)) {
      return this.batch.get(key);
    }
    
    const promise = request();
    this.batch.set(key, promise);
    
    // 请求完成后清理
    promise.finally(() => {
      this.batch.delete(key);
    });
    
    return promise;
  }
}

// 预加载策略
const preloadStrategies = {
  // 关键资源预加载
  critical: () => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = '/api/user/profile';
    link.as = 'fetch';
    document.head.appendChild(link);
  },
  
  // 基于用户行为预加载
  predictive: (userAction: string) => {
    const nextActions = {
      'view-nutrition': '/api/nutrition/recommendations',
      'browse-community': '/api/community/posts',
      'start-record': '/api/nutrition/recent-foods'
    };
    
    const nextEndpoint = nextActions[userAction];
    if (nextEndpoint) {
      fetch(nextEndpoint, { cache: 'force-cache' });
    }
  }
};
```

#### Service Worker缓存
```typescript
// sw.js - Service Worker缓存策略
const CACHE_NAME = 'nutribit-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// 缓存策略
const cacheStrategies = {
  // 静态资源 - Cache First
  static: (request: Request) => {
    return caches.open(STATIC_CACHE).then(cache => {
      return cache.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    });
  },
  
  // API请求 - Network First
  api: (request: Request) => {
    return fetch(request).then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(API_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.open(API_CACHE).then(cache => {
        return cache.match(request);
      });
    });
  }
};
```

## 🤖 AI服务性能优化

### 1. 模型优化

#### 模型压缩技术
```python
# 模型量化
import tensorflow as tf

def quantize_model(model_path: str, output_path: str):
    """将模型量化为INT8以减小体积和提升推理速度"""
    
    # 加载原始模型
    model = tf.keras.models.load_model(model_path)
    
    # 创建TensorFlow Lite转换器
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # 启用量化
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.representative_dataset = representative_dataset_generator
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.int8
    
    # 转换模型
    quantized_model = converter.convert()
    
    # 保存量化模型
    with open(output_path, 'wb') as f:
        f.write(quantized_model)

# 模型蒸馏
class DistillationTraining:
    def __init__(self, teacher_model, student_model):
        self.teacher = teacher_model
        self.student = student_model
        
    def distillation_loss(self, y_true, y_pred_student, y_pred_teacher, alpha=0.5, temperature=3):
        """蒸馏损失函数"""
        hard_loss = tf.keras.losses.categorical_crossentropy(y_true, y_pred_student)
        
        teacher_soft = tf.nn.softmax(y_pred_teacher / temperature)
        student_soft = tf.nn.softmax(y_pred_student / temperature)
        soft_loss = tf.keras.losses.KLDivergence()(teacher_soft, student_soft)
        
        return alpha * hard_loss + (1 - alpha) * soft_loss * (temperature ** 2)
```

#### 推理优化
```python
# GPU/CPU混合推理
class OptimizedInference:
    def __init__(self):
        self.device_strategy = self._select_optimal_device()
        self.model_cache = {}
        
    def _select_optimal_device(self):
        """选择最优计算设备"""
        if tf.config.list_physical_devices('GPU'):
            return 'GPU'
        elif tf.config.list_physical_devices('TPU'):
            return 'TPU'
        else:
            return 'CPU'
    
    async def batch_inference(self, images: List[np.ndarray], batch_size: int = 8):
        """批量推理优化"""
        results = []
        
        # 图像预处理批处理
        preprocessed = await self._preprocess_batch(images, batch_size)
        
        # 批量推理
        for batch in preprocessed:
            with tf.device(f'/{self.device_strategy}:0'):
                predictions = self.model(batch)
                results.extend(predictions.numpy())
        
        return results
    
    def model_serving_optimization(self):
        """模型服务优化"""
        # 模型预热
        dummy_input = tf.random.normal((1, 224, 224, 3))
        self.model(dummy_input)
        
        # JIT编译
        self.model = tf.function(self.model, jit_compile=True)
        
        # 混合精度
        policy = tf.keras.mixed_precision.Policy('mixed_float16')
        tf.keras.mixed_precision.set_global_policy(policy)
```

### 2. 并发处理优化

#### 异步处理架构
```python
# FastAPI异步处理
from fastapi import FastAPI, BackgroundTasks
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

class AIService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.model_pool = ModelPool(pool_size=3)
        
    async def recognize_food_async(self, image: bytes) -> dict:
        """异步食物识别"""
        
        # 图像预处理 (CPU密集型任务)
        loop = asyncio.get_event_loop()
        preprocessed = await loop.run_in_executor(
            self.executor, 
            self._preprocess_image, 
            image
        )
        
        # AI推理 (GPU任务)
        model = await self.model_pool.get_model()
        try:
            result = await self._inference(model, preprocessed)
            
            # 后处理
            processed_result = await loop.run_in_executor(
                self.executor,
                self._postprocess_result,
                result
            )
            
            return processed_result
        finally:
            await self.model_pool.return_model(model)

# 模型池管理
class ModelPool:
    def __init__(self, pool_size: int = 3):
        self.pool = asyncio.Queue(maxsize=pool_size)
        self.total_models = pool_size
        
        # 初始化模型池
        for _ in range(pool_size):
            model = self._load_model()
            self.pool.put_nowait(model)
    
    async def get_model(self):
        """获取可用模型"""
        return await self.pool.get()
    
    async def return_model(self, model):
        """归还模型到池中"""
        await self.pool.put(model)
```

#### 缓存策略
```python
# Redis缓存优化
import redis
import hashlib
import pickle
from typing import Optional

class IntelligentCache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.cache_ttl = {
            'food_recognition': 3600,      # 1小时
            'nutrition_calculation': 1800,  # 30分钟
            'user_preferences': 86400,      # 24小时
        }
    
    def generate_cache_key(self, image_data: bytes, user_id: str) -> str:
        """生成缓存键"""
        image_hash = hashlib.md5(image_data).hexdigest()
        return f"food_recognition:{user_id}:{image_hash}"
    
    async def get_cached_result(self, cache_key: str) -> Optional[dict]:
        """获取缓存结果"""
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return pickle.loads(cached_data)
        except Exception as e:
            print(f"Cache retrieval error: {e}")
        return None
    
    async def cache_result(self, cache_key: str, result: dict, cache_type: str):
        """缓存结果"""
        try:
            ttl = self.cache_ttl.get(cache_type, 3600)
            serialized_data = pickle.dumps(result)
            self.redis_client.setex(cache_key, ttl, serialized_data)
        except Exception as e:
            print(f"Cache storage error: {e}")
    
    # 智能缓存失效
    def invalidate_user_cache(self, user_id: str):
        """用户相关缓存失效"""
        pattern = f"*:{user_id}:*"
        keys = self.redis_client.keys(pattern)
        if keys:
            self.redis_client.delete(*keys)
```

## 📊 数据库性能优化

### 1. PostgreSQL优化

#### 索引优化策略
```sql
-- 复合索引优化
CREATE INDEX CONCURRENTLY idx_nutrition_records_user_date 
ON nutrition_records (user_id, meal_time DESC)
WHERE deleted_at IS NULL;

-- 部分索引
CREATE INDEX CONCURRENTLY idx_active_users 
ON users (created_at) 
WHERE status = 'active' AND deleted_at IS NULL;

-- 表达式索引
CREATE INDEX CONCURRENTLY idx_nutrition_records_date 
ON nutrition_records (DATE(meal_time));

-- GIN索引用于全文搜索
CREATE INDEX CONCURRENTLY idx_foods_search 
ON foods USING GIN (to_tsvector('english', name || ' ' || description));

-- 分析索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 查询优化
```sql
-- 优化前：N+1查询问题
-- SELECT * FROM nutrition_records WHERE user_id = ?;
-- SELECT * FROM foods WHERE id IN (...);

-- 优化后：JOIN查询
SELECT 
    nr.*,
    f.name as food_name,
    f.category,
    fn.calories,
    fn.protein,
    fn.carbohydrates,
    fn.fat
FROM nutrition_records nr
JOIN record_foods rf ON nr.id = rf.record_id
JOIN foods f ON rf.food_id = f.id
JOIN food_nutrition fn ON f.id = fn.food_id
WHERE nr.user_id = $1 
  AND nr.meal_time >= $2 
  AND nr.meal_time <= $3
ORDER BY nr.meal_time DESC
LIMIT 50;

-- 分页优化：游标分页替代OFFSET
SELECT *
FROM nutrition_records
WHERE user_id = $1 
  AND (meal_time, id) < ($2, $3)  -- 游标条件
ORDER BY meal_time DESC, id DESC
LIMIT 20;
```

#### 连接池优化
```typescript
// 数据库连接池配置
const poolConfig = {
  // 连接池大小
  min: 5,           // 最小连接数
  max: 20,          // 最大连接数
  
  // 连接管理
  idleTimeoutMillis: 30000,     // 空闲连接超时
  connectionTimeoutMillis: 2000, // 连接超时
  
  // 健康检查
  testOnBorrow: true,
  validationQuery: 'SELECT 1',
  
  // 错误处理
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
};

// 查询优化中间件
class QueryOptimizer {
  // 慢查询监控
  static logSlowQueries(threshold: number = 1000) {
    return (query: string, duration: number) => {
      if (duration > threshold) {
        console.warn(`Slow query detected: ${duration}ms`, {
          query: query.substring(0, 200),
          duration,
          timestamp: new Date().toISOString()
        });
      }
    };
  }
  
  // 查询缓存
  static queryCache = new Map<string, { result: any; timestamp: number }>();
  
  static getCachedQuery(sql: string, params: any[]): any | null {
    const key = this.generateCacheKey(sql, params);
    const cached = this.queryCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
      return cached.result;
    }
    
    return null;
  }
  
  static setCachedQuery(sql: string, params: any[], result: any) {
    const key = this.generateCacheKey(sql, params);
    this.queryCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // 限制缓存大小
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
  }
}
```

### 2. Redis性能优化

#### 数据结构优化
```typescript
// Redis性能优化策略
class RedisOptimizer {
  // 管道操作减少网络往返
  async batchOperations(operations: Array<() => Promise<any>>) {
    const pipeline = this.redis.pipeline();
    
    operations.forEach(op => {
      pipeline.exec(op);
    });
    
    return await pipeline.exec();
  }
  
  // 过期时间优化
  setSmartExpiration(key: string, value: any, baseExpire: number) {
    // 添加随机偏移避免缓存雪崩
    const randomOffset = Math.floor(Math.random() * 0.1 * baseExpire);
    const actualExpire = baseExpire + randomOffset;
    
    return this.redis.setex(key, actualExpire, JSON.stringify(value));
  }
  
  // 热点数据预加载
  async preloadHotData() {
    const hotKeys = [
      'popular_foods',
      'nutrition_standards',
      'user_preferences_cache'
    ];
    
    for (const key of hotKeys) {
      if (!(await this.redis.exists(key))) {
        const data = await this.loadFromDatabase(key);
        await this.setSmartExpiration(key, data, 3600);
      }
    }
  }
  
  // 内存优化
  optimizeMemoryUsage() {
    // 使用Hash结构存储对象
    // 而不是序列化整个对象
    const storeUserData = (userId: string, userData: any) => {
      const key = `user:${userId}`;
      
      // 替代方案：存储序列化对象
      // this.redis.set(key, JSON.stringify(userData));
      
      // 优化方案：使用Hash
      this.redis.hmset(key, {
        name: userData.name,
        email: userData.email,
        profile: JSON.stringify(userData.profile)
      });
    };
  }
}
```

## ⚡ 前端加载优化

### 1. 关键渲染路径优化

#### 资源优先级管理
```html
<!-- 关键CSS内联 -->
<style>
  /* 首屏关键样式 */
  .hero { /* ... */ }
  .navigation { /* ... */ }
</style>

<!-- 非关键CSS异步加载 -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- 关键字体预加载 -->
<link rel="preload" href="/fonts/primary.woff2" as="font" type="font/woff2" crossorigin>

<!-- 关键脚本 -->
<script src="critical.js"></script>

<!-- 非关键脚本延迟加载 -->
<script src="analytics.js" async></script>
```

#### 渐进式增强
```typescript
// 渐进式加载策略
class ProgressiveLoader {
  // 基础功能优先加载
  async loadCore() {
    const coreModules = await Promise.all([
      import('./components/Navigation'),
      import('./components/Camera'),
      import('./services/api')
    ]);
    
    return coreModules;
  }
  
  // 增强功能按需加载
  async loadEnhancements() {
    // 空闲时间加载非关键功能
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        await Promise.all([
          import('./components/Charts'),
          import('./components/SocialFeatures'),
          import('./utils/analytics')
        ]);
      });
    }
  }
  
  // 基于用户行为预加载
  preloadBasedOnBehavior(userAction: string) {
    const preloadMap = {
      'hover-nutrition': () => import('./pages/NutritionDetail'),
      'scroll-community': () => import('./components/CommunityPosts'),
      'click-camera': () => import('./utils/image-processing')
    };
    
    const preloader = preloadMap[userAction];
    if (preloader) {
      preloader();
    }
  }
}
```

### 2. 运行时性能监控

#### 性能指标收集
```typescript
// Web Vitals监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  constructor() {
    this.initializeWebVitals();
    this.setupCustomMetrics();
  }
  
  private initializeWebVitals() {
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }
  
  private handleMetric(metric: any) {
    this.metrics.set(metric.name, metric.value);
    
    // 发送到分析服务
    this.sendToAnalytics({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    });
  }
  
  // 自定义性能指标
  measureAIRecognition() {
    return {
      start: () => performance.mark('ai-recognition-start'),
      end: () => {
        performance.mark('ai-recognition-end');
        performance.measure('ai-recognition', 'ai-recognition-start', 'ai-recognition-end');
        
        const measure = performance.getEntriesByName('ai-recognition')[0];
        this.handleMetric({
          name: 'ai-recognition-time',
          value: measure.duration,
          rating: measure.duration < 3000 ? 'good' : 'poor'
        });
      }
    };
  }
  
  // 内存使用监控
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        utilizationPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
  }
  
  // 长任务监控
  monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 长于50ms的任务
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  }
}
```

## 🔧 性能调试工具

### 开发环境性能分析
```typescript
// 性能调试工具
class PerformanceDebugger {
  // React组件渲染分析
  analyzeComponentRenders() {
    if (process.env.NODE_ENV === 'development') {
      const { whyDidYouRender } = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, {
        trackAllPureComponents: true,
        logOnDifferentValues: true
      });
    }
  }
  
  // Bundle分析
  analyzeBundleSize() {
    // 使用webpack-bundle-analyzer
    if (process.env.ANALYZE) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      return new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        openAnalyzer: true
      });
    }
  }
  
  // 网络请求分析
  analyzeNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const response = await originalFetch(...args);
      const endTime = performance.now();
      
      console.log(`Fetch ${args[0]}: ${endTime - startTime}ms`, {
        url: args[0],
        duration: endTime - startTime,
        status: response.status,
        size: response.headers.get('content-length')
      });
      
      return response;
    };
  }
}
```

### 生产环境监控
```typescript
// 生产环境性能监控
class ProductionMonitor {
  // 错误边界与性能监控结合
  static ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // 发送错误和性能数据
          this.reportError(error, errorInfo, {
            performanceMetrics: this.getCurrentMetrics(),
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          });
        }}
      >
        {children}
      </ErrorBoundary>
    );
  };
  
  // 实时性能告警
  setupPerformanceAlerts() {
    const thresholds = {
      LCP: 2500,      // Largest Contentful Paint
      FID: 100,       // First Input Delay
      CLS: 0.1,       // Cumulative Layout Shift
      memoryUsage: 80 // Memory usage percentage
    };
    
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      this.monitorMetric(metric, threshold, (value) => {
        this.sendAlert({
          metric,
          value,
          threshold,
          severity: value > threshold * 1.5 ? 'critical' : 'warning'
        });
      });
    });
  }
  
  // A/B测试性能对比
  comparePerformanceVariants() {
    const variant = this.getCurrentVariant();
    
    return {
      collectMetrics: (metrics: any) => {
        this.sendToAnalytics({
          ...metrics,
          variant,
          timestamp: Date.now(),
          sessionId: this.getSessionId()
        });
      }
    };
  }
}
```

## 📈 性能优化效果评估

### 关键指标基线
```typescript
interface PerformanceBaseline {
  // 加载性能基线
  loading: {
    firstContentfulPaint: 1500; // 目标 < 1.5s
    largestContentfulPaint: 2500; // 目标 < 2.5s
    timeToInteractive: 3000; // 目标 < 3s
  };
  
  // 交互性能基线
  interaction: {
    firstInputDelay: 100; // 目标 < 100ms
    totalBlockingTime: 300; // 目标 < 300ms
    cumulativeLayoutShift: 0.1; // 目标 < 0.1
  };
  
  // 业务性能基线
  business: {
    aiRecognitionTime: 3000; // 目标 < 3s
    searchResponseTime: 500; // 目标 < 500ms
    pageTransitionTime: 200; // 目标 < 200ms
  };
}
```

### 性能优化ROI分析
```typescript
interface PerformanceROI {
  improvements: {
    loadTimeReduction: '40%'; // 加载时间减少40%
    conversionIncrease: '15%'; // 转化率提升15%
    bounceRateDecrease: '25%'; // 跳出率降低25%
    userSatisfactionIncrease: '30%'; // 用户满意度提升30%
  };
  
  businessImpact: {
    revenueIncrease: 'Monthly revenue increase of 12%';
    userRetention: 'D7 retention improved from 45% to 58%';
    costSavings: 'Infrastructure cost reduced by 20%';
  };
}
```

---

*文档版本: v1.0*  
*最后更新: 2025年9月10日*
