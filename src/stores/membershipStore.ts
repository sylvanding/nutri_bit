import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import {
  MembershipTier,
  MembershipStatus,
  SubscriptionPeriod,
  UserMembership,
  MembershipPlan,
  PermissionCheckResult,
  AiRecognitionLimits,
  ReportGenerationLimits,
  MembershipEvent,
  UpgradeRecommendation
} from '../types/membership';

// 会员配置常量
const AI_RECOGNITION_LIMITS: AiRecognitionLimits = {
  [MembershipTier.FREE]: 10, // 免费版每月10次
  [MembershipTier.PREMIUM]: -1, // 无限制
  [MembershipTier.VIP]: -1, // 无限制
};

const REPORT_GENERATION_LIMITS: ReportGenerationLimits = {
  [MembershipTier.FREE]: 3, // 免费版每月3份报告
  [MembershipTier.PREMIUM]: 20, // 会员版每月20份
  [MembershipTier.VIP]: -1, // VIP无限制
};

// 会员套餐配置
const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    tier: MembershipTier.FREE,
    name: '基础版',
    description: '免费体验核心功能',
    features: [
      '每月10次AI识别',
      '基础营养记录',
      '每日营养简报',
      '基础数据统计',
      '社区互动'
    ],
    pricing: {
      [SubscriptionPeriod.MONTHLY]: 0,
      [SubscriptionPeriod.QUARTERLY]: 0,
      [SubscriptionPeriod.YEARLY]: 0,
    },
    discounts: {
      [SubscriptionPeriod.QUARTERLY]: 0,
      [SubscriptionPeriod.YEARLY]: 0,
    },
    isPopular: false,
    color: '#6B7280',
    icon: '🆓'
  },
  {
    id: 'premium',
    tier: MembershipTier.PREMIUM,
    name: '会员版',
    description: '解锁全部核心功能',
    features: [
      '无限次AI识别',
      '高级数据报告',
      '智能配餐建议',
      '全部AI标准菜谱',
      '无广告体验',
      'AI伙伴卡卡',
      '营养趋势分析',
      '个性化目标设定'
    ],
    pricing: {
      [SubscriptionPeriod.MONTHLY]: 19,
      [SubscriptionPeriod.QUARTERLY]: 49,
      [SubscriptionPeriod.YEARLY]: 159,
    },
    discounts: {
      [SubscriptionPeriod.QUARTERLY]: 16, // 季度版优惠16%
      [SubscriptionPeriod.YEARLY]: 33, // 年度版优惠33%
    },
    isPopular: true,
    color: '#3B82F6',
    icon: '⭐'
  },
  {
    id: 'vip',
    tier: MembershipTier.VIP,
    name: 'VIP版',
    description: '专享尊贵服务体验',
    features: [
      '会员版全部功能',
      '专属AI伙伴皮肤',
      '高级语音包',
      '无限报告生成',
      '专家营养师咨询',
      '专属客服支持',
      '高级微量元素分析',
      '个性化健康方案',
      '优先新功能体验',
      '专属会员徽章'
    ],
    pricing: {
      [SubscriptionPeriod.MONTHLY]: 39,
      [SubscriptionPeriod.QUARTERLY]: 99,
      [SubscriptionPeriod.YEARLY]: 299,
    },
    discounts: {
      [SubscriptionPeriod.QUARTERLY]: 16,
      [SubscriptionPeriod.YEARLY]: 37,
    },
    isPopular: false,
    color: '#F59E0B',
    icon: '👑'
  }
];

interface MembershipState {
  // 用户会员信息
  userMembership: UserMembership | null;
  // 可用套餐
  availablePlans: MembershipPlan[];
  // 会员事件记录
  membershipEvents: MembershipEvent[];
  // 升级推荐
  upgradeRecommendation: UpgradeRecommendation | null;
  // 界面状态
  showUpgradeModal: boolean;
  showMembershipModal: boolean;
  selectedPlan: MembershipPlan | null;
  // 加载状态
  isLoading: boolean;
  error: string | null;
}

