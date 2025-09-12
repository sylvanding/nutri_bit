import React from 'react';
import { Crown, Star, Zap, Shield, Heart, Brain, Eye, Award } from 'lucide-react';
import { useMembership } from '../../hooks/useMembership';
import { MembershipTier } from '../../types/membership';
import { MembershipGuard, FeatureLocker } from './MembershipGuard';

interface PremiumFeaturesProps {
  className?: string;
}

/**
 * 高级会员专属功能组件
 * 展示和提供VIP用户独有的功能
 */
export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ className }) => {
  const { membership, permissions, actions } = useMembership();

  const premiumFeatures = [
    {
      id: 'ai_partner_skins',
      title: '专属AI伙伴皮肤',
      description: '解锁卡卡的多种可爱皮肤，让你的健康伙伴更个性化',
      icon: '🎭',
      color: 'from-purple-400 to-pink-400',
      requiredTier: MembershipTier.VIP,
      comingSoon: false
    },
    {
      id: 'voice_packs',
      title: '高级语音包',
      description: '多种声音选择，让AI伙伴的声音更符合你的喜好',
      icon: '🎵',
      color: 'from-blue-400 to-cyan-400',
      requiredTier: MembershipTier.VIP,
      comingSoon: false
    },
    {
      id: 'expert_consultation',
      title: '专家营养师咨询',
      description: '一对一专业营养师指导，制定个性化健康方案',
      icon: '👩‍⚕️',
      color: 'from-green-400 to-emerald-400',
      requiredTier: MembershipTier.VIP,
      comingSoon: false
    },
    {
      id: 'premium_insights',
      title: '高级健康洞察',
      description: '基于AI的深度健康分析和预测性建议',
      icon: '🧠',
      color: 'from-orange-400 to-red-400',
      requiredTier: MembershipTier.PREMIUM,
      comingSoon: false
    },
    {
      id: 'micro_nutrition',
      title: '微量元素分析',
      description: '详细的维生素、矿物质摄入分析报告',
      icon: '🔬',
      color: 'from-indigo-400 to-purple-400',
      requiredTier: MembershipTier.VIP,
      comingSoon: false
    },
    {
      id: 'priority_support',
      title: '专属客服支持',
      description: '24/7专属客服，优先响应你的问题和需求',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-400',
      requiredTier: MembershipTier.VIP,
      comingSoon: false
    }
  ];

  const handleFeatureClick = (feature: any) => {
    if (membership.tier === feature.requiredTier || 
        (feature.requiredTier === MembershipTier.PREMIUM && membership.tier === MembershipTier.VIP)) {
      // 用户有权限，执行功能
      console.log(`执行功能: ${feature.title}`);
      // 这里可以添加具体的功能逻辑
    } else {
      // 显示升级提示
      actions.showUpgrade(`需要${feature.requiredTier === MembershipTier.VIP ? 'VIP' : '会员'}权限才能使用${feature.title}`);
    }
  };

  return (
    <div className={`premium-features ${className || ''}`}>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-3">
            <Crown className="text-purple-600" size={20} />
            <span className="text-purple-800 font-semibold">专属功能</span>
          </div>
          <p className="text-gray-600">升级到会员/VIP享受更多高级功能</p>
        </div>

        {/* 功能网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumFeatures.map((feature) => {
            const hasAccess = membership.tier === feature.requiredTier || 
                            (feature.requiredTier === MembershipTier.PREMIUM && membership.tier === MembershipTier.VIP);
            
            return (
              <div
                key={feature.id}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                  hasAccess 
                    ? 'border-green-200 hover:border-green-300 hover:shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleFeatureClick(feature)}
              >
                {/* 状态指示器 */}
                <div className="absolute top-3 right-3">
                  {hasAccess ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <Crown size={14} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* 功能图标 */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-2xl shadow-lg`}>
                  {feature.icon}
                </div>

                {/* 功能信息 */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                    {feature.comingSoon && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                        即将推出
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  {/* 权限要求 */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.requiredTier === MembershipTier.VIP 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {feature.requiredTier === MembershipTier.VIP ? 'VIP专享' : '会员功能'}
                    </span>
                    
                    {!hasAccess && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        立即升级
                      </button>
                    )}
                  </div>
                </div>

                {/* 锁定遮罩 */}
                {!hasAccess && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Crown size={24} className="text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        升级解锁
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 升级卡片 */}
        {membership.tier !== MembershipTier.VIP && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <Crown size={48} className="mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">解锁全部专属功能</h3>
            <p className="text-purple-100 mb-4">
              升级到{membership.tier === MembershipTier.FREE ? '会员版或VIP版' : 'VIP版'}，享受完整的高级功能体验
            </p>
            <button
              onClick={() => actions.showUpgrade()}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              立即升级
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AI伙伴皮肤选择器
 */
export const AiPartnerSkinSelector: React.FC = () => {
  const { permissions } = useMembership();

  const skins = [
    { id: 'default', name: '经典卡卡', preview: '🐾', unlocked: true },
    { id: 'cute', name: '萌萌卡卡', preview: '🥰', unlocked: permissions.hasAiPartnerSkins },
    { id: 'cool', name: '酷炫卡卡', preview: '😎', unlocked: permissions.hasAiPartnerSkins },
    { id: 'elegant', name: '优雅卡卡', preview: '👑', unlocked: permissions.hasAiPartnerSkins },
  ];

  return (
    <MembershipGuard feature="ai_partner_skins">
      <div className="ai-partner-skins p-4">
        <h3 className="text-lg font-semibold mb-4">选择AI伙伴皮肤</h3>
        <div className="grid grid-cols-2 gap-3">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className={`relative p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                skin.unlocked 
                  ? 'border-gray-200 hover:border-blue-300' 
                  : 'border-gray-100 opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{skin.preview}</div>
              <div className="text-sm font-medium">{skin.name}</div>
              {!skin.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-lg">
                  <Crown size={20} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MembershipGuard>
  );
};

/**
 * 高级营养洞察组件
 */
export const PremiumNutritionInsights: React.FC = () => {
  return (
    <FeatureLocker feature="premium_insights">
      <div className="premium-insights bg-white rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="text-purple-600" size={24} />
          <h3 className="text-xl font-semibold">AI健康洞察</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔮 预测性分析</h4>
            <p className="text-blue-700 text-sm">
              基于您的饮食模式，预测未来30天的营养趋势和健康风险
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🎯 个性化建议</h4>
            <p className="text-green-700 text-sm">
              AI根据您的身体数据和目标，提供精准的饮食调整建议
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">📊 深度数据分析</h4>
            <p className="text-orange-700 text-sm">
              详细的营养素吸收分析、代谢效率评估和优化建议
            </p>
          </div>
        </div>
      </div>
    </FeatureLocker>
  );
};
