# 福宝游戏化机制技术实现指南

## 🚀 实施路线图

### 阶段一：基础游戏化框架 (第1-2个月)

#### 1.1 数据库设计与实现
```sql
-- 执行脚本：创建游戏化相关表结构

-- 用户游戏化状态表
CREATE TABLE user_gamification_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    level INTEGER DEFAULT 1,
    current_exp INTEGER DEFAULT 0,
    total_exp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    preferred_challenge_type VARCHAR(50),
    gamification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成就定义表
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon VARCHAR(200),
    badge_color VARCHAR(20),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    unlock_condition JSONB,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户成就解锁记录表
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id INTEGER REFERENCES achievements(id),
    progress JSONB DEFAULT '{}',
    unlock_date TIMESTAMP,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_date TIMESTAMP,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- 挑战活动表
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, seasonal, special
    difficulty VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    max_participants INTEGER,
    is_team_based BOOLEAN DEFAULT FALSE,
    team_size INTEGER DEFAULT 1,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    auto_join BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户挑战参与表
CREATE TABLE user_challenge_participation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    challenge_id INTEGER REFERENCES challenges(id),
    team_id UUID,
    progress JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- active, completed, failed, abandoned
    score INTEGER DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    rewards_claimed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, challenge_id)
);

-- 美食地图系统表
CREATE TABLE food_maps (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- regional, cuisine, ingredient, nutrition
    total_spots INTEGER NOT NULL,
    unlock_condition JSONB,
    rewards JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_map_spots (
    id VARCHAR(100) PRIMARY KEY,
    map_id VARCHAR(100) REFERENCES food_maps(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'common',
    coordinates JSONB, -- {x: number, y: number}
    unlock_requirements JSONB,
    rewards JSONB,
    nutrition_highlight TEXT,
    cultural_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_food_discoveries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    map_id VARCHAR(100) REFERENCES food_maps(id),
    spot_id VARCHAR(100) REFERENCES food_map_spots(id),
    discovery_method VARCHAR(50), -- meal_record, recipe_try, challenge_complete
    meal_record_id INTEGER, -- 关联的具体餐食记录
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, spot_id)
);

-- 经验值记录表（用于审计和分析）
CREATE TABLE exp_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    source VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 社交关系表
CREATE TABLE user_relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    relationship_type VARCHAR(50) NOT NULL, -- follow, mutual_follow, diet_buddy, challenge_teammate
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id, relationship_type)
);

-- 排行榜快照表（用于性能优化）
CREATE TABLE leaderboard_snapshots (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    timeframe VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
    user_id INTEGER REFERENCES users(id),
    score INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    snapshot_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_gamification_user_id ON user_gamification_profile(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_challenge_participation_user_id ON user_challenge_participation(user_id);
CREATE INDEX idx_challenge_participation_challenge_id ON user_challenge_participation(challenge_id);
CREATE INDEX idx_food_discoveries_user_id ON user_food_discoveries(user_id);
CREATE INDEX idx_food_discoveries_map_id ON user_food_discoveries(map_id);
CREATE INDEX idx_exp_transactions_user_id ON exp_transactions(user_id);
CREATE INDEX idx_exp_transactions_created_at ON exp_transactions(created_at);
CREATE INDEX idx_leaderboard_snapshots_category_timeframe ON leaderboard_snapshots(category, timeframe, snapshot_date);
```

#### 1.2 后端API设计

##### Express.js 路由结构
```typescript
// routes/gamification.ts
import express from 'express';
import { GamificationController } from '../controllers/GamificationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const gamificationController = new GamificationController();

// 用户游戏化状态
router.get('/profile', authMiddleware, gamificationController.getUserProfile);
router.post('/profile', authMiddleware, gamificationController.updateUserProfile);

// 经验值系统
router.post('/exp/add', authMiddleware, gamificationController.addExperience);
router.get('/exp/history', authMiddleware, gamificationController.getExpHistory);

// 成就系统
router.get('/achievements', authMiddleware, gamificationController.getUserAchievements);
router.get('/achievements/available', authMiddleware, gamificationController.getAvailableAchievements);
router.post('/achievements/:id/claim', authMiddleware, gamificationController.claimAchievement);

// 挑战系统
router.get('/challenges', authMiddleware, gamificationController.getActiveChallenges);
router.post('/challenges/:id/join', authMiddleware, gamificationController.joinChallenge);
router.get('/challenges/my', authMiddleware, gamificationController.getMyChallenges);
router.post('/challenges/:id/progress', authMiddleware, gamificationController.updateProgress);

// 美食地图
router.get('/maps', authMiddleware, gamificationController.getFoodMaps);
router.get('/maps/:mapId', authMiddleware, gamificationController.getMapDetails);
router.post('/maps/:mapId/discover/:spotId', authMiddleware, gamificationController.discoverSpot);

// 社交功能
router.get('/friends', authMiddleware, gamificationController.getFriends);
router.post('/friends/:userId/add', authMiddleware, gamificationController.addFriend);
router.get('/leaderboard/:category', authMiddleware, gamificationController.getLeaderboard);

export default router;
```

##### 控制器实现示例
```typescript
// controllers/GamificationController.ts
import { Request, Response } from 'express';
import { GamificationService } from '../services/GamificationService';
import { AchievementService } from '../services/AchievementService';
import { ChallengeService } from '../services/ChallengeService';

export class GamificationController {
    private gamificationService = new GamificationService();
    private achievementService = new AchievementService();
    private challengeService = new ChallengeService();

    async getUserProfile(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const profile = await this.gamificationService.getUserProfile(userId);
            res.json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async addExperience(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const { source, amount, metadata } = req.body;
            
            const result = await this.gamificationService.addExperience({
                userId,
                source,
                amount,
                metadata
            });
            
            // 检查是否有新成就解锁
            const newAchievements = await this.achievementService.checkAchievements(
                userId, 
                source, 
                metadata
            );
            
            res.json({ 
                success: true, 
                data: { 
                    expResult: result,
                    newAchievements 
                } 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async joinChallenge(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const challengeId = req.params.id;
            
            const result = await this.challengeService.joinChallenge(userId, challengeId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async discoverSpot(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const { mapId, spotId } = req.params;
            const { discoveryMethod, mealRecordId } = req.body;
            
            const result = await this.gamificationService.discoverFoodSpot({
                userId,
                mapId,
                spotId,
                discoveryMethod,
                mealRecordId
            });
            
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
```

