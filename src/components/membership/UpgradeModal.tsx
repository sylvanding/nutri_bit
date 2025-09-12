import React, { useState } from 'react';
import { X, Check, Crown, Star, Zap, Shield, Heart, Sparkles } from 'lucide-react';
import { useMembership } from '../../hooks/useMembership';
import { MembershipPlan, SubscriptionPeriod, MembershipTier } from '../../types/membership';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { membership, plans, recommendation, actions, ui } = useMembership();
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(SubscriptionPeriod.YEARLY);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    const success = await actions.upgrade(selectedPlan.id, selectedPeriod);
    if (success) {
      onClose();
    }
  };

  const getPeriodDiscount = (plan: MembershipPlan, period: SubscriptionPeriod) => {
    return plan.discounts[period];
  };

  const getOriginalPrice = (plan: MembershipPlan, period: SubscriptionPeriod) => {
    const monthlyPrice = plan.pricing[SubscriptionPeriod.MONTHLY];
    switch (period) {
      case SubscriptionPeriod.QUARTERLY:
        return monthlyPrice * 3;
      case SubscriptionPeriod.YEARLY:
        return monthlyPrice * 12;
      default:
        return monthlyPrice;
    }
  };

  const formatPrice = (price: number, period: SubscriptionPeriod) => {
    if (price === 0) return '免费';
    
    const unit = period === SubscriptionPeriod.MONTHLY ? '月' : 
                 period === SubscriptionPeriod.QUARTERLY ? '季' : '年';
    return `¥${price}/${unit}`;
  };

  const availablePlans = plans.filter(plan => plan.tier !== membership.tier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">升级到会员版</h2>
            <p className="text-blue-100">解锁更多强大功能，享受完整的健康管理体验</p>
          </div>

          {/* 推荐理由 */}
          {recommendation && (
            <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">为您推荐升级的理由：</h3>
              <ul className="space-y-1">
                {recommendation.reasons.map((reason, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check size={16} className="mr-2 text-green-300" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 订阅周期选择 */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4 text-center">选择订阅周期</h3>
          <div className="flex justify-center space-x-4">
            {[
              { period: SubscriptionPeriod.MONTHLY, label: '月付', desc: '灵活试用' },
              { period: SubscriptionPeriod.QUARTERLY, label: '季付', desc: '小幅优惠' },
              { period: SubscriptionPeriod.YEARLY, label: '年付', desc: '最划算' }
            ].map(({ period, label, desc }) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`relative px-6 py-3 rounded-lg border-2 transition-all ${
                  selectedPeriod === period
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                {period === SubscriptionPeriod.YEARLY && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    最优惠
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 套餐选择 */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-center">选择套餐</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {availablePlans.map((plan) => {
              const originalPrice = getOriginalPrice(plan, selectedPeriod);
              const currentPrice = plan.pricing[selectedPeriod];
              const discount = getPeriodDiscount(plan, selectedPeriod);
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  } ${plan.isPopular ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        最受欢迎
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  {/* 价格 */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      {discount > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                          ¥{originalPrice}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-gray-800">
                        {formatPrice(currentPrice, selectedPeriod)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        节省 {discount}% · 立省 ¥{(originalPrice - currentPrice).toFixed(1)}
                      </div>
                    )}
                    {selectedPeriod !== SubscriptionPeriod.MONTHLY && (
                      <div className="text-xs text-gray-500 mt-1">
                        相当于 ¥{(currentPrice / (selectedPeriod === SubscriptionPeriod.QUARTERLY ? 3 : 12)).toFixed(1)}/月
                      </div>
                    )}
                  </div>

                  {/* 功能列表 */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* 特殊标识 */}
                  {plan.tier === MembershipTier.VIP && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-600">
                      <Crown size={16} />
                      <span className="text-sm font-medium">VIP尊享</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>• 支持7天无理由退款</p>
              <p>• 随时可以取消订阅</p>
            </div>
            
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={handleUpgrade}
                disabled={!selectedPlan || ui.isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {ui.isLoading ? '处理中...' : '立即升级'}
              </button>
            </div>
          </div>

          {ui.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{ui.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
