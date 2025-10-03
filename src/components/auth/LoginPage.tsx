import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 模拟API调用 - 实际项目中这里应该调用真实的API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功响应
      const mockUser = {
        id: 1001,
        username: '用户' + Math.floor(Math.random() * 1000),
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 7200,
      };
      
      setAuth(mockUser, mockTokens);
      onLoginSuccess();
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
          <p className="text-gray-600">登录到福宝，开启健康生活</p>
        </div>

        {/* 登录表单卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* 忘记密码 */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="ml-2 text-gray-600">记住我</span>
              </label>
              <button type="button" className="text-emerald-600 hover:text-emerald-700 font-medium">
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>登录</span>
                </>
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="mt-6 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或者</span>
            </div>
          </div>

          {/* 第三方登录 */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#07C160" d="M8.691 2.188C7.099 2.188 5.8 3.486 5.8 5.079c0 1.595 1.3 2.894 2.891 2.894 1.593 0 2.892-1.3 2.892-2.894 0-1.593-1.3-2.891-2.892-2.891zm11.618 0c-1.593 0-2.892 1.3-2.892 2.891 0 1.595 1.3 2.894 2.892 2.894 1.592 0 2.891-1.3 2.891-2.894 0-1.593-1.3-2.891-2.891-2.891zM8.691 5.079c1.03 0 1.869.838 1.869 1.869 0 1.031-.838 1.869-1.869 1.869-1.03 0-1.869-.838-1.869-1.869 0-1.03.838-1.869 1.869-1.869zm11.618 0c1.031 0 1.869.838 1.869 1.869 0 1.031-.838 1.869-1.869 1.869-1.03 0-1.869-.838-1.869-1.869 0-1.03.838-1.869 1.869-1.869zm-5.265 2.891c-1.593 0-2.892 1.3-2.892 2.892 0 1.593 1.3 2.891 2.892 2.891 1.592 0 2.891-1.299 2.891-2.891 0-1.593-1.3-2.892-2.891-2.892zm-5.554 3.916c-1.593 0-2.892 1.3-2.892 2.891 0 1.593 1.3 2.892 2.892 2.892 1.592 0 2.891-1.3 2.891-2.892 0-1.593-1.3-2.891-2.891-2.891zm11.109 0c-1.593 0-2.891 1.3-2.891 2.891 0 1.593 1.299 2.892 2.891 2.892 1.593 0 2.892-1.3 2.892-2.892 0-1.593-1.3-2.891-2.892-2.891z"/>
              </svg>
            </button>
          </div>

          {/* 注册链接 */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">还没有账号？</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              立即注册
            </button>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>登录即表示您同意我们的</p>
          <div className="mt-1">
            <a href="#" className="text-emerald-600 hover:text-emerald-700">服务条款</a>
            <span className="mx-2">和</span>
            <a href="#" className="text-emerald-600 hover:text-emerald-700">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
};

