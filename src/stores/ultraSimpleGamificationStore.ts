import { create } from 'zustand';

// 极简游戏化数据类型
interface UltraSimpleGameState {
  level: number;
  exp: number;
  streak: number;
  totalMeals: number;
  achievements: string[]; // 简单的字符串数组
  notifications: Array<{
    id: string;
    message: string;
    timestamp: number;
  }>;
  // 新增的打卡相关字段
  lastCheckInDate: string | null; // YYYY-MM-DD 格式
  totalCheckIns: number; // 总打卡天数
  longestStreak: number; // 历史最长连击
  streakRewardsEarned: string[]; // 已获得的连击奖励
  checkInHistory: Array<{
    date: string;
    mealsCount: number;
    earnedExp: number;
  }>;
}

interface UltraSimpleGameActions {
  addExp: (amount: number, reason?: string) => void;
  logMeal: () => void;
  increaseStreak: () => void;
  resetStreak: () => void;
  clearNotifications: () => void;
  // 新增的打卡相关方法
  dailyCheckIn: () => void;
  canCheckInToday: () => boolean;
  getStreakRewards: () => Array<{ id: string; name: string; description: string; icon: string; unlocked: boolean; expReward: number }>;
  claimStreakReward: (rewardId: string) => void;
  getStats: () => {
    level: number;
    exp: number;
    streak: number;
    longestStreak: number;
    totalMeals: number;
    totalCheckIns: number;
    achievementCount: number;
    canCheckInToday: boolean;
    todayMealsCount: number;
  };
}

type UltraSimpleGamificationStore = UltraSimpleGameState & UltraSimpleGameActions;

// 计算等级所需经验
const getExpForLevel = (level: number) => level * 100;

// 检查成就
const checkAchievements = (state: UltraSimpleGameState): string[] => {
  const newAchievements: string[] = [];
  
  // 第一餐成就
  if (state.totalMeals === 1 && !state.achievements.includes('first_meal')) {
    newAchievements.push('first_meal');
  }
  
  // 连击成就
  if (state.streak === 3 && !state.achievements.includes('streak_3')) {
    newAchievements.push('streak_3');
  }
  
  if (state.streak === 7 && !state.achievements.includes('streak_7')) {
    newAchievements.push('streak_7');
  }
  
  if (state.streak === 15 && !state.achievements.includes('streak_15')) {
    newAchievements.push('streak_15');
  }
  
  if (state.streak === 30 && !state.achievements.includes('streak_30')) {
    newAchievements.push('streak_30');
  }
  
  if (state.streak === 60 && !state.achievements.includes('streak_60')) {
    newAchievements.push('streak_60');
  }
  
  if (state.streak === 100 && !state.achievements.includes('streak_100')) {
    newAchievements.push('streak_100');
  }
  
  // 打卡成就
  if (state.totalCheckIns === 1 && !state.achievements.includes('first_checkin')) {
    newAchievements.push('first_checkin');
  }
  
  if (state.totalCheckIns === 30 && !state.achievements.includes('checkin_30')) {
    newAchievements.push('checkin_30');
  }
  
  if (state.totalCheckIns === 100 && !state.achievements.includes('checkin_100')) {
    newAchievements.push('checkin_100');
  }
  
  // 餐数成就
  if (state.totalMeals === 10 && !state.achievements.includes('meals_10')) {
    newAchievements.push('meals_10');
  }
  
  if (state.totalMeals === 50 && !state.achievements.includes('meals_50')) {
    newAchievements.push('meals_50');
  }
  
  if (state.totalMeals === 100 && !state.achievements.includes('meals_100')) {
    newAchievements.push('meals_100');
  }
  
  if (state.totalMeals === 365 && !state.achievements.includes('meals_365')) {
    newAchievements.push('meals_365');
  }
  
  // 最长连击记录成就
  if (state.longestStreak === 10 && !state.achievements.includes('longest_streak_10')) {
    newAchievements.push('longest_streak_10');
  }
  
  if (state.longestStreak === 30 && !state.achievements.includes('longest_streak_30')) {
    newAchievements.push('longest_streak_30');
  }
  
  if (state.longestStreak === 100 && !state.achievements.includes('longest_streak_100')) {
    newAchievements.push('longest_streak_100');
  }
  
  return newAchievements;
};

