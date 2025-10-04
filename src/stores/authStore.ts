import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '../types/auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      
      setAuth: (user: User, tokens: AuthTokens) => {
        console.log('设置认证状态:', { user, tokens });
        set({
          user,
          tokens,
          isAuthenticated: true,
        });
        
        // 立即触发状态变化通知
        const currentState = get();
        console.log('认证状态已更新:', currentState);
        
        // 触发自定义事件通知应用状态变化
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { type: 'login', user, isAuthenticated: true } 
        }));
      },
      
      logout: () => {
        console.log('执行登出操作');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
        
        // 清理本地存储
        localStorage.removeItem('nutri-bit-auth');
        
        // 触发自定义事件通知应用状态变化
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { type: 'logout', user: null, isAuthenticated: false } 
        }));
        
        console.log('登出操作完成');
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'nutri-bit-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('认证状态已从存储中恢复:', state);
        if (state) {
          // 触发状态恢复事件
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('auth-state-restored', { 
              detail: { 
                user: state.user, 
                isAuthenticated: state.isAuthenticated 
              } 
            }));
          }, 50);
        }
      },
    }
  )
);

