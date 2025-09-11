import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUltraSimpleGamificationStore } from '../../stores/ultraSimpleGamificationStore';
import DailyCheckInPanel from './DailyCheckInPanel';
import FoodPassportPanel from './FoodPassportPanel';

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
  const achievementInfo: Record<string, { name: string; description: string; icon: string; category: string }> = {
    // 基础成就
    'first_meal': { name: '第一餐', description: '记录你的第一顿饭', icon: '🍽️', category: '基础' },
    'first_checkin': { name: '初次打卡', description: '完成第一次每日打卡', icon: '📅', category: '基础' },
    
    // 连击成就
    'streak_3': { name: '三日坚持', description: '连续记录3天饮食', icon: '🔥', category: '连击' },
    'streak_7': { name: '一周习惯', description: '连续记录7天饮食', icon: '⭐', category: '连击' },
    'streak_15': { name: '半月达人', description: '连续记录15天饮食', icon: '💪', category: '连击' },
    'streak_30': { name: '月度冠军', description: '连续记录30天饮食', icon: '👑', category: '连击' },
    'streak_60': { name: '钻石坚持', description: '连续记录60天饮食', icon: '💎', category: '连击' },
    'streak_100': { name: '百日传奇', description: '连续记录100天饮食', icon: '🏆', category: '连击' },
    
    // 打卡成就
    'checkin_30': { name: '打卡达人', description: '累计打卡30天', icon: '📆', category: '打卡' },
    'checkin_100': { name: '打卡专家', description: '累计打卡100天', icon: '📊', category: '打卡' },
    
    // 记录成就
    'meals_10': { name: '美食探索者', description: '记录10顿不同的饭菜', icon: '🍱', category: '记录' },
    'meals_50': { name: '美食爱好者', description: '记录50顿不同的饭菜', icon: '🍴', category: '记录' },
    'meals_100': { name: '美食达人', description: '记录100顿不同的饭菜', icon: '🍜', category: '记录' },
    'meals_365': { name: '年度美食家', description: '记录365顿不同的饭菜', icon: '🎯', category: '记录' },
    
    // 历史记录成就
    'longest_streak_10': { name: '坚持不懈', description: '历史最长连击达到10天', icon: '🎖️', category: '历史记录' },
    'longest_streak_30': { name: '意志之王', description: '历史最长连击达到30天', icon: '🎗️', category: '历史记录' },
    'longest_streak_100': { name: '传奇记录', description: '历史最长连击达到100天', icon: '👑', category: '历史记录' }
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
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: '总览', icon: '📊' },
          { id: 'checkin', label: '打卡', icon: '📅' },
          { id: 'foodmap', label: '美食地图', icon: '🗺️' },
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

      {activeTab === 'checkin' && (
        <DailyCheckInPanel className="p-0" />
      )}

      {activeTab === 'foodmap' && (
        <FoodPassportPanel className="p-0" />
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">成就系统</h2>
            <div className="text-sm text-gray-600">
              已解锁 {achievements.length} / {Object.keys(achievementInfo).length}
            </div>
          </div>
          
          {/* 成就统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              Object.values(achievementInfo).reduce((acc, info) => {
                acc[info.category] = (acc[info.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, total]) => {
              const unlocked = Object.entries(achievementInfo)
                .filter(([id, info]) => info.category === category && achievements.includes(id))
                .length;
              
              return (
                <div key={category} className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">{unlocked}</div>
                  <div className="text-sm text-gray-600">{category}</div>
                  <div className="text-xs text-gray-500">{unlocked}/{total}</div>
                </div>
              );
            })}
          </div>

          {/* 按类别分组的成就 */}
          {Object.entries(
            Object.entries(achievementInfo).reduce((acc, [id, info]) => {
              if (!acc[info.category]) acc[info.category] = [];
              acc[info.category].push([id, info]);
              return acc;
            }, {} as Record<string, Array<[string, typeof achievementInfo[string]]>>)
          ).map(([category, categoryAchievements]) => (
            <motion.div
              key={category}
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {category}成就
              </h3>
              
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categoryAchievements.map(([id, info]) => {
                  const isUnlocked = achievements.includes(id);
                  return (
                    <motion.div
                      key={id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ y: -2 }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        <motion.span 
                          className={`text-3xl ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}
                          animate={isUnlocked ? { 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0, -10, 0]
                          } : {}}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                          {info.icon}
                        </motion.span>
                        <div className="flex-1">
                          <h4 className={`font-bold mb-1 ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                            {info.name}
                          </h4>
                          <p className={`text-sm mb-2 ${isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {info.description}
                          </p>
                          {isUnlocked ? (
                            <motion.div
                              className="flex items-center gap-1 text-xs text-yellow-600 font-medium"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              已解锁
                            </motion.div>
                          ) : (
                            <div className="text-xs text-gray-400">未解锁</div>
                          )}
                        </div>
                      </div>
                      
                      {/* 解锁特效 */}
                      {isUnlocked && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)'
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">数据统计</h2>
          
          {/* 主要统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-600">{stats.level}</div>
              <div className="text-sm text-blue-700">当前等级</div>
              <div className="text-xs text-blue-500">{stats.exp}/{level * 100} EXP</div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-green-600">{stats.streak}</div>
              <div className="text-sm text-green-700">当前连击</div>
              <div className="text-xs text-green-500">最长: {stats.longestStreak} 天</div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-orange-600">{stats.totalCheckIns}</div>
              <div className="text-sm text-orange-700">总打卡数</div>
              <div className="text-xs text-orange-500">
                {stats.canCheckInToday ? '今日未打卡' : '今日已打卡'}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-purple-600">{stats.achievementCount}</div>
              <div className="text-sm text-purple-700">解锁成就</div>
              <div className="text-xs text-purple-500">
                {((stats.achievementCount / Object.keys(achievementInfo).length) * 100).toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 记录统计 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">记录统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">总记录餐数</span>
                  <span className="font-bold text-gray-800">{stats.totalMeals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">今日记录餐数</span>
                  <span className="font-bold text-gray-800">{stats.todayMealsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均每日记录</span>
                  <span className="font-bold text-gray-800">
                    {stats.totalCheckIns > 0 ? (stats.totalMeals / stats.totalCheckIns).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* 连击统计 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">连击统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">当前连击</span>
                  <span className="font-bold text-orange-600">{stats.streak} 天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">历史最长连击</span>
                  <span className="font-bold text-red-600">{stats.longestStreak} 天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">连击成功率</span>
                  <span className="font-bold text-green-600">
                    {stats.totalCheckIns > 0 ? ((stats.streak / stats.totalCheckIns) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
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