// 获取成就显示名称
const getAchievementName = (id: string): string => {
  const names: Record<string, string> = {
    'first_meal': '🍽️ 第一餐',
    'streak_3': '🔥 三日坚持',
    'streak_7': '⭐ 一周习惯',
    'streak_15': '💪 半月达人',
    'streak_30': '👑 月度冠军',
    'streak_60': '💎 钻石坚持',
    'streak_100': '🏆 百日传奇',
    'first_checkin': '📅 初次打卡',
    'checkin_30': '📆 打卡达人',
    'checkin_100': '📊 打卡专家',
    'meals_10': '🍱 美食探索者',
    'meals_50': '🍴 美食爱好者',
    'meals_100': '🍜 美食达人',
    'meals_365': '🎯 年度美食家',
    'longest_streak_10': '🎖️ 坚持不懈',
    'longest_streak_30': '🎗️ 意志之王',
    'longest_streak_100': '👑 传奇记录'
  };
  return names[id] || id;
};

// 获取今日日期字符串
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 检查是否是连续的日期
const isConsecutiveDate = (lastDate: string, today: string): boolean => {
  const last = new Date(lastDate);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// 连击奖励配置
const streakRewardConfig = [
  { id: 'reward_3', name: '坚持奖励', description: '连续3天记录奖励', minStreak: 3, expReward: 50, icon: '🎁' },
  { id: 'reward_7', name: '一周奖励', description: '连续7天记录奖励', minStreak: 7, expReward: 100, icon: '🎊' },
  { id: 'reward_15', name: '半月奖励', description: '连续15天记录奖励', minStreak: 15, expReward: 200, icon: '🎉' },
  { id: 'reward_30', name: '月度奖励', description: '连续30天记录奖励', minStreak: 30, expReward: 500, icon: '🏆' },
  { id: 'reward_60', name: '钻石奖励', description: '连续60天记录奖励', minStreak: 60, expReward: 1000, icon: '💎' },
  { id: 'reward_100', name: '传奇奖励', description: '连续100天记录奖励', minStreak: 100, expReward: 2000, icon: '👑' }
];

export const useUltraSimpleGamificationStore = create<UltraSimpleGamificationStore>((set, get) => ({
  // 初始状态
  level: 1,
  exp: 0,
  streak: 0,
  totalMeals: 0,
  achievements: [],
  notifications: [],
  // 新增字段的初始值
  lastCheckInDate: null,
  totalCheckIns: 0,
  longestStreak: 0,
  streakRewardsEarned: [],
  checkInHistory: [],

  // 添加经验值
  addExp: (amount: number, reason = '获得经验') => {
    set((state) => {
      const newExp = state.exp + amount;
      const currentLevelExp = getExpForLevel(state.level);
      
      let newLevel = state.level;
      let finalExp = newExp;
      
      // 检查升级
      while (finalExp >= currentLevelExp) {
        finalExp -= currentLevelExp;
        newLevel++;
      }
      
      const notifications = [...state.notifications];
      
      // 添加经验通知
      notifications.unshift({
        id: `exp_${Date.now()}`,
        message: `${reason} +${amount} XP`,
        timestamp: Date.now()
      });
      
      // 升级通知
      if (newLevel > state.level) {
        notifications.unshift({
          id: `levelup_${Date.now()}`,
          message: `🎉 升级到 Lv.${newLevel}!`,
          timestamp: Date.now()
        });
      }
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        level: newLevel,
        exp: finalExp,
        notifications
      };
    });
  },

  // 记录一餐
  logMeal: () => {
    set((state) => {
      const newTotalMeals = state.totalMeals + 1;
      const newState = {
        ...state,
        totalMeals: newTotalMeals
      };
      
      // 检查新成就
      const newAchievements = checkAchievements(newState);
      const updatedAchievements = [...state.achievements, ...newAchievements];
      
      const notifications = [...state.notifications];
      
      // 添加成就通知
      newAchievements.forEach(achievementId => {
        notifications.unshift({
          id: `achievement_${achievementId}_${Date.now()}`,
          message: `🏆 解锁成就: ${getAchievementName(achievementId)}`,
          timestamp: Date.now()
        });
      });
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        totalMeals: newTotalMeals,
        achievements: updatedAchievements,
        notifications
      };
    });
    
    // 添加经验值
    get().addExp(20, '记录饮食');
  },

  // 增加连击
  increaseStreak: () => {
    set((state) => {
      const newStreak = state.streak + 1;
      const newState = { ...state, streak: newStreak };
      
      // 检查连击成就
      const newAchievements = checkAchievements(newState);
      const updatedAchievements = [...state.achievements, ...newAchievements];
      
      const notifications = [...state.notifications];
      
      // 添加成就通知
      newAchievements.forEach(achievementId => {
        notifications.unshift({
          id: `achievement_${achievementId}_${Date.now()}`,
          message: `🏆 解锁成就: ${getAchievementName(achievementId)}`,
          timestamp: Date.now()
        });
      });
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        streak: newStreak,
        achievements: updatedAchievements,
        notifications
      };
    });
  },

  // 重置连击
  resetStreak: () => {
    set({ streak: 0 });
  },

  // 清除通知
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // 每日打卡
  dailyCheckIn: () => {
    set((state) => {
      const today = getTodayDateString();
      
      // 检查是否已经打卡
      if (state.lastCheckInDate === today) {
        return state; // 今天已经打卡过了
      }
      
      let newStreak = 1;
      let newLongestStreak = state.longestStreak;
      
      // 检查连击
      if (state.lastCheckInDate) {
        if (isConsecutiveDate(state.lastCheckInDate, today)) {
          newStreak = state.streak + 1;
        } else {
          // 连击中断
          newStreak = 1;
        }
      }
      
      // 更新最长连击记录
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
      
      const newTotalCheckIns = state.totalCheckIns + 1;
      const todayMealsCount = state.checkInHistory.filter(h => h.date === today).reduce((sum, h) => sum + h.mealsCount, 0);
      
      const newState = {
        ...state,
        lastCheckInDate: today,
        streak: newStreak,
        totalCheckIns: newTotalCheckIns,
        longestStreak: newLongestStreak,
      };
      
      // 添加打卡记录
      const newCheckInHistory = [...state.checkInHistory];
      const existingRecord = newCheckInHistory.find(h => h.date === today);
      if (!existingRecord) {
        newCheckInHistory.push({
          date: today,
          mealsCount: todayMealsCount,
          earnedExp: 20 // 基础打卡经验
        });
      }
      
      // 检查新成就
      const newAchievements = checkAchievements(newState);
      const updatedAchievements = [...state.achievements, ...newAchievements];
      
      const notifications = [...state.notifications];
      
      // 添加打卡通知
      notifications.unshift({
        id: `checkin_${Date.now()}`,
        message: `✅ 每日打卡成功! 连击: ${newStreak} 天`,
        timestamp: Date.now()
      });
      
      // 添加成就通知
      newAchievements.forEach(achievementId => {
        notifications.unshift({
          id: `achievement_${achievementId}_${Date.now()}`,
          message: `🏆 解锁成就: ${getAchievementName(achievementId)}`,
          timestamp: Date.now()
        });
      });
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        ...newState,
        achievements: updatedAchievements,
        notifications,
        checkInHistory: newCheckInHistory
      };
    });
    
    // 添加打卡奖励经验
    get().addExp(20, '每日打卡');
  },

  // 检查今天是否可以打卡
  canCheckInToday: () => {
    const state = get();
    const today = getTodayDateString();
    return state.lastCheckInDate !== today;
  },

  // 获取连击奖励列表
  getStreakRewards: () => {
    const state = get();
    return streakRewardConfig.map(reward => ({
      ...reward,
      unlocked: state.streak >= reward.minStreak && !state.streakRewardsEarned.includes(reward.id)
    }));
  },

  // 领取连击奖励
  claimStreakReward: (rewardId: string) => {
    const state = get();
    const reward = streakRewardConfig.find(r => r.id === rewardId);
    
    if (!reward || state.streakRewardsEarned.includes(rewardId) || state.streak < reward.minStreak) {
      return;
    }
    
    set((prevState) => {
      const notifications = [...prevState.notifications];
      notifications.unshift({
        id: `reward_${rewardId}_${Date.now()}`,
        message: `🎁 领取奖励: ${reward.name} +${reward.expReward} XP`,
        timestamp: Date.now()
      });
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        ...prevState,
        streakRewardsEarned: [...prevState.streakRewardsEarned, rewardId],
        notifications
      };
    });
    
    // 添加奖励经验
    get().addExp(reward.expReward, `连击奖励: ${reward.name}`);
  },

  // 获取统计信息
  getStats: () => {
    const state = get();
    const today = getTodayDateString();
    const todayMealsCount = state.checkInHistory.filter(h => h.date === today).reduce((sum, h) => sum + h.mealsCount, 0);
    
    return {
      level: state.level,
      exp: state.exp,
      streak: state.streak,
      longestStreak: state.longestStreak,
      totalMeals: state.totalMeals,
      totalCheckIns: state.totalCheckIns,
      achievementCount: state.achievements.length,
      canCheckInToday: state.lastCheckInDate !== today,
      todayMealsCount
    };
  }
}));