#### 1.3 服务层实现

##### 核心游戏化服务
```typescript
// services/GamificationService.ts
import { Pool } from 'pg';
import { EventEmitter } from 'events';

interface ExpSource {
    action: string;
    baseExp: number;
    multiplier?: number;
    dailyLimit?: number;
}

export class GamificationService extends EventEmitter {
    private db: Pool;
    
    constructor(db: Pool) {
        super();
        this.db = db;
    }

    async getUserProfile(userId: number): Promise<UserGamificationProfile> {
        const query = `
            SELECT * FROM user_gamification_profile 
            WHERE user_id = $1
        `;
        const result = await this.db.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return await this.createUserProfile(userId);
        }
        
        return result.rows[0];
    }

    async addExperience(params: {
        userId: number;
        source: string;
        amount: number;
        metadata?: any;
    }): Promise<ExpResult> {
        const { userId, source, amount, metadata } = params;
        
        // 检查每日限制
        const canAddExp = await this.checkDailyExpLimit(userId, source);
        if (!canAddExp) {
            throw new Error('Daily experience limit reached for this source');
        }
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            // 记录经验值交易
            await client.query(`
                INSERT INTO exp_transactions (user_id, source, amount, description, metadata)
                VALUES ($1, $2, $3, $4, $5)
            `, [userId, source, amount, `Gained ${amount} exp from ${source}`, metadata]);
            
            // 更新用户经验值
            const updateResult = await client.query(`
                UPDATE user_gamification_profile 
                SET current_exp = current_exp + $1,
                    total_exp = total_exp + $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2
                RETURNING *
            `, [amount, userId]);
            
            const profile = updateResult.rows[0];
            
            // 检查是否升级
            const levelUpResult = await this.checkLevelUp(client, profile);
            
            await client.query('COMMIT');
            
            // 发出事件通知
            this.emit('experienceAdded', {
                userId,
                source,
                amount,
                newLevel: levelUpResult.newLevel,
                leveledUp: levelUpResult.leveledUp
            });
            
            return {
                newExp: profile.current_exp,
                totalExp: profile.total_exp,
                levelUp: levelUpResult
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async discoverFoodSpot(params: {
        userId: number;
        mapId: string;
        spotId: string;
        discoveryMethod: string;
        mealRecordId?: number;
    }): Promise<DiscoveryResult> {
        const { userId, mapId, spotId, discoveryMethod, mealRecordId } = params;
        
        // 检查是否已经发现过
        const existingDiscovery = await this.db.query(`
            SELECT id FROM user_food_discoveries 
            WHERE user_id = $1 AND spot_id = $2
        `, [userId, spotId]);
        
        if (existingDiscovery.rows.length > 0) {
            throw new Error('Food spot already discovered');
        }
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            // 记录发现
            await client.query(`
                INSERT INTO user_food_discoveries 
                (user_id, map_id, spot_id, discovery_method, meal_record_id)
                VALUES ($1, $2, $3, $4, $5)
            `, [userId, mapId, spotId, discoveryMethod, mealRecordId]);
            
            // 获取发现奖励
            const spotData = await client.query(`
                SELECT rewards FROM food_map_spots WHERE id = $1
            `, [spotId]);
            
            const rewards = spotData.rows[0]?.rewards || {};
            
            // 给予奖励
            if (rewards.exp) {
                await this.addExperience({
                    userId,
                    source: 'food_discovery',
                    amount: rewards.exp,
                    metadata: { mapId, spotId, discoveryMethod }
                });
            }
            
            await client.query('COMMIT');
            
            // 检查地图完成情况
            const mapProgress = await this.getMapProgress(userId, mapId);
            
            return {
                discovered: true,
                rewards,
                mapProgress
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private async checkLevelUp(client: any, profile: any): Promise<LevelUpResult> {
        const currentLevel = profile.level;
        const currentExp = profile.current_exp;
        
        // 计算新等级
        const newLevel = this.calculateLevel(currentExp);
        
        if (newLevel > currentLevel) {
            // 升级
            await client.query(`
                UPDATE user_gamification_profile 
                SET level = $1 
                WHERE user_id = $2
            `, [newLevel, profile.user_id]);
            
            return {
                leveledUp: true,
                oldLevel: currentLevel,
                newLevel: newLevel,
                rewards: this.getLevelUpRewards(newLevel)
            };
        }
        
        return {
            leveledUp: false,
            oldLevel: currentLevel,
            newLevel: currentLevel,
            rewards: []
        };
    }

    private calculateLevel(totalExp: number): number {
        // 等级计算公式：exp = level^2 * 100
        return Math.floor(Math.sqrt(totalExp / 100)) + 1;
    }
}
```

#### 1.4 前端React组件实现

