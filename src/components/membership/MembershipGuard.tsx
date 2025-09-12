import React, { ReactNode } from 'react';
import { useMembership, usePermission } from '../../hooks/useMembership';
import { MembershipTier } from '../../types/membership';

interface MembershipGuardProps {
  children: ReactNode;
  feature?: string;
  tier?: MembershipTier;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

/**
 * 会员功能守卫组件
 * 根据会员等级和功能权限控制子组件的显示
 */
export const MembershipGuard: React.FC<MembershipGuardProps> = ({
  children,
  feature,
  tier,
  fallback,
  showUpgradePrompt = true,
  className
}) => {
  const { membership, actions } = useMembership();
  
  let hasPermission = true;
  let reason = '';

  // 检查会员等级
  if (tier && membership.tier !== tier) {
    hasPermission = false;
    reason = `需要${tier}等级会员`;
  }

  // 检查具体功能权限
  if (feature) {
    const permission = usePermission(feature);
    if (!permission.allowed) {
      hasPermission = false;
      reason = permission.reason || '权限不足';
    }
  }

  // 如果有权限，直接显示子组件
  if (hasPermission) {
    return <>{children}</>;
  }

  // 如果提供了自定义fallback，显示它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 默认的权限提示组件
  return (
    <div className={`membership-guard ${className || ''}`}>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">👑</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          升级解锁更多功能
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {reason}
        </p>
        
        {showUpgradePrompt && (
          <button
            onClick={() => actions.showUpgrade(reason)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
          >
            立即升级
          </button>
        )}
      </div>
    </div>
  );
};

interface FeatureLockerProps {
  feature: string;
  children: ReactNode;
  lockedContent?: ReactNode;
  className?: string;
}

/**
 * 功能锁定组件
 * 为特定功能提供锁定状态的UI
 */
export const FeatureLocker: React.FC<FeatureLockerProps> = ({
  feature,
  children,
  lockedContent,
  className
}) => {
  const permission = usePermission(feature);
  const { actions } = useMembership();

  if (permission.allowed) {
    return <>{children}</>;
  }

  if (lockedContent) {
    return <>{lockedContent}</>;
  }

  return (
    <div className={`feature-locker ${className || ''}`}>
      <div className="relative">
        {/* 模糊的内容预览 */}
        <div className="filter blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        
        {/* 锁定遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center max-w-xs">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-600">🔒</span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {permission.reason}
            </p>
            <button
              onClick={() => permission.promptUpgrade()}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              点击升级
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UsageMeterProps {
  feature: 'ai_recognition' | 'report_generation';
  className?: string;
}

/**
 * 使用量计量器组件
 * 显示功能的使用情况和剩余次数
 */
export const UsageMeter: React.FC<UsageMeterProps> = ({ feature, className }) => {
  const { membership, permissions } = useMembership();
  
  let current = 0;
  let limit = 0;
  let permission;

  if (feature === 'ai_recognition') {
    current = membership.usage?.aiRecognition || 0;
    permission = permissions.canUseAiRecognition();
  } else if (feature === 'report_generation') {
    current = membership.usage?.reportGeneration || 0;
    permission = permissions.canGenerateReport();
  }

  limit = permission.limit || 0;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 100 : Math.min((current / limit) * 100, 100);

  if (isUnlimited) {
    return (
      <div className={`usage-meter ${className || ''}`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">无限制使用</span>
        </div>
      </div>
    );
  }

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`usage-meter ${className || ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">
          本月已使用
        </span>
        <span className="text-xs font-medium text-gray-800">
          {current}/{limit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {percentage >= 80 && (
        <p className="text-xs text-orange-600 mt-1">
          {percentage >= 100 ? '已达使用上限' : '即将达到使用上限'}
        </p>
      )}
    </div>
  );
};

interface MembershipBadgeProps {
  className?: string;
  showTierName?: boolean;
  onClick?: () => void;
}

/**
 * 会员徽章组件
 * 显示用户当前的会员等级
 */
export const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  className,
  showTierName = true,
  onClick
}) => {
  const { membership } = useMembership();

  const getTierConfig = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.FREE:
        return {
          icon: '🆓',
          name: '基础版',
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          textColor: 'text-gray-700'
        };
      case MembershipTier.PREMIUM:
        return {
          icon: '⭐',
          name: '会员版',
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          textColor: 'text-blue-700'
        };
      case MembershipTier.VIP:
        return {
          icon: '👑',
          name: 'VIP版',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          textColor: 'text-yellow-700'
        };
      default:
        return {
          icon: '❓',
          name: '未知',
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getTierConfig(membership.tier);

  return (
    <div
      className={`membership-badge inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium cursor-pointer hover:shadow-md transition-all duration-200 ${config.color} ${className || ''}`}
      onClick={onClick}
    >
      <span className="mr-1">{config.icon}</span>
      {showTierName && <span>{config.name}</span>}
    </div>
  );
};
