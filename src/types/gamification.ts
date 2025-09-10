// 游戏化系统类型定义

export interface UserGamificationProfile {
  id: string;
  userId: string;
  level: number;
  currentExp: number;
  totalExp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  preferredChallengeType?: string;
  gamificationPreferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  badgeColor?: string;
  requirements: AchievementRequirement;
  rewards: AchievementReward;
  unlockCondition?: Record<string, any>;
  isHidden: boolean;
  isActive: boolean;
  sortOrder: number;
}

export enum AchievementCategory {
  STREAKS = 'streaks',
  NUTRITION = 'nutrition',
  SOCIAL = 'social',
  EXPLORATION = 'exploration',
  CHALLENGES = 'challenges',
  KNOWLEDGE = 'knowledge',
  HABITS = 'habits',
  MILESTONES = 'milestones'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface AchievementRequirement {
  type: string;
  value: number;
  conditions?: Record<string, any>;
}

export interface AchievementReward {
  exp?: number;
  badge?: string;
  title?: string;
  exclusiveFrame?: string;
  discountCoupon?: string;
  [key: string]: any;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  progress: Record<string, any>;
  unlockDate?: Date;
  isClaimed: boolean;
  claimedDate?: Date;
  notificationSent: boolean;
}

export interface Challenge {
  id: string;
  code: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category: string;
  requirements: ChallengeRequirement;
  rewards: ChallengeReward;
  maxParticipants?: number;
  isTeamBased: boolean;
  teamSize: number;
  startDate: Date;
  endDate: Date;
  status: ChallengeStatus;
  autoJoin: boolean;
}

export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  SPECIAL = 'special'
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  LEGENDARY = 'legendary'
}

export interface ChallengeRequirement {
  type: string;
  target: number;
  timeframe?: string;
  conditions?: Record<string, any>;
}

export interface ChallengeReward {
  exp: number;
  badge?: string;
  title?: string;
  discountCoupon?: string;
  [key: string]: any;
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface UserChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge;
  teamId?: string;
  progress: Record<string, any>;
  status: ParticipationStatus;
  score: number;
  rank?: number;
  joinedAt: Date;
  completedAt?: Date;
  rewardsClaimed: boolean;
}

export enum ParticipationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned'
}

export interface FoodMap {
  id: string;
  title: string;
  description: string;
  type: FoodMapType;
  totalSpots: number;
  unlockCondition?: Record<string, any>;
  rewards?: Record<string, any>;
  isActive: boolean;
  backgroundImage?: string;
  spots: FoodMapSpot[];
}

export enum FoodMapType {
  REGIONAL = 'regional',
  CUISINE = 'cuisine',
  INGREDIENT = 'ingredient',
  NUTRITION = 'nutrition'
}

export interface FoodMapSpot {
  id: string;
  mapId: string;
  name: string;
  description: string;
  category: string;
  difficulty: SpotDifficulty;
  coordinates: { x: number; y: number };
  unlockRequirements?: Record<string, any>;
  rewards?: Record<string, any>;
  nutritionHighlight?: string;
  culturalInfo?: string;
  isDiscovered?: boolean;
  discoveredAt?: Date;
}

export enum SpotDifficulty {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  LEGENDARY = 'legendary'
}

export interface UserFoodDiscovery {
  id: string;
  userId: string;
  mapId: string;
  spotId: string;
  spot?: FoodMapSpot;
  discoveryMethod: string;
  mealRecordId?: string;
  discoveredAt: Date;
}

export interface ExpTransaction {
  id: string;
  userId: string;
  source: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface UserRelationship {
  id: string;
  userId: string;
  targetUserId: string;
  relationshipType: RelationshipType;
  status: RelationshipStatus;
  createdAt: Date;
}

export enum RelationshipType {
  FOLLOW = 'follow',
  MUTUAL_FOLLOW = 'mutual_follow',
  DIET_BUDDY = 'diet_buddy',
  CHALLENGE_TEAMMATE = 'challenge_teammate'
}

export enum RelationshipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  level?: number;
  metadata?: Record<string, any>;
}

export interface LeaderboardSnapshot {
  id: string;
  category: string;
  timeframe: string;
  userId: string;
  score: number;
  rank: number;
  snapshotDate: Date;
  metadata?: Record<string, any>;
}

// 经验值来源配置
export interface ExpSourceConfig {
  action: string;
  baseExp: number;
  multiplier?: number;
  dailyLimit?: number;
  description: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExpResult {
  newExp: number;
  totalExp: number;
  levelUp: LevelUpResult;
}

export interface LevelUpResult {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  rewards: AchievementReward[];
}

export interface DiscoveryResult {
  discovered: boolean;
  rewards: Record<string, any>;
  mapProgress: MapProgress;
}

export interface MapProgress {
  mapId: string;
  discoveredSpots: string[];
  totalSpots: number;
  completionPercentage: number;
  rewardsEarned: Record<string, any>[];
}

// 个性化相关类型
export enum UserMotivationType {
  ACHIEVEMENT_ORIENTED = 'achievement_oriented',
  SOCIAL_ORIENTED = 'social_oriented',
  KNOWLEDGE_SEEKER = 'knowledge_seeker',
  COLLECTOR = 'collector'
}

export interface UserBehaviorProfile {
  userId: string;
  primaryMotivation: UserMotivationType;
  activityPattern: string;
  featureUsage: Record<string, number>;
  socialEngagement: number;
  progressionSpeed: number;
  updatedAt: Date;
}

// AI伙伴相关类型
export interface AICompanionResponse {
  message: string;
  emotion: string;
  suggestedActions: string[];
  followUpQuestions: string[];
  animation?: string;
}

// 通知系统类型
export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  CHALLENGE_COMPLETED = 'challenge_completed',
  FRIEND_ADDED = 'friend_added',
  STREAK_MILESTONE = 'streak_milestone',
  MAP_COMPLETED = 'map_completed'
}
