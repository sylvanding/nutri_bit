# 开发指南 - 食刻 (NutriBit)

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Git**: >= 2.30.0
- **操作系统**: Windows/macOS/Linux

### 开发工具推荐
- **IDE**: VS Code / WebStorm
- **浏览器**: Chrome (最新版本)
- **设计工具**: Figma
- **API测试**: Postman / Insomnia

## 📦 项目初始化

### 1. 克隆项目
```bash
# 克隆仓库
git clone https://github.com/your-org/nutri-bit.git
cd nutri-bit

# 检查Node版本
node --version  # 确保 >= 18.0.0
npm --version   # 确保 >= 8.0.0
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 验证安装
npm ls
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

**环境变量说明:**
```env
# 应用配置
VITE_APP_TITLE=食刻
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AI_SERVICE_URL=http://localhost:8000

# 第三方服务
VITE_WECHAT_APP_ID=your_wechat_app_id
VITE_ALIPAY_APP_ID=your_alipay_app_id

# 文件上传
VITE_UPLOAD_URL=http://localhost:3000/upload
VITE_CDN_BASE_URL=https://cdn.nutribit.com

# 调试模式
VITE_DEBUG=true
VITE_MOCK_API=false
```

### 4. 启动开发服务器
```bash
# 启动前端开发服务器
npm run dev

# 浏览器访问
open http://localhost:8905
```

## 🏗️ 项目结构

```
nutri-bit/
├── public/                 # 静态资源
│   ├── icons/             # 图标文件
│   ├── images/            # 图片资源
│   └── manifest.json      # PWA配置
├── src/                   # 源代码
│   ├── components/        # 组件目录
│   │   ├── ui/           # 基础UI组件
│   │   ├── forms/        # 表单组件
│   │   ├── charts/       # 图表组件
│   │   └── layout/       # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── auth/         # 认证页面
│   │   ├── dashboard/    # 仪表板
│   │   ├── nutrition/    # 营养相关
│   │   ├── community/    # 社区页面
│   │   └── profile/      # 个人中心
│   ├── hooks/            # 自定义Hooks
│   │   ├── useAuth.ts    # 认证相关
│   │   ├── useApi.ts     # API请求
│   │   └── useStorage.ts # 本地存储
│   ├── services/         # 服务层
│   │   ├── api/          # API请求
│   │   ├── auth/         # 认证服务
│   │   └── storage/      # 存储服务
│   ├── stores/           # 状态管理
│   │   ├── auth.ts       # 认证状态
│   │   ├── nutrition.ts  # 营养数据
│   │   └── ui.ts         # UI状态
│   ├── types/            # TypeScript类型
│   │   ├── api.ts        # API类型
│   │   ├── nutrition.ts  # 营养类型
│   │   └── user.ts       # 用户类型
│   ├── utils/            # 工具函数
│   │   ├── format.ts     # 格式化工具
│   │   ├── validation.ts # 验证工具
│   │   └── constants.ts  # 常量定义
│   ├── styles/           # 样式文件
│   │   ├── globals.css   # 全局样式
│   │   └── components/   # 组件样式
│   ├── assets/           # 资源文件
│   │   ├── images/       # 图片
│   │   ├── icons/        # 图标
│   │   └── fonts/        # 字体
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── vite-env.d.ts     # Vite类型声明
├── docs/                 # 项目文档
├── tests/                # 测试文件
├── .env.example          # 环境变量模板
├── .gitignore           # Git忽略文件
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript配置
├── tailwind.config.js   # Tailwind配置
├── vite.config.ts       # Vite配置
└── README.md            # 项目说明
```

## 🧩 组件开发规范

### 组件命名规范
```typescript
// 文件命名: PascalCase
Button.tsx
NutritionCard.tsx
UserProfileForm.tsx

// 组件命名: PascalCase
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>
}

