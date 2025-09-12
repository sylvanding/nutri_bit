import { useEffect, useMemo } from 'react';
import { useMembershipStore } from '../stores/membershipStore';
import { MembershipTier, PermissionCheckResult } from '../types/membership';

/**
 * 会员权限管理Hook
 * 提供便捷的会员权限检查和状态管理
 */
export const useMembership = () => {
  const {
    userMembership,
    availablePlans,
    upgradeRecommendation,
    showUpgradeModal,
    showMembershipModal,
    selectedPlan,
    isLoading,
    error,
    initializeMembership,
    checkAiRecognitionPermission,
    checkReportGenerationPermission,
    checkRecipeAccess,
    checkAdvancedFeatureAccess,
    incrementAiRecognitionUsage,
    incrementReportGenerationUsage,
    upgradeMembership,
    cancelMembership,
    renewMembership,
    showUpgradePrompt,
    hideUpgradeModal,
    showMembershipCenter,
    hideMembershipModal,
    selectPlan,
    generateUpgradeRecommendation,
    getMembershipStats
  } = useMembershipStore();

  // 初始化会员信息
  useEffect(() => {
    // 在实际应用中，这里应该从用户认证store获取userId
    const userId = 'current_user'; // 暂时使用固定值
    initializeMembership(userId);
  }, [initializeMembership]);

  // 会员状态信息
  const membershipInfo = useMemo(() => {
    if (!userMembership) {
      return {
        tier: MembershipTier.FREE,
        tierName: '基础版',
        isActive: false,
        isPremium: false,
        isVip: false,
        daysUntilExpiry: null,
        features: []
      };
    }

    const stats = getMembershipStats();
    const plan = availablePlans.find(p => p.tier === userMembership.tier);

    return {
      tier: userMembership.tier,
      tierName: plan?.name || '未知',
      isActive: userMembership.status === 'active',
      isPremium: userMembership.tier === MembershipTier.PREMIUM,
      isVip: userMembership.tier === MembershipTier.VIP,
      daysUntilExpiry: stats.daysUntilExpiry,
      features: stats.features,
      usage: stats.monthlyUsage,
      remainingUsage: stats.remainingUsage
    };
  }, [userMembership, availablePlans, getMembershipStats]);

  // 权限检查方法
  const permissions = useMemo(() => ({
    // AI识别权限
    canUseAiRecognition: () => checkAiRecognitionPermission(),
    
    // 报告生成权限
    canGenerateReport: () => checkReportGenerationPermission(),
    
    // 菜谱访问权限
    canAccessRecipe: (recipeId: string) => checkRecipeAccess(recipeId),
    
    // 高级功能权限
    canUseAdvancedFeature: (feature: string) => checkAdvancedFeatureAccess(feature),
    
    // 便捷的布尔检查
    hasUnlimitedAi: membershipInfo.tier !== MembershipTier.FREE,
    hasAdvancedReports: membershipInfo.tier !== MembershipTier.FREE,
    hasAllRecipes: membershipInfo.tier !== MembershipTier.FREE,
    hasAdFree: membershipInfo.tier !== MembershipTier.FREE,
    hasAiPartnerSkins: membershipInfo.tier === MembershipTier.VIP,
    hasVoicePacks: membershipInfo.tier === MembershipTier.VIP,
    hasPrioritySupport: membershipInfo.tier === MembershipTier.VIP,
    hasExpertConsultation: membershipInfo.tier === MembershipTier.VIP
  }), [checkAiRecognitionPermission, checkReportGenerationPermission, checkRecipeAccess, checkAdvancedFeatureAccess, membershipInfo.tier]);

  // 使用记录方法
  const trackUsage = useMemo(() => ({
    recordAiRecognition: incrementAiRecognitionUsage,
    recordReportGeneration: incrementReportGenerationUsage
  }), [incrementAiRecognitionUsage, incrementReportGenerationUsage]);

  // 会员操作方法
  const membershipActions = useMemo(() => ({
    upgrade: upgradeMembership,
    cancel: cancelMembership,
    renew: renewMembership,
    showUpgrade: showUpgradePrompt,
    hideUpgrade: hideUpgradeModal,
    showCenter: showMembershipCenter,
    hideCenter: hideMembershipModal,
    selectPlan,
    generateRecommendation: generateUpgradeRecommendation
  }), [
    upgradeMembership,
    cancelMembership,
    renewMembership,
    showUpgradePrompt,
    hideUpgradeModal,
    showMembershipCenter,
    hideMembershipModal,
    selectPlan,
    generateUpgradeRecommendation
  ]);

  return {
    // 会员信息
    membership: membershipInfo,
    plans: availablePlans,
    recommendation: upgradeRecommendation,
    
    // 界面状态
    ui: {
      showUpgradeModal,
      showMembershipModal,
      selectedPlan,
      isLoading,
      error
    },
    
    // 权限检查
    permissions,
    
    // 使用记录
    usage: trackUsage,
    
    // 会员操作
    actions: membershipActions
  };
};