interface MembershipActions {
  // 初始化会员信息
  initializeMembership: (userId: string) => void;
  // 权限检查
  checkAiRecognitionPermission: () => PermissionCheckResult;
  checkReportGenerationPermission: () => PermissionCheckResult;
  checkRecipeAccess: (recipeId: string) => PermissionCheckResult;
  checkAdvancedFeatureAccess: (feature: string) => PermissionCheckResult;
  // 使用计数
  incrementAiRecognitionUsage: () => void;
  incrementReportGenerationUsage: () => void;
  resetMonthlyUsage: () => void;
  // 会员操作
  upgradeMembership: (planId: string, period: SubscriptionPeriod) => Promise<boolean>;
  cancelMembership: () => Promise<boolean>;
  renewMembership: () => Promise<boolean>;
  // 界面控制
  showUpgradePrompt: (reason?: string) => void;
  hideUpgradeModal: () => void;
  showMembershipCenter: () => void;
  hideMembershipModal: () => void;
  selectPlan: (plan: MembershipPlan) => void;
  // 推荐系统
  generateUpgradeRecommendation: () => void;
  // 统计信息
  getMembershipStats: () => {
    currentTier: MembershipTier;
    daysUntilExpiry: number | null;
    monthlyUsage: {
      aiRecognition: number;
      reportGeneration: number;
    };
    remainingUsage: {
      aiRecognition: number | null; // null 表示无限制
      reportGeneration: number | null;
    };
    features: string[];
  };
}

type MembershipStore = MembershipState & MembershipActions;

// 获取当前月份的字符串
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

// 检查是否需要重置月度使用量
const shouldResetMonthlyUsage = (lastResetDate: string): boolean => {
  const currentMonth = getCurrentMonth();
  return lastResetDate !== currentMonth;
};

