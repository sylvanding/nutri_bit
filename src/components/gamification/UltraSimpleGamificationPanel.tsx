import React, { useState } from 'react';
import { useUltraSimpleGamificationStore } from '../../stores/ultraSimpleGamificationStore';

interface UltraSimpleGamificationPanelProps {
  className?: string;
}

const UltraSimpleGamificationPanel: React.FC<UltraSimpleGamificationPanelProps> = ({ className = '' }) => {
  const {
    level,
    exp,
    streak,
    totalMeals,
    achievements,
    notifications,
    addExp,
    logMeal,
    increaseStreak,
    clearNotifications,
    getStats
  } = useUltraSimpleGamificationStore();

  const [activeTab, setActiveTab] = useState('overview');

  // 计算下一级所需经验
  const nextLevelExp = level * 100;
  const expProgress = (exp / nextLevelExp) * 100;

  // 成就信息
  const achievementInfo: Record<string, { name: string; description: string; icon: string }> = {
    'first_meal': { name: '第一餐', description: '记录你的第一顿饭', icon: '🍽️' },
    'streak_3': { name: '三日坚持', description: '连续记录3天饮食', icon: '🔥' },
    'streak_7': { name: '一周习惯', description: '连续记录7天饮食', icon: '⭐' },
    'meals_10': { name: '美食探索者', description: '记录10顿不同的饭菜', icon: '🍱' }
  };

  const stats = getStats();

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${className}`}>
      {/* 通知显示 */}
      {notifications.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-blue-800">最新动态</h3>
            <button
              onClick={clearNotifications}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              清除
            </button>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="text-sm text-blue-700">
                {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: '总览', icon: '📊' },
          { id: 'achievements', label: '成就', icon: '🏆' },
          { id: 'stats', label: '统计', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 用户状态卡片 */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Level {level}</h2>
                <p className="text-blue-100">健康生活进行中 ✨</p>
              </div>
              <div className="text-4xl">🏃‍♂️</div>
            </div>

            {/* 经验值进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>经验值</span>
                <span>{exp}/{nextLevelExp}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-sm text-blue-100">连击天数</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm text-blue-100">解锁成就</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMeals}</div>
                <div className="text-sm text-blue-100">记录餐数</div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">快速操作</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={logMeal}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">🍽️</span>
                <span className="text-sm font-medium text-green-700">记录一餐</span>
              </button>

              <button
                onClick={() => addExp(50, '每日奖励')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">🎁</span>
                <span className="text-sm font-medium text-blue-700">每日奖励</span>
              </button>

              <button
                onClick={increaseStreak}
                className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-sm font-medium text-orange-700">增加连击</span>
              </button>

              <button
                onClick={() => addExp(100, '大奖励')}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium text-purple-700">大奖励</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">成就系统</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(achievementInfo).map(([id, info]) => {
              const isUnlocked = achievements.includes(id);
              return (
                <div
                  key={id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isUnlocked
                      ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                      {info.icon}
                    </span>
                    <div>
                      <h3 className={`font-bold ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                        {info.name}
                      </h3>
                      <p className={`text-sm ${isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {info.description}
                      </p>
                      {isUnlocked && (
                        <span className="text-xs text-yellow-500 font-medium">✅ 已解锁</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">数据统计</h2>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.level}</div>
              <div className="text-sm text-gray-600">当前等级</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.exp}</div>
              <div className="text-sm text-gray-600">当前经验</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.streak}</div>
              <div className="text-sm text-gray-600">连击天数</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.achievementCount}</div>
              <div className="text-sm text-gray-600">解锁成就</div>
            </div>
          </div>

          {/* 通知历史 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">通知历史</h3>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800">{notification.message}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">暂无通知</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraSimpleGamificationPanel;
