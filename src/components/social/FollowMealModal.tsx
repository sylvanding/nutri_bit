import React, { useState } from 'react';
import { X, Clock, ShoppingBag, Utensils, ChefHat, Check, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { Post, DeliveryType, PortionSize, DeliveryTimeSlot, FollowMealOption } from '../../types/social';

interface FollowMealModalProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onConfirm: (order: {
    postId: string;
    deliveryType: DeliveryType;
    portionSize: PortionSize;
    deliveryTimeSlot: DeliveryTimeSlot;
    price: number;
    specialInstructions?: string;
  }) => void;
}

export const FollowMealModal: React.FC<FollowMealModalProps> = ({
  isOpen,
  post,
  onClose,
  onConfirm
}) => {
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<DeliveryType>('fresh-pack');
  const [selectedPortion, setSelectedPortion] = useState<PortionSize>('1-person');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<DeliveryTimeSlot | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: 选择配送类型, 2: 选择份量和时间, 3: 确认订单

  if (!isOpen || !post.followMealInfo) return null;

  const { followMealInfo } = post;

  // 配送时段选项
  const timeSlots: DeliveryTimeSlot[] = [
    { id: 'slot-1', label: '今天 18:00-20:00', startTime: '18:00', endTime: '20:00', available: true },
    { id: 'slot-2', label: '明天 11:00-13:00', startTime: '11:00', endTime: '13:00', available: true },
    { id: 'slot-3', label: '明天 18:00-20:00', startTime: '18:00', endTime: '20:00', available: true },
    { id: 'slot-4', label: '后天 11:00-13:00', startTime: '11:00', endTime: '13:00', available: false },
  ];

  // 份量配置
  const portionConfigs: Record<PortionSize, { label: string; multiplier: number; icon: string }> = {
    '1-person': { label: '1人份', multiplier: 1, icon: '👤' },
    '2-person': { label: '2人份', multiplier: 1.8, icon: '👥' },
    '4-person': { label: '4人份', multiplier: 3.2, icon: '👨‍👩‍👧‍👦' }
  };

  // 获取当前选中的配送选项
  const selectedOption = followMealInfo.options.find(opt => opt.type === selectedDeliveryType);
  
  // 计算价格
  const calculatePrice = () => {
    if (!selectedOption) return 0;
    return Math.round(selectedOption.basePrice * portionConfigs[selectedPortion].multiplier * 100) / 100;
  };

  // 难度配置
  const difficultyConfig = {
    easy: { label: '简单', color: 'text-green-600', bgColor: 'bg-green-50' },
    medium: { label: '中等', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    hard: { label: '困难', color: 'text-red-600', bgColor: 'bg-red-50' }
  };

  const handleConfirm = () => {
    if (!selectedTimeSlot) {
      alert('请选择配送时间');
      return;
    }

    onConfirm({
      postId: post.id,
      deliveryType: selectedDeliveryType,
      portionSize: selectedPortion,
      deliveryTimeSlot: selectedTimeSlot,
      price: calculatePrice(),
      specialInstructions: specialInstructions || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Utensils className="text-blue-600" />
              一键跟吃
            </h2>
            <p className="text-sm text-gray-600 mt-1">@{post.author.username} 的健康餐</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* 进度指示器 */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">
                    {step === 1 ? '选择类型' : step === 2 ? '份量时间' : '确认订单'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* 餐食信息 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <div className="flex gap-4">
              {post.media[0] && (
                <img
                  src={post.media[0].url}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">{post.content.slice(0, 50)}...</h3>
                {post.nutrition && (
                  <div className="flex gap-3 text-xs text-gray-600">
                    <span>🔥 {post.nutrition.calories} kcal</span>
                    <span>🥩 {post.nutrition.protein}g 蛋白质</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  {followMealInfo.difficulty && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        difficultyConfig[followMealInfo.difficulty].bgColor
                      } ${difficultyConfig[followMealInfo.difficulty].color}`}
                    >
                      {difficultyConfig[followMealInfo.difficulty].label}
                    </span>
                  )}
                  {followMealInfo.cookingTime && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      <Clock size={12} className="inline mr-1" />
                      {followMealInfo.cookingTime}分钟
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 步骤1: 选择配送类型 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">选择配送方式</h3>
              <div className="space-y-3">
                {followMealInfo.options.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedDeliveryType(option.type)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDeliveryType === option.type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{option.icon}</span>
                          <h4 className="font-semibold text-gray-800">{option.name}</h4>
                          {option.preparationTime && (
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                              {option.preparationTime}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        <div className="space-y-1">
                          {option.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <Check size={14} className="text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          ¥{option.basePrice}
                        </div>
                        <div className="text-xs text-gray-500">起</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-6"
              >
                下一步
              </button>
            </div>
          )}

          {/* 步骤2: 选择份量和时间 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* 份量选择 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">选择份量</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(portionConfigs).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPortion(key as PortionSize)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPortion === key
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{config.icon}</div>
                      <div className="font-semibold text-gray-800">{config.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ¥{selectedOption ? Math.round(selectedOption.basePrice * config.multiplier * 100) / 100 : 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 配送时间选择 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  选择配送时间
                </h3>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedTimeSlot(slot)}
                      disabled={!slot.available}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        selectedTimeSlot?.id === slot.id
                          ? 'border-blue-600 bg-blue-50'
                          : slot.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{slot.label}</span>
                        {!slot.available && (
                          <span className="text-xs text-gray-500">已约满</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 特殊说明 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  特殊说明（选填）
                </h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="如有特殊要求，请在此说明（如忌口、过敏等）"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {/* 步骤3: 确认订单 */}
          {currentStep === 3 && selectedOption && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">确认订单信息</h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">配送方式</span>
                  <span className="font-semibold text-gray-800">
                    {selectedOption.icon} {selectedOption.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">份量</span>
                  <span className="font-semibold text-gray-800">
                    {portionConfigs[selectedPortion].icon} {portionConfigs[selectedPortion].label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">配送时间</span>
                  <span className="font-semibold text-gray-800">{selectedTimeSlot?.label}</span>
                </div>
                {specialInstructions && (
                  <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                    <span className="text-gray-600">特殊说明</span>
                    <span className="font-medium text-gray-800 text-right max-w-[200px]">
                      {specialInstructions}
                    </span>
                  </div>
                )}
              </div>

              {/* 价格明细 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">商品价格</span>
                  <span className="text-gray-800">¥{calculatePrice()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">配送费</span>
                  <span className="text-green-600 font-medium">免费</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">合计</span>
                    <span className="text-2xl font-bold text-blue-600">¥{calculatePrice()}</span>
                  </div>
                </div>
              </div>

              {/* 温馨提示 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">温馨提示</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 餐食送达后，营养数据将自动同步到您的营养记录</li>
                  <li>• 请确保配送地址和联系方式正确</li>
                  <li>• 如有问题，可联系客服：400-888-8888</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  返回修改
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  确认下单
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        {followMealInfo.followCount > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              已有 <span className="font-semibold text-blue-600">{followMealInfo.followCount}</span> 人跟吃此餐
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