/**
 * 权限验证Hook
 * 用于特定功能的权限检查
 */
export const usePermission = (
  feature: string,
  options?: {
    autoPromptUpgrade?: boolean;
    redirectOnDenied?: boolean;
  }
) => {
  const { permissions, actions } = useMembership();
  
  const checkPermission = (): PermissionCheckResult => {
    switch (feature) {
      case 'ai_recognition':
        return permissions.canUseAiRecognition();
      case 'report_generation':
        return permissions.canGenerateReport();
      case 'advanced_reports':
        return permissions.canUseAdvancedFeature('advanced_reports');
      case 'custom_nutrition_goals':
        return permissions.canUseAdvancedFeature('custom_nutrition_goals');
      case 'ai_partner_skins':
        return permissions.canUseAdvancedFeature('ai_partner_skins');
      case 'voice_packs':
        return permissions.canUseAdvancedFeature('voice_packs');
      case 'priority_support':
        return permissions.canUseAdvancedFeature('priority_support');
      case 'expert_consultation':
        return permissions.canUseAdvancedFeature('expert_consultation');
      case 'premium_insights':
        return permissions.canUseAdvancedFeature('premium_insights');
      default:
        return { allowed: false, reason: '未知功能' };
    }
  };

  const result = checkPermission();

  // 自动显示升级提示
  useEffect(() => {
    if (!result.allowed && result.upgradeRequired && options?.autoPromptUpgrade) {
      actions.showUpgrade(result.reason);
    }
  }, [result.allowed, result.upgradeRequired, result.reason, options?.autoPromptUpgrade, actions]);

  return {
    allowed: result.allowed,
    reason: result.reason,
    upgradeRequired: result.upgradeRequired,
    currentUsage: result.currentUsage,
    limit: result.limit,
    promptUpgrade: () => actions.showUpgrade(result.reason)
  };
};

/**
 * 会员功能守卫Hook
 * 提供组件级别的会员功能保护
 */
export const useMembershipGuard = () => {
  const { permissions, actions, usage } = useMembership();

  /**
   * 检查功能权限
   * @param feature 功能名称
   */
  const checkFeaturePermission = (feature: string): PermissionCheckResult => {
    switch (feature) {
      case 'ai_recognition':
        return permissions.canUseAiRecognition();
      case 'report_generation':
        return permissions.canGenerateReport();
      case 'advanced_reports':
        return permissions.canUseAdvancedFeature('advanced_reports');
      case 'custom_nutrition_goals':
        return permissions.canUseAdvancedFeature('custom_nutrition_goals');
      case 'ai_partner_skins':
        return permissions.canUseAdvancedFeature('ai_partner_skins');
      case 'voice_packs':
        return permissions.canUseAdvancedFeature('voice_packs');
      case 'priority_support':
        return permissions.canUseAdvancedFeature('priority_support');
      case 'expert_consultation':
        return permissions.canUseAdvancedFeature('expert_consultation');
      case 'premium_insights':
        return permissions.canUseAdvancedFeature('premium_insights');
      default:
        return { allowed: false, reason: '未知功能' };
    }
  };

  /**
   * 执行需要权限的操作
   * @param feature 功能名称
   * @param action 要执行的操作
   * @param options 选项
   */
  const executeWithPermission = async <T>(
    feature: string,
    action: () => Promise<T> | T,
    options?: {
      onDenied?: (reason: string) => void;
      autoPromptUpgrade?: boolean;
    }
  ): Promise<T | null> => {
    const permission = checkFeaturePermission(feature);
    
    if (!permission.allowed) {
      if (options?.onDenied) {
        options.onDenied(permission.reason || '权限不足');
      } else if (permission.upgradeRequired) {
        if (options?.autoPromptUpgrade) {
          actions.showUpgrade(permission.reason);
        }
      }
      return null;
    }

    try {
      const result = await action();
      
      // 记录使用情况
      if (feature === 'ai_recognition') {
        usage.recordAiRecognition();
      } else if (feature === 'report_generation') {
        usage.recordReportGeneration();
      }
      
      return result;
    } catch (error) {
      console.error(`执行功能 ${feature} 时出错:`, error);
      throw error;
    }
  };

  return {
    executeWithPermission,
    checkFeaturePermission,
    permissions,
    actions
  };
};
