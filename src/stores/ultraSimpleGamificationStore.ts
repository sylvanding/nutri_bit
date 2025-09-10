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
}

interface UltraSimpleGameActions {
  addExp: (amount: number, reason?: string) => void;
  logMeal: () => void;
  increaseStreak: () => void;
  resetStreak: () => void;
  clearNotifications: () => void;
  getStats: () => {
    level: number;
    exp: number;
    streak: number;
    totalMeals: number;
    achievementCount: number;
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
  
  // 餐数成就
  if (state.totalMeals === 10 && !state.achievements.includes('meals_10')) {
    newAchievements.push('meals_10');
  }
  
  return newAchievements;
};

// 获取成就显示名称
const getAchievementName = (id: string): string => {
  const names: Record<string, string> = {
    'first_meal': '🍽️ 第一餐',
    'streak_3': '🔥 三日坚持',
    'streak_7': '⭐ 一周习惯',
    'meals_10': '🍱 美食探索者'
  };
  return names[id] || id;
};

export const useUltraSimpleGamificationStore = create<UltraSimpleGamificationStore>((set, get) => ({
  // 初始状态
  level: 1,
  exp: 0,
  streak: 0,
  totalMeals: 0,
  achievements: [],
  notifications: [],

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

  // 获取统计信息
  getStats: () => {
    const state = get();
    return {
      level: state.level,
      exp: state.exp,
      streak: state.streak,
      totalMeals: state.totalMeals,
      achievementCount: state.achievements.length
    };
  }
}));