// Props接口命名: 组件名 + Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}
```

### 组件结构模板
```typescript
// components/ui/Button.tsx
import React from 'react'
import { cn } from '@/utils/className'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

export default Button
```

### 自定义Hooks规范
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react'
import { ApiResponse } from '@/types/api'

interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const execute = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiCall()
      setData(response.data)
      
      options.onSuccess?.(response.data)
    } catch (err) {
      const error = err as Error
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [])
  
  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  }
}

// 使用示例
const UserProfile = () => {
  const { data: user, loading, error, refetch } = useApi(
    () => userService.getCurrentUser(),
    { immediate: true }
  )
  
  if (loading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return <UserCard user={user} onRefresh={refetch} />
}
```

## 🎨 样式开发规范

### Tailwind CSS使用指南
```tsx
// 基础样式类
const styles = {
  // 布局
  container: 'container mx-auto px-4',
  flexCenter: 'flex items-center justify-center',
  
  // 文字
  heading: 'text-2xl font-bold text-gray-900',
  body: 'text-base text-gray-700',
  caption: 'text-sm text-gray-500',
  
  // 按钮
  button: 'px-4 py-2 rounded-md font-medium transition-colors',
  buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
  
  // 卡片
  card: 'bg-white rounded-lg shadow-md p-6',
  
  // 表单
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
}
```

### 响应式设计
```tsx
// 移动端优先的响应式设计
const ResponsiveGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* 内容 */}
  </div>
)

// 断点说明
// sm: 640px+  (手机横屏)
// md: 768px+  (平板)
// lg: 1024px+ (桌面)
// xl: 1280px+ (大屏桌面)
```

### 主题色彩系统
```css
/* 主色调 */
:root {
  --color-primary: #3B82F6;      /* 蓝色 - 主品牌色 */
  --color-secondary: #10B981;    /* 绿色 - 健康色 */
  --color-accent: #F59E0B;       /* 橙色 - 强调色 */
  
  /* 功能色 */
  --color-success: #059669;      /* 成功 */
  --color-warning: #D97706;      /* 警告 */
  --color-error: #DC2626;        /* 错误 */
  --color-info: #2563EB;         /* 信息 */
  
  /* 中性色 */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-500: #6B7280;
  --color-gray-900: #111827;
}
```

## 🔧 状态管理

### Zustand状态管理示例
```typescript
// stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
  avatar: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password })
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...data }
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### 使用状态的组件
```typescript
// components/UserProfile.tsx
import { useAuthStore } from '@/stores/auth'

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuthStore()
  
  const handleUpdateProfile = async (data: any) => {
    try {
      await userService.updateProfile(data)
      updateProfile(data)
    } catch (error) {
      console.error('更新失败:', error)
    }
  }
  
  return (
    <div>
      <h1>Hello, {user?.username}</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  )
}
```

## 🌐 API集成

### API服务封装
```typescript
// services/api/base.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class ApiClient {
  private client: AxiosInstance
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // 处理token过期
          localStorage.removeItem('auth-token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }
  
  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config)
  }
  
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config)
  }
  
  // ... 其他HTTP方法
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL)
```

### 具体API服务
```typescript
// services/api/nutrition.ts
import { apiClient } from './base'
import { NutritionRecord, RecognitionResult } from '@/types/nutrition'

export const nutritionService = {
  // 图片识别
  recognizeFood: (image: File, mealType?: string) => {
    const formData = new FormData()
    formData.append('image', image)
    if (mealType) formData.append('mealType', mealType)
    
    return apiClient.post<RecognitionResult>('/nutrition/recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // 创建营养记录
  createRecord: (data: any) => {
    return apiClient.post<NutritionRecord>('/nutrition/records', data)
  },
  
  // 获取记录列表
  getRecords: (params?: any) => {
    return apiClient.get('/nutrition/records', { params })
  },
  
  // 获取每日汇总
  getDailySummary: (date: string) => {
    return apiClient.get(`/nutrition/daily-summary?date=${date}`)
  },
}
```

## 🧪 测试开发

### 单元测试
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledOnce()
  })
  
  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API测试
```typescript
// tests/services/auth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '@/services/api/auth'

// Mock axios
vi.mock('axios')

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, username: 'test' },
        token: 'mock-token'
      }
    }
    
    // Mock API response
    vi.mocked(axios.post).mockResolvedValue(mockResponse)
    
    const result = await authService.login('test@example.com', 'password')
    
    expect(result.data.user.username).toBe('test')
    expect(result.data.token).toBe('mock-token')
  })
})
```

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch

# 运行特定测试文件
npm run test Button.test.tsx
```

