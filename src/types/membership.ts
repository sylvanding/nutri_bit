// 会员系统类型定义

export enum MembershipTier {
  FREE = 'free',
  PREMIUM = 'premium', 
  VIP = 'vip'
}

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly', 
  YEARLY = 'yearly'
}

// 会员权益配置
export interface MembershipBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: MembershipTier;
}

// 用户会员信息
export interface UserMembership {
  id: string;
  userId: string;
  tier: MembershipTier;
  status: MembershipStatus;
  startDate: Date;
  endDate: Date | null; // null 表示永久
  autoRenew: boolean;
  subscriptionPeriod?: SubscriptionPeriod;
  // 使用限制跟踪
  usage: {
    aiRecognitionCount: number; // 当月AI识别次数
    lastResetDate: string; // 上次重置日期 (YYYY-MM-DD)
    reportGenerationCount: number; // 当月报告生成次数
  };
  // 会员特权
  features: {
    unlimitedAiRecognition: boolean;
    advancedReports: boolean;
    customNutritionGoals: boolean;
    allRecipeAccess: boolean;
    adFree: boolean;
    aiPartnerSkins: boolean;
    voicePacks: boolean;
    prioritySupport: boolean;
    expertConsultation: boolean;
    premiumInsights: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 会员套餐定义
export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  description: string;
  features: string[];
  pricing: {
    [SubscriptionPeriod.MONTHLY]: number;
    [SubscriptionPeriod.QUARTERLY]: number;
    [SubscriptionPeriod.YEARLY]: number;
  };
  discounts: {
    [SubscriptionPeriod.QUARTERLY]: number; // 折扣百分比
    [SubscriptionPeriod.YEARLY]: number;
  };
  isPopular: boolean;
  color: string; // 主题色
  icon: string;
}

// 会员权限检查结果
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
}

// 会员统计信息
export interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  membershipDistribution: {
    [MembershipTier.FREE]: number;
    [MembershipTier.PREMIUM]: number;
    [MembershipTier.VIP]: number;
  };
  conversionRate: number;
  churnRate: number;
  revenue: {
    monthly: number;
    yearly: number;
  };
}

// 会员操作事件
export interface MembershipEvent {
  id: string;
  userId: string;
  type: 'upgrade' | 'downgrade' | 'renewal' | 'cancellation' | 'feature_unlock';
  fromTier?: MembershipTier;
  toTier: MembershipTier;
  amount?: number;
  period?: SubscriptionPeriod;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// AI识别限制配置
export interface AiRecognitionLimits {
  [MembershipTier.FREE]: number; // 每月免费次数
  [MembershipTier.PREMIUM]: number; // -1 表示无限制
  [MembershipTier.VIP]: number;
}

// 报告生成限制配置
export interface ReportGenerationLimits {
  [MembershipTier.FREE]: number;
  [MembershipTier.PREMIUM]: number;
  [MembershipTier.VIP]: number;
}

// 会员功能访问记录
export interface FeatureUsageRecord {
  id: string;
  userId: string;
  feature: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 会员升级推荐
export interface UpgradeRecommendation {
  currentTier: MembershipTier;
  recommendedTier: MembershipTier;
  reasons: string[];
  benefits: string[];
  estimatedSavings?: number;
  urgency: 'low' | 'medium' | 'high';
}
