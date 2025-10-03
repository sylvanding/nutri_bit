// 认证相关类型定义

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  height?: number;        // 身高 (cm)
  weight?: number;        // 体重 (kg)
  age?: number;           // 年龄
  gender?: 'male' | 'female' | 'other';  // 性别
  activityLevel?: 'low' | 'moderate' | 'high';  // 活动水平
  healthGoal?: 'lose' | 'gain' | 'maintain';    // 健康目标
  targetCalories?: number;     // 目标卡路里
  targetProtein?: number;      // 目标蛋白质 (g)
  targetCarbs?: number;        // 目标碳水化合物 (g)
  targetFat?: number;          // 目标脂肪 (g)
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  inviteCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