##### 游戏化状态管理 (Zustand)
```typescript
// stores/gamificationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GamificationAPI } from '../services/GamificationAPI';

interface GamificationState {
    // 用户状态
    userProfile: UserGamificationProfile | null;
    achievements: Achievement[];
    challenges: Challenge[];
    foodMaps: FoodMap[];
    friends: Friend[];
    leaderboards: Record<string, LeaderboardEntry[]>;
    
    // UI状态
    showLevelUpModal: boolean;
    showAchievementModal: boolean;
    newAchievements: Achievement[];
    
    // 操作方法
    fetchUserProfile: () => Promise<void>;
    addExperience: (source: string, amount: number, metadata?: any) => Promise<void>;
    joinChallenge: (challengeId: string) => Promise<void>;
    discoverFoodSpot: (mapId: string, spotId: string, method: string) => Promise<void>;
    
    // UI操作
    showLevelUp: (oldLevel: number, newLevel: number) => void;
    hideLevelUp: () => void;
    showNewAchievement: (achievement: Achievement) => void;
    hideAchievementModal: () => void;
}

export const useGamificationStore = create<GamificationState>()(
    subscribeWithSelector((set, get) => ({
        // 初始状态
        userProfile: null,
        achievements: [],
        challenges: [],
        foodMaps: [],
        friends: [],
        leaderboards: {},
        showLevelUpModal: false,
        showAchievementModal: false,
        newAchievements: [],
        
        // 获取用户资料
        fetchUserProfile: async () => {
            try {
                const profile = await GamificationAPI.getUserProfile();
                set({ userProfile: profile });
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        },
        
        // 添加经验值
        addExperience: async (source: string, amount: number, metadata?: any) => {
            try {
                const result = await GamificationAPI.addExperience(source, amount, metadata);
                
                // 更新用户资料
                set(state => ({
                    userProfile: {
                        ...state.userProfile!,
                        current_exp: result.expResult.newExp,
                        total_exp: result.expResult.totalExp,
                        level: result.expResult.levelUp.newLevel
                    }
                }));
                
                // 显示升级动画
                if (result.expResult.levelUp.leveledUp) {
                    get().showLevelUp(
                        result.expResult.levelUp.oldLevel,
                        result.expResult.levelUp.newLevel
                    );
                }
                
                // 显示新成就
                if (result.newAchievements.length > 0) {
                    set({ newAchievements: result.newAchievements });
                    result.newAchievements.forEach(achievement => {
                        get().showNewAchievement(achievement);
                    });
                }
                
            } catch (error) {
                console.error('Failed to add experience:', error);
            }
        },
        
        // 发现美食点
        discoverFoodSpot: async (mapId: string, spotId: string, method: string) => {
            try {
                const result = await GamificationAPI.discoverFoodSpot(mapId, spotId, method);
                
                // 更新地图进度
                set(state => ({
                    foodMaps: state.foodMaps.map(map => 
                        map.id === mapId 
                            ? { ...map, userProgress: result.mapProgress }
                            : map
                    )
                }));
                
                // 触发发现动画
                // TODO: 实现发现动画
                
            } catch (error) {
                console.error('Failed to discover food spot:', error);
            }
        },
        
        // UI操作方法
        showLevelUp: (oldLevel: number, newLevel: number) => {
            set({ showLevelUpModal: true });
            // 3秒后自动关闭
            setTimeout(() => {
                set({ showLevelUpModal: false });
            }, 3000);
        },
        
        hideLevelUp: () => set({ showLevelUpModal: false }),
        
        showNewAchievement: (achievement: Achievement) => {
            set({ showAchievementModal: true });
            // 5秒后自动关闭
            setTimeout(() => {
                set({ showAchievementModal: false });
            }, 5000);
        },
        
        hideAchievementModal: () => set({ showAchievementModal: false })
    }))
);
```

