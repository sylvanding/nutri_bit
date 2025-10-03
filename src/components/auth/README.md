# 认证系统使用说明

## 概述

福宝(NutriBit)的认证系统提供了完整的用户登录、注册功能,使用Zustand进行状态管理,并支持本地持久化存储。

## 文件结构

```
src/
├── components/auth/
│   ├── LoginPage.tsx        # 登录页面组件
│   ├── RegisterPage.tsx     # 注册页面组件
│   └── README.md           # 本文档
├── stores/
│   └── authStore.ts        # 认证状态管理
└── types/
    └── auth.ts             # 认证相关类型定义
```

## 功能特性

### 登录页面 (LoginPage)
- ✅ 邮箱/密码登录
- ✅ 记住我功能
- ✅ 密码显示/隐藏切换
- ✅ 第三方登录支持(Facebook、Google、微信)
- ✅ 表单验证
- ✅ 加载状态提示
- ✅ 错误提示
- ✅ 切换到注册页面

### 注册页面 (RegisterPage)
- ✅ 用户名、邮箱、密码注册
- ✅ 手机号(可选)
- ✅ 邀请码(可选)
- ✅ 密码强度指示器
- ✅ 确认密码验证
- ✅ 用户协议确认
- ✅ 实时表单验证
- ✅ 新用户福利提示
- ✅ 切换到登录页面

## 使用方法

### 1. 在App组件中集成

```typescript
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // 未登录时显示认证页面
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView('register')}
          onLoginSuccess={() => {/* 登录成功回调 */}}
        />
      );
    } else {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={() => {/* 注册成功回调 */}}
        />
      );
    }
  }
  
  // 已登录时显示主应用
  return <MainApp />;
}
```

### 2. 使用认证状态

```typescript
import { useAuthStore } from './stores/authStore';

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated && (
        <>
          <p>欢迎, {user?.username}</p>
          <button onClick={logout}>退出登录</button>
        </>
      )}
    </div>
  );
}
```

### 3. 更新用户信息

```typescript
import { useAuthStore } from './stores/authStore';

function ProfileEditor() {
  const { user, updateUser } = useAuthStore();
  
  const handleUpdate = () => {
    updateUser({
      username: 'newUsername',
      avatar: 'https://example.com/avatar.jpg'
    });
  };
  
  return <button onClick={handleUpdate}>更新资料</button>;
}
```

## 状态管理

### AuthStore 状态

```typescript
{
  user: User | null,              // 当前用户信息
  tokens: AuthTokens | null,      // 认证令牌
  isAuthenticated: boolean,       // 是否已认证
}
```

### AuthStore 方法

- `setAuth(user, tokens)` - 设置认证状态
- `logout()` - 退出登录
- `updateUser(userData)` - 更新用户信息

## 数据持久化

认证状态会自动保存到浏览器的 localStorage 中,键名为 `nutri-bit-auth`。当用户刷新页面时,会自动从 localStorage 恢复登录状态。

## API 集成说明

当前实现使用模拟数据。在生产环境中,需要:

1. **创建 API 服务**

```typescript
// src/services/authService.ts
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  async register(data: RegisterRequest) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

2. **修改登录/注册组件**

将组件中的模拟 API 调用替换为真实的 API 调用:

```typescript
// LoginPage.tsx - handleSubmit 函数
import { authService } from '../../services/authService';

const response = await authService.login(email, password);
setAuth(response.data.user, response.data.tokens);
```

## 安全建议

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **Token 管理**: 
   - Access Token 应设置较短的过期时间(如2小时)
   - Refresh Token 用于获取新的 Access Token
   - 敏感操作应重新验证密码
3. **密码要求**:
   - 最少8个字符
   - 建议包含大小写字母、数字和特殊字符
4. **防护措施**:
   - 实现登录失败次数限制
   - 添加验证码防止暴力破解
   - 使用 Content Security Policy
5. **数据保护**:
   - 不要在 localStorage 中存储敏感信息
   - Token 应加密传输
   - 定期清理过期的 Token

## 样式定制

登录和注册页面使用 Tailwind CSS,可以通过修改以下类名来定制样式:

- 主题色: `emerald-500`, `teal-500`
- 背景渐变: `from-emerald-50 via-teal-50 to-cyan-50`
- 按钮样式: `from-emerald-500 to-teal-500`
- 输入框: `focus:ring-emerald-500 focus:border-emerald-500`

## 测试账号

在开发环境中,可以使用任意邮箱和密码进行登录/注册,系统会自动创建模拟用户。

## 常见问题

**Q: 刷新页面后登录状态丢失?**  
A: 检查 localStorage 是否被清空,或浏览器是否禁用了 localStorage。

**Q: 如何实现记住我功能?**  
A: 当前实现默认保存登录状态。如需实现"记住我"功能,可以在 persist 配置中添加条件逻辑。

**Q: 如何处理 Token 过期?**  
A: 建议在 API 请求拦截器中检测 401 错误,自动使用 refresh token 刷新 access token。

**Q: 如何实现第三方登录?**  
A: 需要集成对应的 OAuth SDK(如 Google、Facebook),并在后端实现 OAuth 回调处理。

## 未来改进

- [ ] 邮箱验证
- [ ] 手机验证码登录
- [ ] 忘记密码功能
- [ ] 双因素认证
- [ ] 生物识别登录
- [ ] SSO 单点登录
- [ ] 登录历史记录
- [ ] 设备管理

## 更新日志

### v1.0.0 (2025-10-03)
- ✅ 初始版本
- ✅ 登录页面
- ✅ 注册页面
- ✅ 状态管理
- ✅ 本地持久化
- ✅ 退出登录功能

