import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUltraSimpleGamificationStore } from '../../stores/ultraSimpleGamificationStore';
import { useFoodMapStore } from '../../stores/foodMapStore';
import { autoDiscoverFromMeal } from '../../utils/foodRecognition';
import FoodDiscoveryPrompt from './FoodDiscoveryPrompt';

interface GamificationDemoProps {
  className?: string;
}

const GamificationDemo: React.FC<GamificationDemoProps> = ({ className = '' }) => {
  const [mealInput, setMealInput] = useState('');
  const [showDiscoveryPrompt, setShowDiscoveryPrompt] = useState(false);
  
  const { level, exp, streak, totalMeals, logMeal, dailyCheckIn, canCheckInToday } = useUltraSimpleGamificationStore();
  const { getStats } = useFoodMapStore();
  
  const mapStats = getStats();
  
  // 模拟记录餐食并触发美食发现
  const handleLogMeal = () => {
    if (mealInput.trim()) {
      // 记录餐食
      logMeal();
      
      // 自动发现美食
      const discovered = autoDiscoverFromMeal(mealInput, `meal_${Date.now()}`);
      
      // 如果有发现或输入内容，显示发现提示
      if (discovered.length > 0 || mealInput.trim()) {
        setShowDiscoveryPrompt(true);
      }
      
      // 清空输入
      setMealInput('');
    }
  };
  
  const handleCheckIn = () => {
    if (canCheckInToday()) {
      dailyCheckIn();
    }
  };

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎮 游戏化功能演示</h2>
      
      {/* 当前状态展示 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{level}</div>
          <div className="text-sm text-gray-600">等级</div>
          <div className="text-xs text-gray-500">{exp} XP</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-sm text-gray-600">连击天数</div>
          <div className="text-xs text-gray-500">
            {canCheckInToday() ? '可打卡' : '已打卡'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{totalMeals}</div>
          <div className="text-sm text-gray-600">记录餐数</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{mapStats.totalDiscoveries}</div>
          <div className="text-sm text-gray-600">发现美食</div>
          <div className="text-xs text-gray-500">
            {mapStats.completedMaps}/{mapStats.totalMaps} 地图
          </div>
        </div>
      </div>
      
      {/* 互动演示区域 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🍽️ 试试记录餐食</h3>
        <p className="text-gray-600 mb-4">
          输入您吃的美食，系统会自动识别并解锁相应的美食地图点位！
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              今天吃了什么？
            </label>
            <textarea
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              placeholder="例如：今天吃了北京烤鸭，皮脆肉嫩很好吃..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <motion.button
              onClick={handleLogMeal}
              disabled={!mealInput.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📝 记录餐食
            </motion.button>
            
            <motion.button
              onClick={handleCheckIn}
              disabled={!canCheckInToday()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📅 每日打卡
            </motion.button>
          </div>
        </div>
        
        {/* 示例提示 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 试试这些关键词：</h4>
          <div className="flex flex-wrap gap-2">
            {[
              '北京烤鸭', '四川火锅', '广式点心', '意大利面', 
              '日式寿司', '法式大餐', '藜麦', '牛油果'
            ].map((keyword) => (
              <button
                key={keyword}
                onClick={() => setMealInput(prev => prev + (prev ? '，' : '') + keyword)}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 美食发现提示组件 */}
      {showDiscoveryPrompt && (
        <FoodDiscoveryPrompt
          mealDescription={mealInput}
          mealRecordId={`demo_${Date.now()}`}
          onClose={() => setShowDiscoveryPrompt(false)}
        />
      )}
    </div>
  );
};

export default GamificationDemo;