##### 核心UI组件
```typescript
// components/gamification/ExpProgressBar.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ExpProgressBarProps {
    currentExp: number;
    nextLevelExp: number;
    level: number;
    showAnimation?: boolean;
}

export const ExpProgressBar: React.FC<ExpProgressBarProps> = ({
    currentExp,
    nextLevelExp,
    level,
    showAnimation = true
}) => {
    const progress = (currentExp / nextLevelExp) * 100;
    
    return (
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: showAnimation ? 1 : 0, ease: "easeOut" }}
            >
                {/* 闪光效果 */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>
            
            {/* 等级显示 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">
                    Lv.{level}
                </span>
            </div>
        </div>
    );
};

// components/gamification/AchievementCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AchievementCardProps {
    achievement: Achievement;
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
    onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    unlocked,
    progress = 0,
    maxProgress = 100,
    onClick
}) => {
    const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
    
    const rarityColors = {
        common: 'border-gray-300 bg-gray-50',
        rare: 'border-blue-400 bg-blue-50',
        epic: 'border-purple-400 bg-purple-50 shadow-purple-100',
        legendary: 'border-yellow-400 bg-yellow-50 shadow-yellow-200'
    };
    
    return (
        <motion.div
            className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                ${unlocked ? rarityColors[achievement.rarity] : 'border-gray-200 bg-gray-100'}
                ${unlocked && achievement.rarity === 'legendary' ? 'shadow-lg' : ''}
                hover:scale-105 hover:shadow-md
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            {/* 稀有度光效 */}
            {unlocked && (achievement.rarity === 'epic' || achievement.rarity === 'legendary') && (
                <div className="absolute inset-0 rounded-lg opacity-20 animate-pulse bg-gradient-to-r from-purple-400 to-yellow-400" />
            )}
            
            {/* 成就图标 */}
            <div className="text-center mb-3">
                <div className={`
                    w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl
                    ${unlocked ? 'bg-white shadow-md' : 'bg-gray-200'}
                `}>
                    {achievement.icon}
                </div>
            </div>
            
            {/* 成就信息 */}
            <div className="text-center">
                <h3 className={`
                    font-bold text-sm mb-1
                    ${unlocked ? 'text-gray-800' : 'text-gray-500'}
                `}>
                    {achievement.title}
                </h3>
                <p className={`
                    text-xs leading-tight
                    ${unlocked ? 'text-gray-600' : 'text-gray-400'}
                `}>
                    {achievement.description}
                </p>
            </div>
            
            {/* 进度条 */}
            {!unlocked && maxProgress > 0 && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                            className="h-1.5 bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        {progress}/{maxProgress}
                    </div>
                </div>
            )}
            
            {/* 解锁标识 */}
            {unlocked && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                </div>
            )}
        </motion.div>
    );
};

// components/gamification/FoodMapComponent.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FoodMapProps {
    mapData: FoodMap;
    userProgress: MapProgress;
    onSpotClick: (spotId: string) => void;
}

export const FoodMapComponent: React.FC<FoodMapProps> = ({
    mapData,
    userProgress,
    onSpotClick
}) => {
    const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
    
    return (
        <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
            {/* 地图背景 */}
            <img 
                src={mapData.backgroundImage} 
                alt={mapData.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            
            {/* 美食点位 */}
            {mapData.spots.map(spot => {
                const isDiscovered = userProgress.discoveredSpots.includes(spot.id);
                const isHovered = hoveredSpot === spot.id;
                
                return (
                    <motion.div
                        key={spot.id}
                        className={`
                            absolute w-8 h-8 rounded-full cursor-pointer
                            flex items-center justify-center
                            ${isDiscovered 
                                ? 'bg-yellow-400 shadow-lg shadow-yellow-200' 
                                : 'bg-gray-400 opacity-50'
                            }
                        `}
                        style={{
                            left: `${spot.coordinates.x}%`,
                            top: `${spot.coordinates.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            scale: isHovered ? 1.2 : 1,
                            boxShadow: isDiscovered 
                                ? '0 0 20px rgba(255, 193, 7, 0.6)' 
                                : '0 0 0px rgba(0, 0, 0, 0)'
                        }}
                        onHoverStart={() => setHoveredSpot(spot.id)}
                        onHoverEnd={() => setHoveredSpot(null)}
                        onClick={() => onSpotClick(spot.id)}
                    >
                        <span className="text-sm">
                            {isDiscovered ? '🍽️' : '?'}
                        </span>
                        
                        {/* 悬浮信息 */}
                        {isHovered && (
                            <motion.div
                                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                         bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {isDiscovered ? spot.name : '未发现'}
                                {/* 小箭头 */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                               border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
            
            {/* 地图进度显示 */}
            <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow">
                <h3 className="font-bold text-sm mb-1">{mapData.title}</h3>
                <div className="text-xs text-gray-600">
                    已发现: {userProgress.discoveredSpots.length}/{mapData.totalSpots}
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                        className="h-2 bg-green-500 rounded-full transition-all duration-500"
                        style={{ 
                            width: `${(userProgress.discoveredSpots.length / mapData.totalSpots) * 100}%` 
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
```

#### 1.5 数据初始化脚本

```typescript
// scripts/initializeGamificationData.ts
import { Pool } from 'pg';

const initializeAchievements = async (db: Pool) => {
    const achievements = [
        // 连击成就
        {
            code: 'streak_3',
            title: '初心不改',
            description: '连续记录饮食3天',
            category: 'streaks',
            rarity: 'common',
            icon: '🔥',
            requirements: { type: 'consecutive_days', value: 3 },
            rewards: { exp: 50, badge: 'first_streak' }
        },
        {
            code: 'streak_7',
            title: '七日坚持',
            description: '连续记录饮食7天',
            category: 'streaks',
            rarity: 'common',
            icon: '🔥',
            requirements: { type: 'consecutive_days', value: 7 },
            rewards: { exp: 100, title: '坚持者' }
        },
        {
            code: 'streak_30',
            title: '月度传奇',
            description: '连续记录饮食30天',
            category: 'streaks',
            rarity: 'epic',
            icon: '🏆',
            requirements: { type: 'consecutive_days', value: 30 },
            rewards: { exp: 500, exclusive_frame: 'golden_frame' }
        },
        
        // 营养成就
        {
            code: 'perfect_balance_1',
            title: '营养新手',
            description: '获得第一次完美营养平衡评价',
            category: 'nutrition',
            rarity: 'common',
            icon: '⚖️',
            requirements: { type: 'perfect_nutrition_count', value: 1 },
            rewards: { exp: 30, badge: 'nutrition_starter' }
        },
        {
            code: 'perfect_balance_10',
            title: '均衡大师',
            description: '获得10次完美营养平衡评价',
            category: 'nutrition',
            rarity: 'rare',
            icon: '⚖️',
            requirements: { type: 'perfect_nutrition_count', value: 10 },
            rewards: { exp: 200, badge: 'nutrition_master' }
        },
        
        // 探索成就
        {
            code: 'cuisine_explorer_5',
            title: '美食探险家',
            description: '尝试5种不同国家的菜系',
            category: 'exploration',
            rarity: 'rare',
            icon: '🗺️',
            requirements: { type: 'cuisine_types', value: 5 },
            rewards: { exp: 300, map_unlock: 'world_map' }
        },
        
        // 社交成就
        {
            code: 'helpful_friend',
            title: '乐于助人',
            description: '获得100个「有用」点赞',
            category: 'social',
            rarity: 'rare',
            icon: '🤝',
            requirements: { type: 'helpful_votes', value: 100 },
            rewards: { exp: 250, special_title: '社区助手' }
        }
    ];
    
    for (const achievement of achievements) {
        await db.query(`
            INSERT INTO achievements 
            (code, title, description, category, rarity, icon, requirements, rewards)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (code) DO NOTHING
        `, [
            achievement.code,
            achievement.title,
            achievement.description,
            achievement.category,
            achievement.rarity,
            achievement.icon,
            JSON.stringify(achievement.requirements),
            JSON.stringify(achievement.rewards)
        ]);
    }
};

const initializeFoodMaps = async (db: Pool) => {
    // 中国地域美食地图
    const chinaMap = {
        id: 'china_regional',
        title: '中华美食版图',
        description: '探索各省特色美食，解锁地域饮食文化',
        type: 'regional',
        total_spots: 50,
        rewards: { exp: 1000, title: '中华美食大师' }
    };
    
    await db.query(`
        INSERT INTO food_maps (id, title, description, type, total_spots, rewards)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
    `, [
        chinaMap.id,
        chinaMap.title,
        chinaMap.description,
        chinaMap.type,
        chinaMap.total_spots,
        JSON.stringify(chinaMap.rewards)
    ]);
    
    // 添加美食点位
    const spots = [
        {
            id: 'sichuan_mapo_tofu',
            map_id: 'china_regional',
            name: '麻婆豆腐',
            description: '四川经典川菜，麻辣鲜香',
            category: '川菜',
            coordinates: { x: 45, y: 55 },
            rewards: { exp: 20, discovery_badge: 'sichuan_cuisine' }
        },
        {
            id: 'guangdong_dim_sum',
            map_id: 'china_regional',
            name: '广式茶点',
            description: '精致的广东早茶文化',
            category: '粤菜',
            coordinates: { x: 60, y: 75 },
            rewards: { exp: 25, discovery_badge: 'cantonese_cuisine' }
        }
        // ... 更多点位
    ];
    
    for (const spot of spots) {
        await db.query(`
            INSERT INTO food_map_spots 
            (id, map_id, name, description, category, coordinates, rewards)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
        `, [
            spot.id,
            spot.map_id,
            spot.name,
            spot.description,
            spot.category,
            JSON.stringify(spot.coordinates),
            JSON.stringify(spot.rewards)
        ]);
    }
};

// 执行初始化
async function main() {
    const db = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        console.log('Initializing achievements...');
        await initializeAchievements(db);
        
        console.log('Initializing food maps...');
        await initializeFoodMaps(db);
        
        console.log('Gamification data initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize gamification data:', error);
    } finally {
        await db.end();
    }
}

main();
```

---

### 阶段二：挑战系统与社交功能 (第3-4个月)

#### 2.1 挑战系统实现
```typescript
// services/ChallengeService.ts
export class ChallengeService {
    private db: Pool;
    
    async createDailyChallenge(): Promise<Challenge> {
        const templates = [
            {
                title: '彩虹餐盘',
                description: '今日三餐包含至少5种不同颜色的蔬果',
                type: 'daily',
                difficulty: 'beginner',
                requirements: {
                    type: 'colorful_foods',
                    target: 5,
                    timeframe: 'today'
                },
                rewards: {
                    exp: 30,
                    badge: 'rainbow_eater'
                }
            }
            // ... 更多模板
        ];
        
        // 随机选择或基于用户历史智能选择
        const template = this.selectChallengeTemplate(templates);
        
        const challenge = await this.db.query(`
            INSERT INTO challenges 
            (code, title, description, type, difficulty, requirements, rewards, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            `daily_${Date.now()}`,
            template.title,
            template.description,
            'daily',
            template.difficulty,
            JSON.stringify(template.requirements),
            JSON.stringify(template.rewards),
            new Date(),
            new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后
        ]);
        
        return challenge.rows[0];
    }
    
    async joinChallenge(userId: number, challengeId: string): Promise<JoinResult> {
        // 检查是否已经参与
        const existing = await this.db.query(`
            SELECT id FROM user_challenge_participation 
            WHERE user_id = $1 AND challenge_id = $2
        `, [userId, challengeId]);
        
        if (existing.rows.length > 0) {
            throw new Error('Already joined this challenge');
        }
        
        // 加入挑战
        const participation = await this.db.query(`
            INSERT INTO user_challenge_participation (user_id, challenge_id)
            VALUES ($1, $2)
            RETURNING *
        `, [userId, challengeId]);
        
        return {
            success: true,
            participation: participation.rows[0]
        };
    }
    
    async updateChallengeProgress(
        userId: number, 
        challengeId: string, 
        progressData: any
    ): Promise<ProgressUpdateResult> {
        // 获取挑战要求
        const challenge = await this.db.query(`
            SELECT requirements FROM challenges WHERE id = $1
        `, [challengeId]);
        
        const requirements = challenge.rows[0].requirements;
        
        // 计算新进度
        const newProgress = this.calculateProgress(requirements, progressData);
        
        // 更新进度
        const updated = await this.db.query(`
            UPDATE user_challenge_participation 
            SET progress = $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2 AND challenge_id = $3
            RETURNING *
        `, [JSON.stringify(newProgress), userId, challengeId]);
        
        // 检查是否完成
        const isCompleted = this.checkChallengeCompletion(requirements, newProgress);
        
        if (isCompleted) {
            await this.completeChallengeForUser(userId, challengeId);
        }
        
        return {
            progress: newProgress,
            completed: isCompleted,
            participation: updated.rows[0]
        };
    }
}
```

#### 2.2 社交功能实现
```typescript
// services/SocialService.ts
export class SocialService {
    async addFriend(userId: number, targetUserId: number): Promise<FriendResult> {
        // 检查是否已经是好友
        const existing = await this.db.query(`
            SELECT * FROM user_relationships 
            WHERE user_id = $1 AND target_user_id = $2 AND relationship_type = 'follow'
        `, [userId, targetUserId]);
        
        if (existing.rows.length > 0) {
            throw new Error('Already following this user');
        }
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            // 添加关注关系
            await client.query(`
                INSERT INTO user_relationships (user_id, target_user_id, relationship_type)
                VALUES ($1, $2, 'follow')
            `, [userId, targetUserId]);
            
            // 检查是否互相关注
            const reverseFollow = await client.query(`
                SELECT id FROM user_relationships 
                WHERE user_id = $1 AND target_user_id = $2 AND relationship_type = 'follow'
            `, [targetUserId, userId]);
            
            if (reverseFollow.rows.length > 0) {
                // 升级为互相关注
                await client.query(`
                    UPDATE user_relationships 
                    SET relationship_type = 'mutual_follow'
                    WHERE (user_id = $1 AND target_user_id = $2) 
                       OR (user_id = $2 AND target_user_id = $1)
                `, [userId, targetUserId]);
            }
            
            await client.query('COMMIT');
            
            return {
                success: true,
                relationshipType: reverseFollow.rows.length > 0 ? 'mutual_follow' : 'follow'
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async compareProgress(userId: number, friendId: number): Promise<ComparisonResult> {
        // 获取双方的游戏化数据
        const [userProfile, friendProfile] = await Promise.all([
            this.getUserGamificationProfile(userId),
            this.getUserGamificationProfile(friendId)
        ]);
        
        // 获取双方的成就数据
        const [userAchievements, friendAchievements] = await Promise.all([
            this.getUserAchievements(userId),
            this.getUserAchievements(friendId)
        ]);
        
        return {
            user: {
                profile: userProfile,
                achievements: userAchievements
            },
            friend: {
                profile: friendProfile,
                achievements: friendAchievements
            },
            comparison: {
                levelDifference: userProfile.level - friendProfile.level,
                expDifference: userProfile.total_exp - friendProfile.total_exp,
                achievementCountDifference: userAchievements.length - friendAchievements.length
            }
        };
    }
}
```

#### 2.3 排行榜系统实现
```typescript
// services/LeaderboardService.ts
export class LeaderboardService {
    async generateLeaderboard(
        category: string, 
        timeframe: string, 
        limit: number = 100
    ): Promise<LeaderboardEntry[]> {
        let query = '';
        let params: any[] = [];
        
        switch (category) {
            case 'overall_exp':
                if (timeframe === 'all_time') {
                    query = `
                        SELECT u.id, u.username, ugp.total_exp as score, ugp.level
                        FROM users u
                        JOIN user_gamification_profile ugp ON u.id = ugp.user_id
                        ORDER BY ugp.total_exp DESC
                        LIMIT $1
                    `;
                    params = [limit];
                } else {
                    // 基于时间范围的查询
                    const dateFilter = this.getDateFilter(timeframe);
                    query = `
                        SELECT u.id, u.username, SUM(et.amount) as score
                        FROM users u
                        JOIN exp_transactions et ON u.id = et.user_id
                        WHERE et.created_at >= $1
                        GROUP BY u.id, u.username
                        ORDER BY SUM(et.amount) DESC
                        LIMIT $2
                    `;
                    params = [dateFilter, limit];
                }
                break;
                
            case 'streak_days':
                query = `
                    SELECT u.id, u.username, ugp.current_streak as score
                    FROM users u
                    JOIN user_gamification_profile ugp ON u.id = ugp.user_id
                    WHERE ugp.current_streak > 0
                    ORDER BY ugp.current_streak DESC
                    LIMIT $1
                `;
                params = [limit];
                break;
                
            case 'food_discovery':
                const mapTimeFilter = this.getDateFilter(timeframe);
                query = `
                    SELECT u.id, u.username, COUNT(ufd.id) as score
                    FROM users u
                    JOIN user_food_discoveries ufd ON u.id = ufd.user_id
                    WHERE ufd.discovered_at >= $1
                    GROUP BY u.id, u.username
                    ORDER BY COUNT(ufd.id) DESC
                    LIMIT $2
                `;
                params = [mapTimeFilter, limit];
                break;
        }
        
        const result = await this.db.query(query, params);
        
        // 添加排名
        return result.rows.map((row, index) => ({
            ...row,
            rank: index + 1
        }));
    }
    
    async updateLeaderboardSnapshots(): Promise<void> {
        // 每日定时任务：更新排行榜快照
        const categories = ['overall_exp', 'streak_days', 'food_discovery'];
        const timeframes = ['daily', 'weekly', 'monthly', 'all_time'];
        
        for (const category of categories) {
            for (const timeframe of timeframes) {
                const leaderboard = await this.generateLeaderboard(category, timeframe);
                
                // 删除旧快照
                await this.db.query(`
                    DELETE FROM leaderboard_snapshots 
                    WHERE category = $1 AND timeframe = $2 AND snapshot_date = CURRENT_DATE
                `, [category, timeframe]);
                
                // 插入新快照
                for (const entry of leaderboard) {
                    await this.db.query(`
                        INSERT INTO leaderboard_snapshots 
                        (category, timeframe, user_id, score, rank, snapshot_date)
                        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
                    `, [category, timeframe, entry.id, entry.score, entry.rank]);
                }
            }
        }
    }
}
```

---

### 阶段三：高级功能与优化 (第5-6个月)

#### 3.1 AI伙伴系统实现
```typescript
// services/AICompanionService.ts
export class AICompanionService {
    private openai: OpenAI;
    private userContextService: UserContextService;
    
    async generateResponse(
        userId: number, 
        trigger: string, 
        context: any
    ): Promise<CompanionResponse> {
        // 获取用户上下文
        const userContext = await this.userContextService.getUserContext(userId);
        
        // 构建prompt
        const prompt = this.buildPrompt(userContext, trigger, context);
        
        // 调用GPT API
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: this.getSystemPrompt(userContext.companionPersonality)
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.8
        });
        
        const message = response.choices[0].message.content;
        
        // 记录对话历史
        await this.saveConversationHistory(userId, trigger, context, message);
        
        return {
            message,
            emotion: this.detectEmotion(context),
            suggestedActions: this.generateSuggestedActions(trigger, context),
            followUpQuestions: this.generateFollowUpQuestions(trigger, context)
        };
    }
    
    private buildPrompt(userContext: UserContext, trigger: string, context: any): string {
        const templates = {
            meal_recorded: `
                用户刚刚记录了一餐：${context.mealName}
                营养评分：${context.nutritionScore}/100
                用户当前等级：${userContext.level}
                连击天数：${userContext.streakDays}
                
                请给出鼓励性的反馈，并提供具体的营养建议。
                风格：温暖、专业、鼓励性
                长度：1-2句话
            `,
            achievement_unlocked: `
                用户解锁了新成就：${context.achievementTitle}
                成就描述：${context.achievementDescription}
                用户总成就数：${userContext.totalAchievements}
                
                请表达祝贺，并鼓励用户继续努力。
                风格：庆祝、激励
                长度：1-2句话
            `,
            streak_broken: `
                用户的连击被中断了
                之前连击天数：${context.previousStreak}
                用户情绪可能：沮丧
                
                请给出安慰和鼓励，帮助用户重新开始。
                风格：安慰、支持、正向引导
                长度：2-3句话
            `
        };
        
        return templates[trigger] || `用户触发了${trigger}事件，请给出合适的回应。`;
    }
    
    private getSystemPrompt(personality: CompanionPersonality): string {
        return `
            你是"卡卡"，一个专业而温暖的AI营养师。
            
            个性特点：
            - 专业：具备深厚的营养学知识
            - 温暖：语气亲切，充满关爱
            - 鼓励：总是给用户正面支持
            - 实用：提供可行的建议
            
            交流原则：
            - 避免使用专业术语，用通俗易懂的语言
            - 不要制造身材焦虑或饮食焦虑
            - 专注于健康而非减肥
            - 鼓励循序渐进的改善
            - 适当使用emoji增加亲切感
            
            请根据用户的具体情况，给出个性化的回应。
        `;
    }
}
```

#### 3.2 个性化推荐系统
```typescript
// services/PersonalizationService.ts
export class PersonalizationService {
    async generatePersonalizedRewards(userId: number): Promise<PersonalizedReward[]> {
        // 分析用户行为模式
        const userProfile = await this.analyzeUserBehavior(userId);
        
        // 根据用户类型定制奖励
        const rewardStrategy = this.getRewardStrategy(userProfile.primaryMotivation);
        
        return rewardStrategy.generateRewards(userProfile);
    }
    
    private async analyzeUserBehavior(userId: number): Promise<UserBehaviorProfile> {
        // 分析用户的游戏化参与模式
        const [
            activityPattern,
            featureUsage,
            socialEngagement,
            progressionSpeed
        ] = await Promise.all([
            this.analyzeActivityPattern(userId),
            this.analyzeFeatureUsage(userId),
            this.analyzeSocialEngagement(userId),
            this.analyzeProgressionSpeed(userId)
        ]);
        
        // 基于机器学习模型判断用户类型
        const primaryMotivation = this.classifyUserMotivation({
            activityPattern,
            featureUsage,
            socialEngagement,
            progressionSpeed
        });
        
        return {
            userId,
            primaryMotivation,
            activityPattern,
            featureUsage,
            socialEngagement,
            progressionSpeed,
            updatedAt: new Date()
        };
    }
    
    private getRewardStrategy(motivation: UserMotivationType): RewardStrategy {
        const strategies = {
            achievement_oriented: new AchievementRewardStrategy(),
            social_oriented: new SocialRewardStrategy(),
            knowledge_seeker: new KnowledgeRewardStrategy(),
            collector: new CollectionRewardStrategy()
        };
        
        return strategies[motivation];
    }
}

// 不同的奖励策略
class AchievementRewardStrategy implements RewardStrategy {
    generateRewards(profile: UserBehaviorProfile): PersonalizedReward[] {
        return [
            {
                type: 'exclusive_badge',
                title: '专属成就徽章',
                description: '只有成就导向用户才能获得的特殊徽章',
                rarity: 'epic',
                unlockCondition: 'complete_5_challenges_this_week'
            },
            {
                type: 'leaderboard_highlight',
                title: '排行榜高亮',
                description: '在排行榜中获得特殊标识',
                duration: '7_days'
            }
        ];
    }
}

class SocialRewardStrategy implements RewardStrategy {
    generateRewards(profile: UserBehaviorProfile): PersonalizedReward[] {
        return [
            {
                type: 'social_boost',
                title: '社交影响力加成',
                description: '分享内容获得额外曝光',
                multiplier: 1.5,
                duration: '3_days'
            },
            {
                type: 'friend_invite_bonus',
                title: '好友邀请奖励',
                description: '邀请好友加入获得双倍经验',
                bonusExp: 200
            }
        ];
    }
}
```

#### 3.3 数据分析与优化
```typescript
// services/AnalyticsService.ts
export class GamificationAnalyticsService {
    async generateGamificationReport(): Promise<GamificationReport> {
        const [
            userEngagement,
            featureUsage,
            retentionMetrics,
            conversionMetrics
        ] = await Promise.all([
            this.analyzeUserEngagement(),
            this.analyzeFeatureUsage(),
            this.analyzeRetentionMetrics(),
            this.analyzeConversionMetrics()
        ]);
        
        return {
            userEngagement,
            featureUsage,
            retentionMetrics,
            conversionMetrics,
            recommendations: this.generateOptimizationRecommendations({
                userEngagement,
                featureUsage,
                retentionMetrics,
                conversionMetrics
            }),
            generatedAt: new Date()
        };
    }
    
    private async analyzeUserEngagement(): Promise<EngagementMetrics> {
        const query = `
            WITH daily_activity AS (
                SELECT 
                    DATE(created_at) as date,
                    COUNT(DISTINCT user_id) as active_users,
                    COUNT(*) as total_actions
                FROM exp_transactions 
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
            ),
            gamified_vs_total AS (
                SELECT 
                    COUNT(DISTINCT ugp.user_id) as gamified_users,
                    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as total_users
                FROM user_gamification_profile ugp
                WHERE ugp.created_at >= NOW() - INTERVAL '30 days'
            )
            SELECT 
                AVG(da.active_users) as avg_daily_active_users,
                AVG(da.total_actions) as avg_daily_actions,
                gvt.gamified_users,
                gvt.total_users,
                (gvt.gamified_users::float / gvt.total_users::float * 100) as gamification_adoption_rate
            FROM daily_activity da, gamified_vs_total gvt
        `;
        
        const result = await this.db.query(query);
        return result.rows[0];
    }
    
    private async analyzeRetentionMetrics(): Promise<RetentionMetrics> {
        // 分析游戏化功能对用户留存的影响
        const retentionQuery = `
            WITH cohort_data AS (
                SELECT 
                    user_id,
                    DATE_TRUNC('week', created_at) as cohort_week,
                    CASE WHEN total_exp > 0 THEN 'gamified' ELSE 'non_gamified' END as user_type
                FROM user_gamification_profile
                WHERE created_at >= NOW() - INTERVAL '12 weeks'
            ),
            retention_analysis AS (
                SELECT 
                    cd.cohort_week,
                    cd.user_type,
                    COUNT(DISTINCT cd.user_id) as cohort_size,
                    COUNT(DISTINCT CASE 
                        WHEN ugp.last_activity_date >= cd.cohort_week + INTERVAL '1 week' 
                        THEN cd.user_id 
                    END) as week_1_retained,
                    COUNT(DISTINCT CASE 
                        WHEN ugp.last_activity_date >= cd.cohort_week + INTERVAL '4 weeks' 
                        THEN cd.user_id 
                    END) as week_4_retained
                FROM cohort_data cd
                JOIN user_gamification_profile ugp ON cd.user_id = ugp.user_id
                GROUP BY cd.cohort_week, cd.user_type
            )
            SELECT 
                user_type,
                AVG(week_1_retained::float / cohort_size::float * 100) as avg_week_1_retention,
                AVG(week_4_retained::float / cohort_size::float * 100) as avg_week_4_retention
            FROM retention_analysis
            WHERE cohort_size >= 10  -- 只考虑有足够样本的群组
            GROUP BY user_type
        `;
        
        const retentionResult = await this.db.query(retentionQuery);
        
        return {
            gamifiedUserRetention: retentionResult.rows.find(r => r.user_type === 'gamified'),
            nonGamifiedUserRetention: retentionResult.rows.find(r => r.user_type === 'non_gamified'),
            retentionLift: this.calculateRetentionLift(retentionResult.rows)
        };
    }
    
    private generateOptimizationRecommendations(data: any): OptimizationRecommendation[] {
        const recommendations = [];
        
        // 基于参与度数据的建议
        if (data.userEngagement.gamification_adoption_rate < 60) {
            recommendations.push({
                priority: 'high',
                category: 'adoption',
                title: '提升游戏化功能采用率',
                description: '当前只有60%的用户使用游戏化功能，建议优化新用户引导流程',
                suggestedActions: [
                    '增强首次体验的游戏化元素',
                    '在关键节点引导用户体验成就系统',
                    '提供游戏化功能的价值说明'
                ]
            });
        }
        
        // 基于留存数据的建议
        if (data.retentionMetrics.retentionLift < 15) {
            recommendations.push({
                priority: 'medium',
                category: 'retention',
                title: '优化游戏化机制以提升留存',
                description: '游戏化功能对留存的提升效果不够明显',
                suggestedActions: [
                    '重新设计奖励机制',
                    '增加更多长期目标',
                    '优化挑战难度曲线'
                ]
            });
        }
        
        return recommendations;
    }
}
```

---

## 🧪 A/B测试框架

### 测试配置系统
```typescript
// services/ABTestService.ts
export class ABTestService {
    async createTest(config: ABTestConfig): Promise<ABTest> {
        const test = await this.db.query(`
            INSERT INTO ab_tests 
            (name, hypothesis, variants, success_metrics, start_date, end_date, sample_size)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            config.name,
            config.hypothesis,
            JSON.stringify(config.variants),
            JSON.stringify(config.successMetrics),
            config.startDate,
            config.endDate,
            config.sampleSize
        ]);
        
        return test.rows[0];
    }
    
    async assignUserToVariant(userId: number, testId: string): Promise<string> {
        // 检查用户是否已经被分配
        const existing = await this.db.query(`
            SELECT variant FROM ab_test_assignments 
            WHERE user_id = $1 AND test_id = $2
        `, [userId, testId]);
        
        if (existing.rows.length > 0) {
            return existing.rows[0].variant;
        }
        
        // 基于用户ID哈希分配变体
        const variant = this.hashUserToVariant(userId, testId);
        
        // 记录分配
        await this.db.query(`
            INSERT INTO ab_test_assignments (user_id, test_id, variant)
            VALUES ($1, $2, $3)
        `, [userId, testId, variant]);
        
        return variant;
    }
    
    async trackTestEvent(
        userId: number, 
        testId: string, 
        eventType: string, 
        eventData: any
    ): Promise<void> {
        const variant = await this.getUserVariant(userId, testId);
        
        await this.db.query(`
            INSERT INTO ab_test_events 
            (user_id, test_id, variant, event_type, event_data)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, testId, variant, eventType, JSON.stringify(eventData)]);
    }
}
```

---

## 📊 监控和运维

### 实时监控仪表板
```typescript
// services/MonitoringService.ts
export class GamificationMonitoringService {
    async getRealtimeMetrics(): Promise<RealtimeMetrics> {
        const [
            activeUsers,
            experienceGeneration,
            achievementUnlocks,
            challengeParticipation,
            systemHealth
        ] = await Promise.all([
            this.getActiveUsersMetrics(),
            this.getExperienceMetrics(),
            this.getAchievementMetrics(),
            this.getChallengeMetrics(),
            this.getSystemHealthMetrics()
        ]);
        
        return {
            activeUsers,
            experienceGeneration,
            achievementUnlocks,
            challengeParticipation,
            systemHealth,
            timestamp: new Date()
        };
    }
    
    async setupAlerts(): Promise<void> {
        // 设置关键指标告警
        const alerts = [
            {
                metric: 'daily_active_gamified_users',
                threshold: 0.15, // 下降15%触发告警
                type: 'decrease'
            },
            {
                metric: 'achievement_unlock_rate',
                threshold: 50, // 每小时少于50个解锁触发告警
                type: 'below_value'
            },
            {
                metric: 'api_response_time',
                threshold: 1000, // 响应时间超过1秒触发告警
                type: 'above_value'
            }
        ];
        
        for (const alert of alerts) {
            await this.createAlert(alert);
        }
    }
}
```

---

## 🚀 部署和发布策略

### 渐进式发布计划
```yaml
# deployment/gamification-rollout.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: gamification-service
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10    # 10%用户体验新功能
      - pause: 
          duration: 2h   # 观察2小时
      - setWeight: 25    # 扩展到25%
      - pause:
          duration: 4h   # 观察4小时  
      - setWeight: 50    # 扩展到50%
      - pause:
          duration: 8h   # 观察8小时
      - setWeight: 100   # 全量发布
      
      trafficRouting:
        nginx:
          stableService: gamification-stable
          canaryService: gamification-canary
          
      analysis:
        templates:
        - templateName: gamification-success-rate
        args:
        - name: service-name
          value: gamification-service
```

### 功能开关配置
```typescript
// config/featureFlags.ts
export const GAMIFICATION_FEATURE_FLAGS = {
    // 基础功能
    EXPERIENCE_SYSTEM: true,
    ACHIEVEMENT_SYSTEM: true,
    FOOD_MAP_BASIC: true,
    
    // 高级功能（逐步开放）
    AI_COMPANION: false,
    ADVANCED_CHALLENGES: false,
    SOCIAL_LEADERBOARDS: false,
    
    // 实验性功能
    PERSONALIZED_REWARDS: false,
    SEASONAL_EVENTS: false,
    
    // A/B测试
    ACHIEVEMENT_NOTIFICATION_DELAY: 'control', // 'control' | 'delayed_5s' | 'delayed_next_session'
    REWARD_TYPE_EXPERIMENT: 'control' // 'control' | 'badge_focused' | 'exp_focused' | 'social_focused'
};

// 使用示例
function shouldShowFeature(featureName: string, userId?: number): boolean {
    const flag = GAMIFICATION_FEATURE_FLAGS[featureName];
    
    if (typeof flag === 'boolean') {
        return flag;
    }
    
    // A/B测试逻辑
    if (userId && typeof flag === 'string') {
        return ABTestService.getUserVariant(userId, featureName) === flag;
    }
    
    return false;
}
```

---

## 📋 检查清单

### 阶段一完成检查清单
- [ ] 数据库表结构创建完成
- [ ] 基础API接口实现完成
- [ ] 前端组件开发完成
- [ ] 经验值系统测试通过
- [ ] 成就系统测试通过
- [ ] 美食地图基础功能测试通过
- [ ] 单元测试覆盖率 > 80%
- [ ] 性能测试通过（响应时间 < 200ms）
- [ ] 安全测试通过

### 阶段二完成检查清单
- [ ] 挑战系统完整实现
- [ ] 社交功能基础实现
- [ ] 排行榜系统实现
- [ ] AI伙伴基础对话实现
- [ ] 实时通知系统实现
- [ ] 首个A/B测试上线
- [ ] 监控仪表板上线
- [ ] 用户反馈收集系统上线

### 阶段三完成检查清单
- [ ] 高级个性化功能实现
- [ ] 季节性活动系统实现
- [ ] 完整数据分析平台上线
- [ ] 性能优化完成
- [ ] 全功能安全审计通过
- [ ] 用户接受度测试通过（满意度 > 4.0/5.0）
- [ ] 商业指标达成（留存率提升 > 20%）

---

*实施指南版本: v1.0*  
*创建日期: 2025年9月10日*  
*最后更新: 2025年9月10日*