// 创建默认的免费会员信息
const createDefaultMembership = (userId: string): UserMembership => ({
  id: `membership_${userId}_${Date.now()}`,
  userId,
  tier: MembershipTier.FREE,
  status: MembershipStatus.ACTIVE,
  startDate: new Date(),
  endDate: null,
  autoRenew: false,
  usage: {
    aiRecognitionCount: 0,
    lastResetDate: getCurrentMonth(),
    reportGenerationCount: 0,
  },
  features: {
    unlimitedAiRecognition: false,
    advancedReports: false,
    customNutritionGoals: false,
    allRecipeAccess: false,
    adFree: false,
    aiPartnerSkins: false,
    voicePacks: false,
    prioritySupport: false,
    expertConsultation: false,
    premiumInsights: false,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useMembershipStore = create<MembershipStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // 初始状态
      userMembership: null,
      availablePlans: MEMBERSHIP_PLANS,
      membershipEvents: [],
      upgradeRecommendation: null,
      showUpgradeModal: false,
      showMembershipModal: false,
      selectedPlan: null,
      isLoading: false,
      error: null,

      // 初始化会员信息
      initializeMembership: (userId: string) => {
        const state = get();
        console.log('初始化会员信息 - 用户ID:', userId, '当前会员信息:', state.userMembership);
        if (!state.userMembership) {
          const defaultMembership = createDefaultMembership(userId);
          console.log('创建默认会员信息:', defaultMembership);
          set({ userMembership: defaultMembership });
        } else {
          // 检查是否需要重置月度使用量
          if (shouldResetMonthlyUsage(state.userMembership.usage.lastResetDate)) {
            console.log('重置月度使用量');
            get().resetMonthlyUsage();
          }
        }
      },

      // AI识别权限检查
      checkAiRecognitionPermission: () => {
        const state = get();
        const membership = state.userMembership;
        
        console.log('检查AI识别权限 - 会员信息:', membership);
        
        if (!membership) {
          console.log('权限检查失败: 未找到会员信息');
          return { allowed: false, reason: '未找到会员信息' };
        }

        // 检查会员状态
        if (membership.status !== MembershipStatus.ACTIVE) {
          console.log('权限检查失败: 会员状态不活跃', membership.status);
          return { 
            allowed: false, 
            reason: '会员已过期',
            upgradeRequired: true 
          };
        }

        // 检查是否需要重置月度使用量
        if (shouldResetMonthlyUsage(membership.usage.lastResetDate)) {
          console.log('重置月度使用量');
          get().resetMonthlyUsage();
        }

        const limit = AI_RECOGNITION_LIMITS[membership.tier];
        console.log('AI识别限制:', { tier: membership.tier, limit, currentUsage: membership.usage.aiRecognitionCount });
        
        // 无限制
        if (limit === -1) {
          console.log('AI识别权限通过: 无限制');
          return { allowed: true };
        }

        // 检查使用次数
        if (membership.usage.aiRecognitionCount >= limit) {
          console.log('AI识别权限被拒绝: 使用次数已达上限');
          return {
            allowed: false,
            reason: `本月AI识别次数已用完 (${membership.usage.aiRecognitionCount}/${limit})`,
            upgradeRequired: true,
            currentUsage: membership.usage.aiRecognitionCount,
            limit
          };
        }

        console.log('AI识别权限通过');
        return { 
          allowed: true,
          currentUsage: membership.usage.aiRecognitionCount,
          limit
        };
      },

      // 报告生成权限检查
      checkReportGenerationPermission: () => {
        const state = get();
        const membership = state.userMembership;
        
        if (!membership) {
          return { allowed: false, reason: '未找到会员信息' };
        }

        if (membership.status !== MembershipStatus.ACTIVE) {
          return { 
            allowed: false, 
            reason: '会员已过期',
            upgradeRequired: true 
          };
        }

        if (shouldResetMonthlyUsage(membership.usage.lastResetDate)) {
          get().resetMonthlyUsage();
        }

        const limit = REPORT_GENERATION_LIMITS[membership.tier];
        
        if (limit === -1) {
          return { allowed: true };
        }

        if (membership.usage.reportGenerationCount >= limit) {
          return {
            allowed: false,
            reason: `本月报告生成次数已用完 (${membership.usage.reportGenerationCount}/${limit})`,
            upgradeRequired: true,
            currentUsage: membership.usage.reportGenerationCount,
            limit
          };
        }

        return { 
          allowed: true,
          currentUsage: membership.usage.reportGenerationCount,
          limit
        };
      },

      // 菜谱访问权限检查
      checkRecipeAccess: (recipeId: string) => {
        const state = get();
        const membership = state.userMembership;
        
        if (!membership) {
          return { allowed: false, reason: '未找到会员信息' };
        }

        if (membership.status !== MembershipStatus.ACTIVE) {
          return { 
            allowed: false, 
            reason: '会员已过期',
            upgradeRequired: true 
          };
        }

        // 免费版用户只能访问部分菜谱
        if (membership.tier === MembershipTier.FREE) {
          // 这里可以根据菜谱ID判断是否为免费菜谱
          // 暂时假设所有菜谱都需要会员
          return {
            allowed: false,
            reason: '该菜谱需要会员权限',
            upgradeRequired: true
          };
        }

        return { allowed: true };
      },

      // 高级功能访问权限检查
      checkAdvancedFeatureAccess: (feature: string) => {
        const state = get();
        const membership = state.userMembership;
        
        if (!membership) {
          return { allowed: false, reason: '未找到会员信息' };
        }

        if (membership.status !== MembershipStatus.ACTIVE) {
          return { 
            allowed: false, 
            reason: '会员已过期',
            upgradeRequired: true 
          };
        }

        // 根据功能名称检查权限
        const featureMap: Record<string, keyof UserMembership['features']> = {
          'advanced_reports': 'advancedReports',
          'custom_nutrition_goals': 'customNutritionGoals',
          'ai_partner_skins': 'aiPartnerSkins',
          'voice_packs': 'voicePacks',
          'priority_support': 'prioritySupport',
          'expert_consultation': 'expertConsultation',
          'premium_insights': 'premiumInsights',
        };

        const featureKey = featureMap[feature];
        if (!featureKey) {
          return { allowed: false, reason: '未知功能' };
        }

        if (!membership.features[featureKey]) {
          return {
            allowed: false,
            reason: '该功能需要升级会员',
            upgradeRequired: true
          };
        }

        return { allowed: true };
      },

      // 增加AI识别使用次数
      incrementAiRecognitionUsage: () => {
        set((state) => {
          if (!state.userMembership) return state;

          const updatedMembership = {
            ...state.userMembership,
            usage: {
              ...state.userMembership.usage,
              aiRecognitionCount: state.userMembership.usage.aiRecognitionCount + 1
            },
            updatedAt: new Date()
          };

          return { userMembership: updatedMembership };
        });
      },

      // 增加报告生成使用次数
      incrementReportGenerationUsage: () => {
        set((state) => {
          if (!state.userMembership) return state;

          const updatedMembership = {
            ...state.userMembership,
            usage: {
              ...state.userMembership.usage,
              reportGenerationCount: state.userMembership.usage.reportGenerationCount + 1
            },
            updatedAt: new Date()
          };

          return { userMembership: updatedMembership };
        });
      },

      // 重置月度使用量
      resetMonthlyUsage: () => {
        set((state) => {
          if (!state.userMembership) return state;

          const updatedMembership = {
            ...state.userMembership,
            usage: {
              aiRecognitionCount: 0,
              reportGenerationCount: 0,
              lastResetDate: getCurrentMonth()
            },
            updatedAt: new Date()
          };

          return { userMembership: updatedMembership };
        });
      },

      // 升级会员
      upgradeMembership: async (planId: string, period: SubscriptionPeriod) => {
        const state = get();
        const plan = state.availablePlans.find(p => p.id === planId);
        
        if (!plan || !state.userMembership) {
          return false;
        }

        try {
          set({ isLoading: true, error: null });

          // 这里应该调用支付API
          // const paymentResult = await paymentService.processPurchase(plan, period);
          
          // 模拟支付成功
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 更新会员信息
          const endDate = new Date();
          if (period === SubscriptionPeriod.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (period === SubscriptionPeriod.QUARTERLY) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (period === SubscriptionPeriod.YEARLY) {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const updatedMembership: UserMembership = {
            ...state.userMembership,
            tier: plan.tier,
            status: MembershipStatus.ACTIVE,
            endDate,
            subscriptionPeriod: period,
            autoRenew: true,
            features: {
              unlimitedAiRecognition: plan.tier !== MembershipTier.FREE,
              advancedReports: plan.tier !== MembershipTier.FREE,
              customNutritionGoals: plan.tier !== MembershipTier.FREE,
              allRecipeAccess: plan.tier !== MembershipTier.FREE,
              adFree: plan.tier !== MembershipTier.FREE,
              aiPartnerSkins: plan.tier === MembershipTier.VIP,
              voicePacks: plan.tier === MembershipTier.VIP,
              prioritySupport: plan.tier === MembershipTier.VIP,
              expertConsultation: plan.tier === MembershipTier.VIP,
              premiumInsights: plan.tier === MembershipTier.VIP,
            },
            updatedAt: new Date()
          };

          // 添加升级事件
          const event: MembershipEvent = {
            id: `event_${Date.now()}`,
            userId: state.userMembership.userId,
            type: 'upgrade',
            fromTier: state.userMembership.tier,
            toTier: plan.tier,
            amount: plan.pricing[period],
            period,
            timestamp: new Date(),
          };

          set({
            userMembership: updatedMembership,
            membershipEvents: [event, ...state.membershipEvents],
            isLoading: false,
            showUpgradeModal: false,
            upgradeRecommendation: null
          });

          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '升级失败' 
          });
          return false;
        }
      },

      // 取消会员
      cancelMembership: async () => {
        const state = get();
        if (!state.userMembership) return false;

        try {
          set({ isLoading: true, error: null });

          // 这里应该调用取消订阅API
          await new Promise(resolve => setTimeout(resolve, 1000));

          const updatedMembership: UserMembership = {
            ...state.userMembership,
            status: MembershipStatus.CANCELLED,
            autoRenew: false,
            updatedAt: new Date()
          };

          const event: MembershipEvent = {
            id: `event_${Date.now()}`,
            userId: state.userMembership.userId,
            type: 'cancellation',
            toTier: state.userMembership.tier,
            timestamp: new Date(),
          };

          set({
            userMembership: updatedMembership,
            membershipEvents: [event, ...state.membershipEvents],
            isLoading: false
          });

          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '取消失败' 
          });
          return false;
        }
      },

      // 续费会员
      renewMembership: async () => {
        const state = get();
        if (!state.userMembership || !state.userMembership.subscriptionPeriod) {
          return false;
        }

        const plan = state.availablePlans.find(p => p.tier === state.userMembership?.tier);
        if (!plan) return false;

        return get().upgradeMembership(plan.id, state.userMembership.subscriptionPeriod);
      },

      // 显示升级提示
      showUpgradePrompt: (reason?: string) => {
        get().generateUpgradeRecommendation();
        set({ showUpgradeModal: true });
      },

      // 隐藏升级模态框
      hideUpgradeModal: () => {
        set({ showUpgradeModal: false, selectedPlan: null });
      },

      // 显示会员中心
      showMembershipCenter: () => {
        set({ showMembershipModal: true });
      },

      // 隐藏会员模态框
      hideMembershipModal: () => {
        set({ showMembershipModal: false, selectedPlan: null });
      },

      // 选择套餐
      selectPlan: (plan: MembershipPlan) => {
        set({ selectedPlan: plan });
      },

      // 生成升级推荐
      generateUpgradeRecommendation: () => {
        const state = get();
        const membership = state.userMembership;
        
        if (!membership || membership.tier === MembershipTier.VIP) {
          return;
        }

        const currentTier = membership.tier;
        const recommendedTier = currentTier === MembershipTier.FREE 
          ? MembershipTier.PREMIUM 
          : MembershipTier.VIP;

        const reasons: string[] = [];
        const benefits: string[] = [];

        if (currentTier === MembershipTier.FREE) {
          // 分析免费用户的使用情况
          const aiUsageRate = membership.usage.aiRecognitionCount / AI_RECOGNITION_LIMITS[MembershipTier.FREE];
          const reportUsageRate = membership.usage.reportGenerationCount / REPORT_GENERATION_LIMITS[MembershipTier.FREE];

          if (aiUsageRate > 0.8) {
            reasons.push('AI识别次数即将用完');
            benefits.push('无限次AI识别');
          }

          if (reportUsageRate > 0.8) {
            reasons.push('报告生成次数即将用完');
            benefits.push('更多高级报告');
          }

          benefits.push('全部AI标准菜谱', '无广告体验', 'AI伙伴卡卡');
        } else {
          // Premium用户升级到VIP
          reasons.push('解锁专属VIP功能');
          benefits.push('专属AI伙伴皮肤', '高级语音包', '专家营养师咨询');
        }

        const recommendation: UpgradeRecommendation = {
          currentTier,
          recommendedTier,
          reasons,
          benefits,
          urgency: 'medium'
        };

        set({ upgradeRecommendation: recommendation });
      },

      // 获取会员统计信息
      getMembershipStats: () => {
        const state = get();
        const membership = state.userMembership;
        
        if (!membership) {
          return {
            currentTier: MembershipTier.FREE,
            daysUntilExpiry: null,
            monthlyUsage: { aiRecognition: 0, reportGeneration: 0 },
            remainingUsage: { aiRecognition: 10, reportGeneration: 3 },
            features: []
          };
        }

        // 计算到期天数
        let daysUntilExpiry: number | null = null;
        if (membership.endDate) {
          const now = new Date();
          const expiry = new Date(membership.endDate);
          daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        // 计算剩余使用量
        const aiLimit = AI_RECOGNITION_LIMITS[membership.tier];
        const reportLimit = REPORT_GENERATION_LIMITS[membership.tier];

        const remainingUsage = {
          aiRecognition: aiLimit === -1 ? null : Math.max(0, aiLimit - membership.usage.aiRecognitionCount),
          reportGeneration: reportLimit === -1 ? null : Math.max(0, reportLimit - membership.usage.reportGenerationCount)
        };

        // 获取可用功能列表
        const features = Object.entries(membership.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature, _]) => feature);

        return {
          currentTier: membership.tier,
          daysUntilExpiry,
          monthlyUsage: {
            aiRecognition: membership.usage.aiRecognitionCount,
            reportGeneration: membership.usage.reportGenerationCount
          },
          remainingUsage,
          features
        };
      }
    })),
    {
      name: 'membership-storage',
      partialize: (state) => ({
        userMembership: state.userMembership,
        membershipEvents: state.membershipEvents.slice(0, 50), // 只保存最近50条事件
      }),
    }
  )
);
