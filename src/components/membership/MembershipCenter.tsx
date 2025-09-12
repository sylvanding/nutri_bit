import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Star, 
  Calendar, 
  TrendingUp, 
  Settings, 
  CreditCard, 
  Gift,
  CheckCircle,
  AlertCircle,
  Award,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { useMembership } from '../../hooks/useMembership';
import { MembershipTier, SubscriptionPeriod } from '../../types/membership';
import { UsageMeter, MembershipBadge } from './MembershipGuard';

interface MembershipCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipCenter: React.FC<MembershipCenterProps> = ({ isOpen, onClose }) => {
  const { membership, plans, actions, ui } = useMembership();
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'benefits' | 'billing'>('overview');

  if (!isOpen) return null;

  const currentPlan = plans.find(plan => plan.tier === membership.tier);
  
  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.FREE:
        return '🆓';
      case MembershipTier.PREMIUM:
        return '⭐';
      case MembershipTier.VIP:
        return '👑';
      default:
        return '❓';
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.FREE:
        return 'from-gray-400 to-gray-600';
      case MembershipTier.PREMIUM:
        return 'from-blue-400 to-blue-600';
      case MembershipTier.VIP:
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '永久有效';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const nextTierPlan = plans.find(plan => {
    if (membership.tier === MembershipTier.FREE) return plan.tier === MembershipTier.PREMIUM;
    if (membership.tier === MembershipTier.PREMIUM) return plan.tier === MembershipTier.VIP;
    return null;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className={`bg-gradient-to-r ${getTierColor(membership.tier)} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                {getTierIcon(membership.tier)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentPlan?.name || '会员中心'}</h2>
                <p className="text-white text-opacity-90">{currentPlan?.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 会员状态卡片 */}
          <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-white text-opacity-80">会员状态</div>
                <div className="flex items-center justify-center mt-1">
                  {membership.isActive ? (
                    <>
                      <CheckCircle size={16} className="text-green-300 mr-1" />
                      <span className="font-semibold">活跃</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-300 mr-1" />
                      <span className="font-semibold">已过期</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-white text-opacity-80">到期时间</div>
                <div className="font-semibold mt-1">
                  {membership.daysUntilExpiry !== null 
                    ? `${membership.daysUntilExpiry}天后到期`
                    : '永久有效'
                  }
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-white text-opacity-80">会员等级</div>
                <div className="font-semibold mt-1">{currentPlan?.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '概览', icon: TrendingUp },
              { id: 'usage', label: '使用情况', icon: Calendar },
              { id: 'benefits', label: '会员权益', icon: Gift },
              { id: 'billing', label: '订阅管理', icon: CreditCard }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 快速升级卡片 */}
              {nextTierPlan && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        升级到 {nextTierPlan.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        解锁更多高级功能，享受更完整的体验
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>• 无限AI识别</span>
                        <span>• 高级报告</span>
                        <span>• 专属功能</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">{nextTierPlan.icon}</div>
                      <button
                        onClick={() => actions.showUpgrade()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                      >
                        立即升级
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 使用统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">AI识别使用情况</h4>
                  <UsageMeter feature="ai_recognition" />
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">报告生成使用情况</h4>
                  <UsageMeter feature="report_generation" />
                </div>
              </div>

              {/* 功能亮点 */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">当前可用功能</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPlan?.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* 月度使用统计 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">AI识别</h4>
                    <Zap className="text-blue-500" size={20} />
                  </div>
                  <UsageMeter feature="ai_recognition" />
                  <div className="mt-4 text-sm text-gray-600">
                    <p>本月已使用 {membership.usage?.aiRecognition || 0} 次</p>
                    {membership.remainingUsage?.aiRecognition !== null && (
                      <p>剩余 {membership.remainingUsage.aiRecognition} 次</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">报告生成</h4>
                    <Award className="text-green-500" size={20} />
                  </div>
                  <UsageMeter feature="report_generation" />
                  <div className="mt-4 text-sm text-gray-600">
                    <p>本月已生成 {membership.usage?.reportGeneration || 0} 份报告</p>
                    {membership.remainingUsage?.reportGeneration !== null && (
                      <p>剩余 {membership.remainingUsage.reportGeneration} 份</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 使用建议 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 使用建议</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• 建议每餐都使用AI识别，获得更准确的营养分析</li>
                  <li>• 定期生成报告，跟踪您的健康进展</li>
                  <li>• 升级到会员版可享受无限制使用</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-6">
              {/* 当前权益 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">您当前享有的权益</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPlan?.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 升级权益对比 */}
              {nextTierPlan && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">升级到 {nextTierPlan.name} 可获得</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nextTierPlan.features
                      .filter(feature => !currentPlan?.features.includes(feature))
                      .map((feature, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Star size={16} className="text-blue-500 mr-3" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => actions.showUpgrade()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      立即升级到 {nextTierPlan.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* 订阅信息 */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">订阅信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">当前套餐</label>
                    <div className="font-semibold">{currentPlan?.name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">订阅状态</label>
                    <div className="flex items-center">
                      {membership.isActive ? (
                        <>
                          <CheckCircle size={16} className="text-green-500 mr-1" />
                          <span className="text-green-600 font-semibold">活跃</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-red-500 mr-1" />
                          <span className="text-red-600 font-semibold">已过期</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">到期时间</label>
                    <div className="font-semibold">
                      {membership.daysUntilExpiry !== null 
                        ? `${membership.daysUntilExpiry}天后到期`
                        : '永久有效'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">自动续费</label>
                    <div className="font-semibold">
                      {membership.tier !== MembershipTier.FREE ? '已开启' : '未开启'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 订阅操作 */}
              {membership.tier !== MembershipTier.FREE && (
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">订阅管理</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => actions.renew()}
                      disabled={ui.isLoading}
                      className="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      立即续费
                    </button>
                    
                    <button
                      onClick={() => actions.cancel()}
                      disabled={ui.isLoading}
                      className="w-full md:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors md:ml-3"
                    >
                      取消订阅
                    </button>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p>• 取消订阅后，会员权益将在当前周期结束后停止</p>
                    <p>• 支持7天无理由退款</p>
                  </div>
                </div>
              )}

              {ui.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{ui.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
