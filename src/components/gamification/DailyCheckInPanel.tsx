import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, Gift, CheckCircle, TrendingUp } from 'lucide-react';
import { useUltraSimpleGamificationStore } from '../../stores/ultraSimpleGamificationStore';
import clsx from 'clsx';

interface DailyCheckInPanelProps {
  className?: string;
}

const DailyCheckInPanel: React.FC<DailyCheckInPanelProps> = ({ className = '' }) => {
  const {
    streak,
    longestStreak,
    totalCheckIns,
    lastCheckInDate,
    dailyCheckIn,
    canCheckInToday,
    getStreakRewards,
    claimStreakReward,
    checkInHistory
  } = useUltraSimpleGamificationStore();

  const [showRewards, setShowRewards] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const canCheckIn = canCheckInToday();
  const streakRewards = getStreakRewards();
  const availableRewards = streakRewards.filter(r => r.unlocked);

  // 处理打卡
  const handleCheckIn = async () => {
    if (!canCheckIn || isCheckingIn) return;
    
    setIsCheckingIn(true);
    try {
      dailyCheckIn();
      // 添加一些视觉反馈延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // 获取最近7天的打卡记录
  const getRecentCheckIns = () => {
    const today = new Date();
    const recent = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = checkInHistory.find(h => h.date === dateStr);
      
      recent.push({
        date: dateStr,
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        checked: !!checkIn,
        isToday: i === 0
      });
    }
    
    return recent;
  };

  const recentCheckIns = getRecentCheckIns();

  return (
    <div className={clsx('w-full max-w-4xl mx-auto p-6 space-y-6', className)}>
      {/* 主要打卡区域 */}
      <motion.div
        className="bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 rounded-2xl p-8 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-4 right-4 text-6xl opacity-20">🔥</div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">每日打卡</h2>
              <p className="text-orange-100">坚持记录，养成健康习惯</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-6 h-6" />
                <span className="text-2xl font-bold">{streak}</span>
              </div>
              <p className="text-sm text-orange-100">连续天数</p>
            </div>
          </div>

          {/* 打卡按钮 */}
          <div className="flex items-center justify-center mb-6">
            <motion.button
              className={clsx(
                'relative w-24 h-24 rounded-full border-4 border-white font-bold text-lg transition-all duration-300',
                canCheckIn
                  ? 'bg-white text-orange-500 hover:bg-orange-50 hover:scale-105 shadow-xl'
                  : 'bg-green-500 text-white cursor-not-allowed opacity-75'
              )}
              onClick={handleCheckIn}
              disabled={!canCheckIn || isCheckingIn}
              whileHover={canCheckIn ? { scale: 1.05 } : {}}
              whileTap={canCheckIn ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {isCheckingIn ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center justify-center"
                  >
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                ) : canCheckIn ? (
                  <motion.div
                    key="checkin"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    打卡
                  </motion.div>
                ) : (
                  <motion.div
                    key="checked"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 成功打卡的粒子效果 */}
              {!canCheckIn && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      animate={{
                        x: [0, (Math.cos(i * 45 * Math.PI / 180) * 50)],
                        y: [0, (Math.sin(i * 45 * Math.PI / 180) * 50)],
                        opacity: [1, 0],
                        scale: [1, 0]
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalCheckIns}</div>
              <div className="text-sm text-orange-100">总打卡</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-sm text-orange-100">最长连击</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{availableRewards.length}</div>
              <div className="text-sm text-orange-100">可领奖励</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 最近7天打卡记录 */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          最近7天
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {recentCheckIns.map((day, index) => (
            <motion.div
              key={day.date}
              className={clsx(
                'text-center p-3 rounded-lg border-2 transition-all duration-200',
                day.checked
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : day.isToday
                  ? 'bg-orange-50 border-orange-200 text-orange-700 border-dashed'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="text-sm font-medium mb-1">{day.dayName}</div>
              <div className="text-2xl">
                {day.checked ? '✅' : day.isToday ? '⏰' : '⭕'}
              </div>
              <div className="text-xs mt-1">
                {day.isToday ? '今天' : day.date.split('-')[2]}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 连击奖励 */}
      {availableRewards.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              可领取奖励
            </h3>
            <motion.div
              className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {availableRewards.length}
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableRewards.map((reward) => (
              <motion.div
                key={reward.id}
                className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-300 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{reward.icon}</span>
                  <span className="text-sm text-purple-600 font-medium">
                    +{reward.expReward} XP
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{reward.name}</h4>
                <p className="text-xs text-gray-600 mb-3">{reward.description}</p>
                <button
                  onClick={() => claimStreakReward(reward.id)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  领取奖励
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 所有连击奖励预览 */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          连击奖励目标
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {streakRewards.map((reward) => (
            <div
              key={reward.id}
              className={clsx(
                'text-center p-3 rounded-lg border-2 transition-all duration-200',
                reward.unlocked
                  ? 'bg-yellow-50 border-yellow-300 shadow-md'
                  : streak >= reward.minStreak
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="text-2xl mb-2">{reward.icon}</div>
              <div className="text-xs font-medium text-gray-800 mb-1">
                {reward.minStreak}天
              </div>
              <div className="text-xs text-gray-600">
                +{reward.expReward} XP
              </div>
              {reward.unlocked && (
                <div className="text-xs text-yellow-600 font-medium mt-1">
                  可领取!
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DailyCheckInPanel;