## 📱 移动端适配

### 响应式设计原则
```css
/* 移动端优先 */
.card {
  padding: 1rem;
  margin: 0.5rem;
}

/* 平板适配 */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
    margin: 1rem;
  }
}

/* 桌面适配 */
@media (min-width: 1024px) {
  .card {
    padding: 2rem;
    margin: 1.5rem;
  }
}
```

### 触摸优化
```css
/* 点击区域最小44px */
.button {
  min-height: 44px;
  min-width: 44px;
}

/* 禁用选择和高亮 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

### PWA配置
```json
// public/manifest.json
{
  "name": "食刻 - 智能营养管理",
  "short_name": "食刻",
  "description": "基于AI的个性化营养健康管理应用",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔍 调试与优化

### 开发者工具
```typescript
// 开发环境调试工具
if (import.meta.env.DEV) {
  // React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.checkDCE?.()
  
  // 性能监控
  import('@/utils/performance').then(({ setupPerformanceMonitoring }) => {
    setupPerformanceMonitoring()
  })
  
  // 错误边界
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}
```

### 性能优化策略
```typescript
// 代码分割
const LazyComponent = React.lazy(() => import('./HeavyComponent'))

// 使用Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>

// 图片懒加载
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="transition-opacity duration-300"
    />
  )
}

// 虚拟列表（长列表优化）
import { FixedSizeList as List } from 'react-window'

const VirtualList = ({ items }: { items: any[] }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={80}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ItemComponent item={data[index]} />
      </div>
    )}
  </List>
)
```

### Bundle分析
```bash
# 分析打包结果
npm run build
npx vite-bundle-analyzer dist

# 查看依赖大小
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

## 📋 代码质量

### ESLint配置
```javascript
// eslint.config.js
export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  },
]
```

### Prettier配置
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 代码格式化命令
```bash
# 格式化代码
npm run format

# 检查代码质量
npm run lint

# 自动修复
npm run lint:fix
```

## 🚀 构建部署

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 检查构建大小
npm run build -- --analyze
```

### 环境变量管理
```bash
# 开发环境
.env.local

# 测试环境
.env.test

# 生产环境
.env.production
```

### Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 学习资源

### 技术文档
- [React官方文档](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Vite指南](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 开发工具
- [VS Code扩展推荐](./vscode-extensions.md)
- [Chrome开发者工具](https://developer.chrome.com/docs/devtools/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

### 编码规范
- [Airbnb React规范](https://github.com/airbnb/javascript/tree/master/react)
- [TypeScript编码规范](https://google.github.io/styleguide/tsguide.html)

## ❓ 常见问题

### Q: 如何解决依赖冲突？
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q: 如何调试API请求？
```typescript
// 在请求拦截器中添加日志
axios.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})

axios.interceptors.response.use(
  response => {
    console.log('Response:', response)
    return response
  },
  error => {
    console.error('Error:', error)
    return Promise.reject(error)
  }
)
```

### Q: 如何优化首屏加载速度？
1. 使用代码分割和懒加载
2. 压缩图片资源
3. 启用HTTP/2
4. 使用CDN加速
5. 预加载关键资源

### Q: 如何处理跨域问题？
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

*文档版本: v1.0*  
*最后更新: 2025年9月10日*
