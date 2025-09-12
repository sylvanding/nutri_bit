import React, { useState, useRef, useEffect } from 'react';
import { Camera, Home, BookOpen, Users, User, MessageCircle, TrendingUp, Target, Award, ShoppingCart, Heart, Star, Clock, Zap, Check, BarChart3, Plus, Utensils, Coffee, Sandwich, Apple, Droplets, Filter, Search, Tag, Sparkles, Crown, Brain, Eye, Cpu, Wand2, Stethoscope, Video, Phone, MessageSquare, CheckCircle, XCircle, Badge, GraduationCap, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UltraSimpleGamificationPanel from './components/gamification/UltraSimpleGamificationPanel';
import { useUltraSimpleGamificationStore } from './stores/ultraSimpleGamificationStore';

// 会员系统导入
import { useMembership, useMembershipGuard } from './hooks/useMembership';
import { MembershipBadge } from './components/membership/MembershipGuard';
import { UpgradeModal } from './components/membership/UpgradeModal';
import { MembershipCenter } from './components/membership/MembershipCenter';
import { MembershipTier } from './types/membership';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  fiber: number;
}

interface MealRecord {
  id: string;
  image: string;
  name: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutrition: NutritionData;
  score: number;
}

interface KOLPost {
  id: string;
  avatar: string;
  name: string;
  title: string;
  image: string;
  time: string;
  likes: number;
  nutrition: NutritionData;
  price: number;
  isFollowable: boolean;
}

interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  cookTime: number;
  rating: number;
  nutrition: NutritionData;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    name: string;
    amount: string;
    category: 'main' | 'seasoning' | 'garnish';
  }>;
  steps: Array<{
    stepNumber: number;
    description: string;
    image?: string;
    time?: number;
  }>;
  tips: string[];
  kitPrice: number;
  readyMealPrice: number;
  category: string[];
  tags: string[];
  cuisineType?: string; // 菜系类型
  isNew?: boolean; // 是否为新菜品
  popularity?: number; // 受欢迎程度 (0-1)
  seasonality?: string[]; // 季节性 ['spring', 'summer', 'autumn', 'winter']
  mealTime?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]; // 适合的用餐时间
}

interface CommonFood {
  id: string;
  name: string;
  icon: string;
  nutrition: NutritionData;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'nuts' | 'dairy';
}

interface HealthProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'light' | 'moderate' | 'heavy';
  healthGoal: 'weight_loss' | 'muscle_gain' | 'maintain_health' | 'special_nutrition';
  specialNutritionFocus?: 'low_sodium' | 'high_protein' | 'low_carb' | 'high_fiber';
  createdAt: string;
  updatedAt: string;
}

interface DailyNutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  fiber: number;
}

// 饮食计划相关数据结构
interface DietPlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  duration: number; // 天数
  price: number;
  originalPrice?: number; // 原价，用于显示折扣
  rating: number;
  reviewCount: number;
  tags: string[];
  targetGroups: ('weight_loss' | 'muscle_gain' | 'diabetes' | 'pregnancy' | 'elderly' | 'athlete' | 'office_worker')[];
  difficulty: 'easy' | 'medium' | 'hard';
  features: string[];
  nutritionFocus: string[];
  dailyCaloriesRange: [number, number];
  mealCount: number; // 每日餐数
  includedServices: string[];
  trainerInfo?: {
    name: string;
    avatar: string;
    title: string;
    experience: string;
  };
  sampleMeals: Array<{
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    image: string;
    calories: number;
  }>;
  createdAt: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  purchaseCount: number;
}

interface DietPlanCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  targetGroup: string;
}

// 用户购买的营养计划
interface UserNutritionPlan {
  id: string;
  plan: DietPlan;
  purchaseDate: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  totalDays: number;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  todayRecommendation?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  adherenceRate: number; // 遵循率 0-100
  remainingDays: number;
}

// AI聊天消息接口
interface ChatMessage {
  id: number;
  text: string;
  isAI: boolean;
  timestamp: Date;
  mood?: 'happy' | 'caring' | 'excited' | 'thinking';
  hasCard?: boolean;
  card?: any;
}

// 营养师相关接口
interface Nutritionist {
  id: string;
  name: string;
  avatar: string;
  title: string;
  experience: number; // 工作年限
  rating: number;
  reviewCount: number;
  specialties: string[]; // 专业领域
  education: string; // 教育背景
  certifications: string[]; // 认证资质
  consultationPrice: number; // 单次咨询价格
  available: boolean;
  nextAvailableTime?: string;
  bio: string; // 个人简介
  languages: string[]; // 语言能力
  location: string;
}

interface ConsultationSession {
  id: string;
  nutritionistId: string;
  nutritionist: Nutritionist;
  userId: string;
  date: string;
  time: string;
  duration: number; // 分钟
  type: 'video' | 'voice' | 'chat';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  prescription?: string; // 营养师建议
  followUpDate?: string;
  chatHistory?: ConsultationMessage[];
}

interface ConsultationMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'nutritionist';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  attachments?: string[];
}

interface PremiumMealPlan {
  id: string;
  title: string;
  description: string;
  targetGroup: 'pregnant' | 'diabetes' | 'postSurgery' | 'elderly' | 'children' | 'athletes';
  targetGroupLabel: string;
  duration: number; // 天数
  price: number;
  originalPrice: number;
  discount?: number;
  image: string;
  features: string[];
  included: string[]; // 包含内容
  nutritionist: Nutritionist;
  sampleMeals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  benefits: string[]; // 预期效果
  contraindications?: string[]; // 禁忌症
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  tags: string[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showCamera, setShowCamera] = useState(false);
  const [showNutritionReport, setShowNutritionReport] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  // 营养师咨询相关状态
  const [selectedNutritionist, setSelectedNutritionist] = useState<Nutritionist | null>(null);
  const [showNutritionistDetail, setShowNutritionistDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsultationChat, setShowConsultationChat] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<ConsultationSession | null>(null);
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState<PremiumMealPlan | null>(null);
  const [showPremiumPlanDetail, setShowPremiumPlanDetail] = useState(false);
  
  // 商城相关状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedKOLPost, setSelectedKOLPost] = useState<KOLPost | null>(null);
  
  // 游戏化系统
  const { addExp, logMeal, level, exp, streak, totalMeals, achievements } = useUltraSimpleGamificationStore();
  
  // 会员系统
  const { membership, permissions, actions, ui } = useMembership();
  const { executeWithPermission } = useMembershipGuard();
  
  // 新增状态：拍照后的餐次选择
  const [showMealSelection, setShowMealSelection] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  // 菜品修正相关状态
  const [showFoodCorrectionModal, setShowFoodCorrectionModal] = useState(false);
  const [correctionFoodIndex, setCorrectionFoodIndex] = useState<number>(-1);
  const [correctionType, setCorrectionType] = useState<'weight' | 'food'>('weight');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 菜品数据库
  const foodDatabase = [
    { id: 1, name: '宫保鸡丁', category: '川菜', calories: 180, protein: 20, carbs: 8, fat: 8, description: '经典川菜，鸡丁配花生' },
    { id: 2, name: '麻婆豆腐', category: '川菜', calories: 150, protein: 12, carbs: 6, fat: 10, description: '嫩滑豆腐配麻辣调料' },
    { id: 3, name: '红烧肉', category: '家常菜', calories: 280, protein: 18, carbs: 12, fat: 20, description: '肥瘦相间，香甜软糯' },
    { id: 4, name: '清蒸鲈鱼', category: '粤菜', calories: 120, protein: 25, carbs: 2, fat: 3, description: '鲜嫩鱼肉，清淡营养' },
    { id: 5, name: '蒸蛋羹', category: '家常菜', calories: 80, protein: 6, carbs: 1, fat: 5, description: '嫩滑蛋羹，营养丰富' },
    { id: 6, name: '白米饭', category: '主食', calories: 130, protein: 3, carbs: 28, fat: 0.3, description: '经典主食，提供能量' },
    { id: 7, name: '青椒炒肉丝', category: '家常菜', calories: 160, protein: 15, carbs: 8, fat: 8, description: '青椒脆嫩，肉丝鲜美' },
    { id: 8, name: '西红柿鸡蛋', category: '家常菜', calories: 100, protein: 8, carbs: 6, fat: 6, description: '酸甜开胃，营养均衡' },
    { id: 9, name: '土豆丝', category: '素菜', calories: 90, protein: 2, carbs: 18, fat: 2, description: '爽脆土豆丝，清淡可口' },
    { id: 10, name: '紫菜蛋花汤', category: '汤品', calories: 60, protein: 4, carbs: 3, fat: 3, description: '清淡汤品，营养补充' },
    { id: 11, name: '糖醋里脊', category: '鲁菜', calories: 220, protein: 16, carbs: 25, fat: 8, description: '酸甜可口，外酥内嫩' },
    { id: 12, name: '油焖大虾', category: '鲁菜', calories: 140, protein: 20, carbs: 3, fat: 5, description: '鲜美大虾，营养丰富' },
    { id: 13, name: '酸辣土豆丝', category: '川菜', calories: 95, protein: 2, carbs: 18, fat: 3, description: '酸辣开胃，爽脆可口' },
    { id: 14, name: '小笼包', category: '点心', calories: 250, protein: 12, carbs: 35, fat: 8, description: '皮薄馅大，汤汁丰富' },
    { id: 15, name: '煎饺', category: '点心', calories: 200, protein: 10, carbs: 25, fat: 8, description: '外焦内嫩，香味浓郁' }
  ];
  
  // 重新计算营养摘要的函数
  const recalculateNutritionSummary = (detectedFoods: any[]) => {
    const totalCalories = detectedFoods.reduce((sum, food) => sum + food.nutrition.calories, 0);
    const totalProtein = detectedFoods.reduce((sum, food) => sum + food.nutrition.protein, 0);
    const totalCarbs = detectedFoods.reduce((sum, food) => sum + food.nutrition.carbs, 0);
    const totalFat = detectedFoods.reduce((sum, food) => sum + food.nutrition.fat, 0);
    const totalFiber = detectedFoods.reduce((sum, food) => sum + food.nutrition.fiber, 0);
    const totalSodium = detectedFoods.reduce((sum, food) => sum + food.nutrition.sodium, 0);
    
    // 重新计算营养评分
    let nutritionScore = 80; // 基础分
    
    // 蛋白质评分 (20-40g 最佳)
    if (totalProtein >= 20 && totalProtein <= 40) nutritionScore += 5;
    else if (totalProtein < 15 || totalProtein > 50) nutritionScore -= 10;
    
    // 脂肪比例评分 (20-35% 最佳)
    const fatRatio = (totalFat * 9) / totalCalories;
    if (fatRatio >= 0.2 && fatRatio <= 0.35) nutritionScore += 5;
    else if (fatRatio < 0.15 || fatRatio > 0.4) nutritionScore -= 10;
    
    // 碳水比例评分 (45-65% 最佳)
    const carbRatio = (totalCarbs * 4) / totalCalories;
    if (carbRatio >= 0.45 && carbRatio <= 0.65) nutritionScore += 5;
    else if (carbRatio < 0.3 || carbRatio > 0.7) nutritionScore -= 10;
    
    // 钠含量评分 (低于800mg较好)
    if (totalSodium < 600) nutritionScore += 5;
    else if (totalSodium > 1000) nutritionScore -= 10;
    
    // 确保评分在合理范围内
    nutritionScore = Math.max(40, Math.min(100, nutritionScore));
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      sodium: Math.round(totalSodium),
      nutritionScore
    };
  };

  // 修正食物的函数
  const handleWeightCorrection = (newWeight: number) => {
    if (!analysisResults || correctionFoodIndex === -1) return;
    
    const updatedFoods = [...analysisResults.detectedFoods];
    const food = updatedFoods[correctionFoodIndex];
    const ratio = newWeight / food.weight;
    
    // 按比例调整营养成分
    updatedFoods[correctionFoodIndex] = {
      ...food,
      weight: newWeight,
      nutrition: {
        calories: Math.round(food.nutrition.calories * ratio),
        protein: Math.round(food.nutrition.protein * ratio * 10) / 10,
        carbs: Math.round(food.nutrition.carbs * ratio * 10) / 10,
        fat: Math.round(food.nutrition.fat * ratio * 10) / 10,
        fiber: Math.round(food.nutrition.fiber * ratio * 10) / 10,
        sodium: Math.round(food.nutrition.sodium * ratio)
      }
    };
    
    // 重新计算营养摘要
    const newNutritionSummary = recalculateNutritionSummary(updatedFoods);
    
    setAnalysisResults({
      ...analysisResults,
      detectedFoods: updatedFoods,
      nutritionSummary: newNutritionSummary,
      nutritionScore: newNutritionSummary.nutritionScore
    });
    
    setShowFoodCorrectionModal(false);
  };
  
  const handleFoodReplacement = (newFood: any, weight: number) => {
    if (!analysisResults || correctionFoodIndex === -1) return;
    
    const updatedFoods = [...analysisResults.detectedFoods];
    const ratio = weight / 100; // 数据库中的营养成分基于100g
    
    // 生成新的食材列表（简化版）
    const newIngredients = [
      { name: newFood.name, amount: `${weight}g`, category: 'protein' }
    ];
    
    updatedFoods[correctionFoodIndex] = {
      id: Date.now(),
      name: newFood.name,
      weight: weight,
      confidence: 100, // 手动选择的置信度为100%
      nutrition: {
        calories: Math.round(newFood.calories * ratio),
        protein: Math.round(newFood.protein * ratio * 10) / 10,
        carbs: Math.round(newFood.carbs * ratio * 10) / 10,
        fat: Math.round(newFood.fat * ratio * 10) / 10,
        fiber: 2.0, // 默认值
        sodium: 300 // 默认值
      },
      ingredients: newIngredients
    };
    
    // 重新计算营养摘要
    const newNutritionSummary = recalculateNutritionSummary(updatedFoods);
    
    setAnalysisResults({
      ...analysisResults,
      detectedFoods: updatedFoods,
      nutritionSummary: newNutritionSummary,
      nutritionScore: newNutritionSummary.nutritionScore
    });
    
    setShowFoodCorrectionModal(false);
  };
  
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedMealTime, setSelectedMealTime] = useState('all');
  const [selectedInsightPeriod, setSelectedInsightPeriod] = useState('today');
  const [showCommonFoods, setShowCommonFoods] = useState(false);
  const [selectedMealForReport, setSelectedMealForReport] = useState<string | null>(null);
  
  // 菜谱相关状态
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  // 健康档案相关状态
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [showHealthProfile, setShowHealthProfile] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // AI分析流程相关状态
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisSteps, setAiAnalysisSteps] = useState<Array<{
    step: string;
    content: string;
    status: 'pending' | 'processing' | 'completed';
    timestamp?: string;
  }>>([]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(-1);
  
  // 移除了分析步骤滚动控制的ref
  
  // 自动关闭倒计时状态
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    detectedFoods: Array<{
      name: string;
      confidence: number;
      weight: number; // 重量（克）
      ingredients: Array<{
        name: string;
        amount: string;
        category: 'protein' | 'vegetable' | 'carb' | 'seasoning' | 'other';
      }>;
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
    nutritionSummary: NutritionData;
    nutritionScore: number;
    recommendations: string[];
  } | null>(null);

  // 在组件加载时从localStorage读取健康档案
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('healthProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile) as HealthProfile;
        setHealthProfile(profile);
      } catch (error) {
        console.error('加载健康档案失败:', error);
      }
    }
  }, []);

  // 监听分析结果状态变化，确保UI正确更新
  React.useEffect(() => {
    // 确保UI在分析完成时正确更新
    if (analysisResults && currentAnalysisStep >= 6) {
      // 分析结果可以正常显示
    }
  }, [analysisResults, currentAnalysisStep]);

  // 不再自动滚动，让用户可以自由查看分析步骤

  // 监听分析完成状态，自动收起分析界面
  React.useEffect(() => {
    if (analysisResults && currentAnalysisStep >= 5) {
      // 开始3秒倒计时
      setAutoCloseCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setAutoCloseCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            setShowAIAnalysis(false);
            setShowNutritionReport(true);
            setAutoCloseCountdown(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // 清理定时器
      return () => {
        clearInterval(countdownInterval);
        setAutoCloseCountdown(null);
      };
    }
  }, [analysisResults, currentAnalysisStep]);

  // 基于当前时间自动检测餐次
  const detectMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 10) {
      return 'breakfast';
    } else if (currentHour >= 10 && currentHour < 14) {
      return 'lunch';
    } else if (currentHour >= 17 && currentHour < 21) {
      return 'dinner';
    } else {
      return 'snack';
    }
  };

  // AI分析流程
  const startAIAnalysis = async () => {
    // 重置分析状态
    setAiAnalysisSteps([]);
    setCurrentAnalysisStep(-1);
    setAnalysisResults(null);
    setAutoCloseCountdown(null);

    const steps = [
      { step: 'image_processing', content: '正在处理图像...', status: 'pending' as const },
      { step: 'food_recognition', content: '正在识别食物...', status: 'pending' as const },
      { step: 'ingredient_analysis', content: '正在分析食材成分...', status: 'pending' as const },
      { step: 'nutrition_calculation', content: '正在计算营养信息...', status: 'pending' as const },
      { step: 'user_profile_matching', content: '正在匹配个人档案...', status: 'pending' as const },
      { step: 'report_generation', content: '正在生成营养报告...', status: 'pending' as const }
    ];

    setAiAnalysisSteps(steps);

    // 模拟AI分析过程
    for (let i = 0; i < steps.length; i++) {
      // 同时更新当前步骤和步骤状态
      setCurrentAnalysisStep(i);
      setAiAnalysisSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'processing' } : step
      ));

      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      // 根据步骤更新内容
      let updatedContent = '';
      const timestamp = new Date().toLocaleTimeString();

      switch (steps[i].step) {
        case 'image_processing':
          updatedContent = '图像处理完成，检测到清晰的食物图像';
          break;
        case 'food_recognition':
          updatedContent = '识别到以下食物：\n• 宫保鸡丁 (置信度: 95%)\n• 蒸蛋羹 (置信度: 88%)\n• 米饭 (置信度: 92%)';
          break;
        case 'ingredient_analysis':
          updatedContent = '食材成分分析：\n宫保鸡丁：鸡胸肉、花生米、青椒、红椒、葱、蒜、生抽、老抽、料酒、糖、盐\n蒸蛋羹：鸡蛋、温水、盐、香油\n米饭：大米';
          break;
        case 'nutrition_calculation':
          updatedContent = '营养信息计算完成：\n• 总热量: 520 千卡\n• 蛋白质: 28g\n• 碳水化合物: 45g\n• 脂肪: 22g\n• 膳食纤维: 3g\n• 钠: 680mg';
          break;
        case 'user_profile_matching':
          updatedContent = healthProfile 
            ? `已匹配个人档案：${healthProfile.name}\n• 年龄: ${healthProfile.age}岁\n• 健康目标: ${getHealthGoalName(healthProfile.healthGoal)}\n• 活动水平: ${getActivityLevelName(healthProfile.activityLevel)}`
            : '未检测到个人档案，将使用通用营养建议';
          break;
        case 'report_generation':
          updatedContent = '营养报告生成完成！\n• 营养评分: 82分\n• 建议: 适量减少钠摄入，增加蔬菜比例';
          break;
      }

      // 更新步骤为完成状态
      setAiAnalysisSteps(prev => prev.map((step, index) => 
        index === i ? { 
          ...step, 
          status: 'completed', 
          content: updatedContent,
          timestamp: timestamp
        } : step
      ));
    }

    // 设置最终分析结果
    setAnalysisResults({
      detectedFoods: [
        {
          name: '宫保鸡丁',
          confidence: 95,
          weight: 180,
          ingredients: [
            { name: '鸡胸肉', amount: '120g', category: 'protein' },
            { name: '花生米', amount: '25g', category: 'other' },
            { name: '青椒', amount: '15g', category: 'vegetable' },
            { name: '红椒', amount: '10g', category: 'vegetable' },
            { name: '葱', amount: '5g', category: 'vegetable' },
            { name: '蒜', amount: '3g', category: 'seasoning' },
            { name: '生抽', amount: '1ml', category: 'seasoning' },
            { name: '老抽', amount: '0.5ml', category: 'seasoning' },
            { name: '料酒', amount: '1ml', category: 'seasoning' }
          ],
          nutrition: {
            calories: 285,
            protein: 22,
            carbs: 12,
            fat: 16
          }
        },
        {
          name: '蒸蛋羹',
          confidence: 88,
          weight: 120,
          ingredients: [
            { name: '鸡蛋', amount: '80g', category: 'protein' },
            { name: '温水', amount: '40ml', category: 'other' },
            { name: '盐', amount: '1g', category: 'seasoning' },
            { name: '香油', amount: '2ml', category: 'seasoning' }
          ],
          nutrition: {
            calories: 126,
            protein: 6,
            carbs: 1,
            fat: 11
          }
        },
        {
          name: '米饭',
          confidence: 92,
          weight: 150,
          ingredients: [
            { name: '大米', amount: '150g', category: 'carb' }
          ],
          nutrition: {
            calories: 174,
            protein: 4,
            carbs: 35,
            fat: 0.5
          }
        }
      ],
      nutritionSummary: {
        calories: 520,
        protein: 28,
        carbs: 45,
        fat: 22,
        sodium: 680,
        fiber: 3
      },
      nutritionScore: 82,
      recommendations: [
        '这餐的蛋白质含量很好，有助于肌肉维护',
        '建议适量减少钠摄入，可以要求少盐烹饪',
        '可以增加一些绿叶蔬菜来提升膳食纤维摄入',
        '整体营养搭配较为均衡，符合您的健康目标'
      ]
    });

    // 延迟设置完成状态，确保analysisResults先设置
    setTimeout(() => {
      setCurrentAnalysisStep(steps.length);
    }, 100);
  };

  // 获取健康目标名称
  const getHealthGoalName = (goal: string) => {
    const goalNames = {
      'weight_loss': '减重',
      'muscle_gain': '增肌',
      'maintain_health': '维持健康',
      'special_nutrition': '特殊营养需求'
    };
    return goalNames[goal as keyof typeof goalNames] || goal;
  };

  // 获取活动水平名称
  const getActivityLevelName = (level: string) => {
    const levelNames = {
      'light': '轻度活动',
      'moderate': '中度活动',
      'heavy': '重度活动'
    };
    return levelNames[level as keyof typeof levelNames] || level;
  };

  // 计算基础代谢率(BMR) - 使用修订版Harris-Benedict公式
  const calculateBMR = (profile: HealthProfile): number => {
    const { age, gender, height, weight } = profile;
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  // 计算每日总能量消耗(TDEE)
  const calculateTDEE = (profile: HealthProfile): number => {
    const bmr = calculateBMR(profile);
    const activityMultipliers = {
      light: 1.375,    // 轻度运动：每周1-3次
      moderate: 1.55,  // 中度运动：每周3-5次
      heavy: 1.725     // 重度运动：每周6-7次
    };
    
    return bmr * activityMultipliers[profile.activityLevel];
  };

  // 根据健康目标调整热量
  const adjustCaloriesForGoal = (tdee: number, goal: HealthProfile['healthGoal']): number => {
    switch (goal) {
      case 'weight_loss':
        return tdee - 500; // 每日减少500卡路里，约每周减重0.5kg
      case 'muscle_gain':
        return tdee + 300; // 每日增加300卡路里支持肌肉增长
      case 'maintain_health':
        return tdee;
      case 'special_nutrition':
        return tdee; // 特殊营养关注通常维持基础代谢
      default:
        return tdee;
    }
  };

  // 计算营养素分配
  const calculateMacronutrients = (calories: number, profile: HealthProfile): DailyNutritionTargets => {
    let proteinRatio = 0.25; // 默认蛋白质占25%
    let carbsRatio = 0.45;   // 默认碳水化合物占45%
    let fatRatio = 0.30;     // 默认脂肪占30%

    // 根据健康目标调整营养素比例
    switch (profile.healthGoal) {
      case 'weight_loss':
        proteinRatio = 0.30; // 减脂期增加蛋白质比例
        carbsRatio = 0.35;
        fatRatio = 0.35;
        break;
      case 'muscle_gain':
        proteinRatio = 0.30; // 增肌期保持高蛋白
        carbsRatio = 0.45;
        fatRatio = 0.25;
        break;
      case 'special_nutrition':
        // 根据特殊营养关注调整
        if (profile.specialNutritionFocus === 'high_protein') {
          proteinRatio = 0.35;
          carbsRatio = 0.35;
          fatRatio = 0.30;
        } else if (profile.specialNutritionFocus === 'low_carb') {
          proteinRatio = 0.30;
          carbsRatio = 0.20;
          fatRatio = 0.50;
        }
        break;
    }

    const protein = (calories * proteinRatio) / 4; // 1g蛋白质 = 4卡路里
    const carbs = (calories * carbsRatio) / 4;     // 1g碳水化合物 = 4卡路里
    const fat = (calories * fatRatio) / 9;         // 1g脂肪 = 9卡路里

    // 计算钠的推荐摄入量
    let sodium = 2300; // 默认每日2300mg钠
    if (profile.specialNutritionFocus === 'low_sodium') {
      sodium = 1500; // 低钠饮食：每日1500mg
    }

    // 计算膳食纤维推荐摄入量
    const fiber = profile.gender === 'male' ? 
      (profile.age <= 50 ? 38 : 30) : 
      (profile.age <= 50 ? 25 : 21);

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      sodium: sodium,
      fiber: fiber
    };
  };

  // 计算用户的营养目标
  const calculateNutritionTargets = (profile: HealthProfile): DailyNutritionTargets => {
    const tdee = calculateTDEE(profile);
    const targetCalories = adjustCaloriesForGoal(tdee, profile.healthGoal);
    return calculateMacronutrients(targetCalories, profile);
  };

  // 商城相关辅助函数
  // 根据用户档案推荐饮食计划
  const getRecommendedPlans = (profile: HealthProfile | null): DietPlan[] => {
    if (!profile) return dietPlans.filter(plan => plan.isRecommended).slice(0, 3);
    
    return dietPlans
      .filter(plan => {
        // 基于用户健康目标匹配
        if (profile.healthGoal === 'weight_loss' && plan.targetGroups.includes('weight_loss')) return true;
        if (profile.healthGoal === 'muscle_gain' && plan.targetGroups.includes('muscle_gain')) return true;
        return plan.isRecommended;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  // 筛选饮食计划
  const getFilteredPlans = (): DietPlan[] => {
    let filtered = dietPlans;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plan => 
        plan.targetGroups.some(group => group === selectedCategory)
      );
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(query) ||
        plan.subtitle.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query) ||
        plan.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // 优先显示推荐和热门计划
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.rating - a.rating;
    });
  };

  // 动态计算营养目标
  const nutritionTargets = healthProfile 
    ? calculateNutritionTargets(healthProfile)
    : { calories: 2000, protein: 120, carbs: 250, fat: 65, sodium: 2300, fiber: 25 }; // 默认值

  const todayNutrition = {
    target: nutritionTargets,
    current: { calories: 1636, protein: 97, carbs: 195, fat: 60, sodium: 1185, fiber: 29 }
  };

  // 每餐热量标准 - 基于用户的营养目标动态计算
  const mealCalorieStandards = {
    all: nutritionTargets.calories,
    breakfast: Math.round(nutritionTargets.calories * 0.25),  // 25%
    lunch: Math.round(nutritionTargets.calories * 0.35),      // 35%
    dinner: Math.round(nutritionTargets.calories * 0.30),     // 30%
    snack: Math.round(nutritionTargets.calories * 0.10)       // 10%
  };

  // 分餐营养数据
  const mealNutritionByType = {
    breakfast: { calories: 420, protein: 18, carbs: 35, fat: 25 },
    lunch: { calories: 380, protein: 35, carbs: 20, fat: 15 },
    dinner: { calories: 600, protein: 36, carbs: 125, fat: 8 },
    snack: { calories: 180, protein: 8, carbs: 15, fat: 12 }
  };

  const mealTypeNames = {
    all: '全天',
    breakfast: '早餐',
    lunch: '午餐', 
    dinner: '晚餐',
    snack: '加餐'
  };

  // 本周营养趋势数据
  const weeklyTrends = [
    { day: '周一', calories: 1820, protein: 95, score: 88 },
    { day: '周二', calories: 1950, protein: 102, score: 92 },
    { day: '周三', calories: 1680, protein: 88, score: 85 },
    { day: '周四', calories: 2100, protein: 115, score: 90 },
    { day: '周五', calories: 1890, protein: 98, score: 89 },
    { day: '周六', calories: 2200, protein: 120, score: 87 },
    { day: '今日', calories: 1636, protein: 97, score: 91 }
  ];

  const insightPeriods = {
    today: '今日分析', 
    week: '本周分析'
  };

  const todayMeals: MealRecord[] = [
    {
      id: '1',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '牛油果吐司配煎蛋',
      time: '8:30',
      mealType: 'breakfast',
      nutrition: { calories: 420, protein: 18, carbs: 35, fat: 25, sodium: 380, fiber: 8 },
      score: 92
    },
    {
      id: '2', 
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '鸡胸肉沙拉',
      time: '12:45',
      mealType: 'lunch',
      nutrition: { calories: 380, protein: 35, carbs: 20, fat: 15, sodium: 420, fiber: 6 },
      score: 88
    },
    {
      id: '3',
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '三文鱼藜麦饭',
      time: '19:20',
      mealType: 'dinner',
      nutrition: { calories: 656, protein: 36, carbs: 125, fat: 8, sodium: 340, fiber: 12 },
      score: 95
    },
    {
      id: '4',
      image: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '坚果酸奶杯',
      time: '15:30',
      mealType: 'snack',
      nutrition: { calories: 180, protein: 8, carbs: 15, fat: 12, sodium: 45, fiber: 3 },
      score: 85
    }
  ];

  const kolPosts: KOLPost[] = [
    {
      id: '1',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      name: '健身达人小李',
      title: '增肌期晚餐：高蛋白低脂完美搭配',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      time: '2小时前',
      likes: 234,
      nutrition: { calories: 580, protein: 42, carbs: 45, fat: 18, sodium: 320, fiber: 8 },
      price: 28,
      isFollowable: true
    },
    {
      id: '2',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      name: '营养师Emma',
      title: '减脂必备：低卡高纤维午餐',
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      time: '4小时前',
      likes: 189,
      nutrition: { calories: 420, protein: 28, carbs: 35, fat: 12, sodium: 280, fiber: 10 },
      price: 24,
      isFollowable: true
    }
  ];

  // 饮食计划分类数据
  const dietPlanCategories: DietPlanCategory[] = [
    {
      id: 'all',
      name: '全部计划',
      icon: '🏠',
      description: '查看所有饮食计划',
      color: 'bg-gray-100',
      targetGroup: 'all'
    },
    {
      id: 'weight_loss',
      name: '减脂塑形',
      icon: '🔥',
      description: '科学减脂，健康瘦身',
      color: 'bg-red-100',
      targetGroup: 'weight_loss'
    },
    {
      id: 'muscle_gain',
      name: '增肌强体',
      icon: '💪',
      description: '增肌塑形，强健体魄',
      color: 'bg-blue-100',
      targetGroup: 'muscle_gain'
    },
    {
      id: 'diabetes',
      name: '控糖饮食',
      icon: '🩺',
      description: '糖尿病友好，血糖管理',
      color: 'bg-green-100',
      targetGroup: 'diabetes'
    },
    {
      id: 'pregnancy',
      name: '孕期营养',
      icon: '🤱',
      description: '孕期专属，营养均衡',
      color: 'bg-pink-100',
      targetGroup: 'pregnancy'
    },
    {
      id: 'office_worker',
      name: '白领养生',
      icon: '💼',
      description: '忙碌生活，简单营养',
      color: 'bg-yellow-100',
      targetGroup: 'office_worker'
    }
  ];

  // 饮食计划数据
  // 营养师数据
  const nutritionists: Nutritionist[] = [
    {
      id: 'nutritionist-1',
      name: '李慧敏',
      avatar: 'https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=150',
      title: '注册营养师 · 临床营养专家',
      experience: 8,
      rating: 4.9,
      reviewCount: 342,
      specialties: ['糖尿病营养', '孕期营养', '减重管理', '慢病调理'],
      education: '北京协和医学院 临床营养学硕士',
      certifications: ['注册营养师（RD）', 'ADA认证糖尿病教育者', '国家二级营养师'],
      consultationPrice: 299,
      available: true,
      nextAvailableTime: '今天 14:30',
      bio: '拥有8年临床营养经验，擅长糖尿病、高血压等慢性疾病的营养干预，已帮助超过1000名患者改善健康状况。',
      languages: ['中文', '英文'],
      location: '北京'
    },
    {
      id: 'nutritionist-2',
      name: '张健康',
      avatar: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=150',
      title: '运动营养师 · 体重管理专家',
      experience: 6,
      rating: 4.8,
      reviewCount: 278,
      specialties: ['运动营养', '增肌减脂', '代谢调节', '营养评估'],
      education: '上海体育学院 运动营养学博士',
      certifications: ['国际运动营养师（ISSN）', '注册营养师（RD）', 'ACSM认证'],
      consultationPrice: 268,
      available: true,
      nextAvailableTime: '明天 09:00',
      bio: '专注运动营养领域6年，为多位职业运动员制定营养方案，在增肌减脂方面有丰富经验。',
      languages: ['中文'],
      location: '上海'
    },
    {
      id: 'nutritionist-3',
      name: '王美丽',
      avatar: 'https://images.pexels.com/photos/5207334/pexels-photo-5207334.jpeg?auto=compress&cs=tinysrgb&w=150',
      title: '母婴营养师 · 儿童营养专家',
      experience: 10,
      rating: 4.9,
      reviewCount: 456,
      specialties: ['孕期营养', '产后康复', '儿童营养', '母乳喂养'],
      education: '复旦大学 营养与食品卫生学博士',
      certifications: ['注册营养师（RD）', '国际泌乳顾问（IBCLC）', '儿童营养师'],
      consultationPrice: 329,
      available: false,
      nextAvailableTime: '后天 10:30',
      bio: '从事母婴营养工作10年，专业指导孕期营养、产后康复及0-6岁儿童营养，深受妈妈们信赖。',
      languages: ['中文', '英文'],
      location: '广州'
    }
  ];

  // 付费高级饮食计划数据
  const premiumMealPlans: PremiumMealPlan[] = [
    {
      id: 'premium-plan-1',
      title: '孕期营养全程指导计划',
      description: '为准妈妈量身定制的280天孕期营养方案，涵盖孕早期到产后的全程营养指导',
      targetGroup: 'pregnant',
      targetGroupLabel: '孕妇专享',
      duration: 280,
      price: 1299,
      originalPrice: 1899,
      discount: 32,
      image: 'https://images.pexels.com/photos/1556691/pexels-photo-1556691.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['专业营养师1对1指导', '每周营养报告分析', '孕期营养课程', '24小时在线答疑'],
      included: ['280天个性化食谱', '营养补充剂建议', '孕期体重管理', '胎儿发育营养支持', '产后康复指导'],
      nutritionist: nutritionists[2],
      sampleMeals: {
        breakfast: ['燕麦粥配核桃', '全麦吐司配牛油果', '豆浆配鸡蛋'],
        lunch: ['清蒸鲈鱼', '菠菜炒鸡蛋', '紫米饭'],
        dinner: ['冬瓜排骨汤', '清炒西兰花', '小米粥'],
        snacks: ['坚果酸奶', '新鲜水果', '全麦饼干']
      },
      benefits: ['预防妊娠糖尿病', '控制孕期体重', '促进胎儿健康发育', '减少孕期不适'],
      contraindications: ['妊娠高血压', '多胎妊娠需医生评估'],
      rating: 4.9,
      reviewCount: 156,
      isPopular: true,
      tags: ['专业指导', '全程跟踪', '个性定制']
    },
    {
      id: 'premium-plan-2',
      title: '糖尿病营养调理方案',
      description: '专为糖尿病患者设计的血糖控制营养计划，科学降糖，健康生活',
      targetGroup: 'diabetes',
      targetGroupLabel: '糖尿病患者',
      duration: 90,
      price: 899,
      originalPrice: 1299,
      discount: 31,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['血糖监测指导', '胰岛素调节建议', '运动营养搭配', '并发症预防'],
      included: ['90天控糖食谱', '血糖记录模板', '营养师月度复查', '紧急咨询通道'],
      nutritionist: nutritionists[0],
      sampleMeals: {
        breakfast: ['燕麦粥', '水煮蛋', '黄瓜丝'],
        lunch: ['糙米饭', '清蒸鸡胸肉', '凉拌苦瓜'],
        dinner: ['魔芋面条', '番茄炒蛋', '冬瓜汤'],
        snacks: ['无糖酸奶', '坚果少量', '黄瓜条']
      },
      benefits: ['稳定血糖水平', '改善胰岛素敏感性', '控制并发症风险', '提升生活质量'],
      contraindications: ['1型糖尿病需医生监督', '严重肾病患者'],
      rating: 4.8,
      reviewCount: 203,
      isPopular: true,
      tags: ['医学营养', '血糖控制', '专业监测']
    },
    {
      id: 'premium-plan-3',
      title: '术后康复营养计划',
      description: '手术后恢复期的专业营养支持，促进伤口愈合，加速康复进程',
      targetGroup: 'postSurgery',
      targetGroupLabel: '术后康复',
      duration: 60,
      price: 699,
      originalPrice: 999,
      discount: 30,
      image: 'https://images.pexels.com/photos/33865562/pexels-photo-33865562.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['分期营养指导', '伤口愈合促进', '免疫力提升', '康复进度评估'],
      included: ['术后分期食谱', '营养素补充建议', '康复营养课程', '专家定期随访'],
      nutritionist: nutritionists[0],
      sampleMeals: {
        breakfast: ['蛋白粉燕麦粥', '蒸蛋羹', '温牛奶'],
        lunch: ['鸡汤面条', '蒸蛋挞', '菠菜汤'],
        dinner: ['鱼肉粥', '蒸蛋', '冬瓜汤'],
        snacks: ['蛋白质奶昔', '维C水果', '酸奶']
      },
      benefits: ['加速伤口愈合', '提高免疫力', '预防感染', '缩短康复时间'],
      contraindications: ['严重消化道手术需医生评估'],
      rating: 4.7,
      reviewCount: 89,
      tags: ['术后专用', '科学康复', '专家跟踪']
    }
  ];

  const dietPlans: DietPlan[] = [
    {
      id: 'plan-1',
      title: '21天科学减脂计划',
      subtitle: '营养师定制·轻松瘦身',
      description: '专业营养师根据您的身体数据定制的21天减脂方案，科学搭配，营养均衡，让您在享受美食的同时轻松达到理想体重。',
      coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: 21,
      price: 199,
      originalPrice: 299,
      rating: 4.9,
      reviewCount: 1258,
      tags: ['热门', '专业营养师', '科学减脂'],
      targetGroups: ['weight_loss'],
      difficulty: 'easy',
      features: [
        '专业营养师1对1指导',
        '每日营养数据分析',
        '21天完整食谱',
        '运动搭配建议',
        '微信群答疑服务'
      ],
      nutritionFocus: ['低热量', '高蛋白', '均衡营养'],
      dailyCaloriesRange: [1200, 1500],
      mealCount: 4,
      includedServices: ['营养师咨询', '食谱定制', '进度跟踪'],
      trainerInfo: {
        name: '李营养师',
        avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100',
        title: '国家二级营养师',
        experience: '8年减脂指导经验'
      },
      sampleMeals: [
        {
          day: 1,
          mealType: 'breakfast',
          name: '燕麦酸奶杯',
          image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 320
        },
        {
          day: 1,
          mealType: 'lunch',
          name: '鸡胸肉蔬菜沙拉',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 450
        }
      ],
      createdAt: '2024-01-15',
      isPopular: true,
      isRecommended: true,
      purchaseCount: 1258
    },
    {
      id: 'plan-2',
      title: '增肌强体30天训练营',
      subtitle: '健身教练·专业指导',
      description: '专业健身教练设计的30天增肌计划，结合科学饮食和训练方案，帮助您快速增加肌肉量，打造理想身材。',
      coverImage: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: 30,
      price: 399,
      originalPrice: 599,
      rating: 4.8,
      reviewCount: 856,
      tags: ['专业教练', '增肌必选', '训练营'],
      targetGroups: ['muscle_gain'],
      difficulty: 'medium',
      features: [
        '专业健身教练指导',
        '个性化训练计划',
        '高蛋白饮食方案',
        '每周体成分分析',
        '24小时答疑服务'
      ],
      nutritionFocus: ['高蛋白', '复合碳水', '健康脂肪'],
      dailyCaloriesRange: [2200, 2800],
      mealCount: 5,
      includedServices: ['教练指导', '训练计划', '营养搭配'],
      trainerInfo: {
        name: '张教练',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        title: 'ACSM认证私人教练',
        experience: '10年健身指导经验'
      },
      sampleMeals: [
        {
          day: 1,
          mealType: 'breakfast',
          name: '蛋白粉燕麦片',
          image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 520
        }
      ],
      createdAt: '2024-01-10',
      isPopular: true,
      purchaseCount: 856
    },
    {
      id: 'plan-3',
      title: '糖尿病友好饮食方案',
      subtitle: '控糖专家·血糖管理',
      description: '专为糖尿病患者设计的28天控糖饮食方案，严格控制血糖指数，营养均衡，让您在享受美食的同时有效管理血糖。',
      coverImage: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: 28,
      price: 299,
      rating: 4.9,
      reviewCount: 642,
      tags: ['医学认证', '控糖专业', '血糖友好'],
      targetGroups: ['diabetes'],
      difficulty: 'easy',
      features: [
        '内分泌专家审核',
        '低GI食材搭配',
        '血糖监测建议',
        '28天完整方案',
        '专业医师答疑'
      ],
      nutritionFocus: ['低GI', '高纤维', '稳定血糖'],
      dailyCaloriesRange: [1500, 1800],
      mealCount: 4,
      includedServices: ['专家咨询', '血糖管理', '饮食指导'],
      trainerInfo: {
        name: '王医师',
        avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100',
        title: '内分泌科主任医师',
        experience: '15年糖尿病管理经验'
      },
      sampleMeals: [
        {
          day: 1,
          mealType: 'breakfast',
          name: '全麦面包配牛油果',
          image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 280
        }
      ],
      createdAt: '2024-01-08',
      isRecommended: true,
      purchaseCount: 642
    },
    {
      id: 'plan-4',
      title: '孕期营养全程指导',
      subtitle: '孕期专家·母婴健康',
      description: '专为孕期妈妈设计的营养方案，分期指导，确保母婴健康，科学补充孕期所需营养素。',
      coverImage: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: 90,
      price: 599,
      originalPrice: 899,
      rating: 4.9,
      reviewCount: 423,
      tags: ['孕期专属', '分期指导', '母婴健康'],
      targetGroups: ['pregnancy'],
      difficulty: 'easy',
      features: [
        '妇产科医生指导',
        '孕期分阶段方案',
        '叶酸DHA补充建议',
        '孕期禁忌食物提醒',
        '24小时专家答疑'
      ],
      nutritionFocus: ['叶酸', 'DHA', '铁质补充'],
      dailyCaloriesRange: [1800, 2200],
      mealCount: 5,
      includedServices: ['医生指导', '分期方案', '营养监控'],
      trainerInfo: {
        name: '刘医师',
        avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100',
        title: '妇产科主任医师',
        experience: '20年孕期营养指导经验'
      },
      sampleMeals: [
        {
          day: 1,
          mealType: 'breakfast',
          name: '核桃燕麦粥',
          image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 380
        }
      ],
      createdAt: '2024-01-05',
      isPopular: true,
      purchaseCount: 423
    },
    {
      id: 'plan-5',
      title: '白领快手营养餐',
      subtitle: '忙碌生活·简单营养',
      description: '专为忙碌白领设计的快手营养餐方案，15分钟搞定一餐，营养不打折扣。',
      coverImage: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: 14,
      price: 129,
      rating: 4.7,
      reviewCount: 789,
      tags: ['快手制作', '白领首选', '性价比高'],
      targetGroups: ['office_worker'],
      difficulty: 'easy',
      features: [
        '15分钟快手制作',
        '办公室可操作',
        '营养搭配科学',
        '食材易采购',
        '微信群交流'
      ],
      nutritionFocus: ['快速制作', '营养均衡', '方便实用'],
      dailyCaloriesRange: [1600, 2000],
      mealCount: 3,
      includedServices: ['食谱提供', '制作视频', '营养分析'],
      sampleMeals: [
        {
          day: 1,
          mealType: 'lunch',
          name: '微波炉蒸蛋羹',
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300',
          calories: 320
        }
      ],
      createdAt: '2024-01-12',
      purchaseCount: 789
    }
  ];

  // 用户购买的营养计划数据 - 一次只能有一个活跃计划
  const [userNutritionPlans, setUserNutritionPlans] = useState<UserNutritionPlan[]>([
    {
      id: 'user-plan-1',
      plan: dietPlans[0], // 21天科学减脂计划
      purchaseDate: '2024-12-01',
      startDate: '2024-12-05',
      endDate: '2024-12-25',
      currentDay: 8,
      totalDays: 21,
      status: 'active',
      progress: 38, // 8/21 * 100
      todayRecommendation: {
        breakfast: '燕麦酸奶杯 + 坚果',
        lunch: '鸡胸肉蔬菜沙拉',
        dinner: '清蒸鱼配蒸蛋',
        snack: '苹果 + 无糖酸奶'
      },
      adherenceRate: 85,
      remainingDays: 13
    },
    {
      id: 'user-plan-2',
      plan: dietPlans[1], // 30天增肌塑形计划
      purchaseDate: '2024-11-15',
      startDate: '2024-11-20',
      endDate: '2024-12-19',
      currentDay: 21,
      totalDays: 30,
      status: 'paused', // 设置为暂停状态，因为只能有一个活跃计划
      progress: 70, // 21/30 * 100
      todayRecommendation: {
        breakfast: '蛋白粉燕麦粥',
        lunch: '牛肉土豆',
        dinner: '三文鱼牛油果',
        snack: '香蕉坚果'
      },
      adherenceRate: 92,
      remainingDays: 9
    }
  ]);

  // 导入扩展菜谱数据和推荐算法
  const { extendedRecipes, defaultUserPreferences, defaultUserHistory } = (() => {
    try {
      // 静态导入扩展菜谱数据
      const extendedRecipes = [
    {
      id: 'recipe-1',
      name: '蒜蓉西兰花炒虾仁',
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '高蛋白低脂，富含膳食纤维',
      cookTime: 15,
      rating: 4.8,
      nutrition: { calories: 450, protein: 35, carbs: 20, fat: 12, sodium: 380, fiber: 8 },
      difficulty: 'easy',
      ingredients: [
        { name: '新鲜虾仁', amount: '200g', category: 'main' },
        { name: '西兰花', amount: '300g', category: 'main' },
        { name: '大蒜', amount: '4瓣', category: 'seasoning' },
        { name: '生抽', amount: '1勺', category: 'seasoning' },
        { name: '料酒', amount: '1勺', category: 'seasoning' },
        { name: '盐', amount: '适量', category: 'seasoning' },
        { name: '橄榄油', amount: '2勺', category: 'seasoning' },
        { name: '淀粉', amount: '1小勺', category: 'seasoning' }
      ],
      steps: [
            { stepNumber: 1, description: '虾仁洗净去虾线，用料酒和淀粉腌制10分钟', time: 10 },
            { stepNumber: 2, description: '西兰花洗净切成小朵，大蒜切片', time: 3 },
            { stepNumber: 3, description: '锅中烧水，加少许盐，西兰花焯水1分钟后捞出', time: 2 },
            { stepNumber: 4, description: '热锅下油，下蒜片爆香，再下虾仁炒至变色', time: 3 },
            { stepNumber: 5, description: '加入西兰花翻炒，调味即可出锅', time: 2 }
          ],
          tips: ['虾仁要提前腌制，口感更嫩滑', '西兰花焯水时间不宜过长，保持脆嫩', '可加少许蚝油提鲜'],
      kitPrice: 28,
      readyMealPrice: 36,
      category: ['晚餐', '减脂'],
          tags: ['高蛋白', '低脂', '快手菜'],
          cuisineType: '中式',
          popularity: 0.9,
          seasonality: ['spring', 'summer', 'autumn', 'winter'],
          mealTime: ['lunch', 'dinner']
    },
    {
      id: 'recipe-2',
      name: '鸡胸肉时蔬沙拉',
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '减脂必备，营养均衡',
      cookTime: 10,
      rating: 4.6,
      nutrition: { calories: 320, protein: 28, carbs: 15, fat: 8, sodium: 280, fiber: 6 },
      difficulty: 'easy',
      ingredients: [
        { name: '鸡胸肉', amount: '150g', category: 'main' },
        { name: '生菜', amount: '100g', category: 'main' },
        { name: '小番茄', amount: '100g', category: 'main' },
        { name: '黄瓜', amount: '100g', category: 'main' },
        { name: '紫甘蓝', amount: '50g', category: 'main' },
        { name: '橄榄油', amount: '1勺', category: 'seasoning' },
        { name: '柠檬汁', amount: '1勺', category: 'seasoning' },
        { name: '黑胡椒', amount: '适量', category: 'seasoning' },
        { name: '盐', amount: '适量', category: 'seasoning' }
      ],
      steps: [
            { stepNumber: 1, description: '鸡胸肉用盐和黑胡椒腌制，煎至两面金黄，切片', time: 8 },
            { stepNumber: 2, description: '各种蔬菜洗净切好，摆盘', time: 5 },
            { stepNumber: 3, description: '调制沙拉汁：橄榄油、柠檬汁、盐、胡椒混合', time: 2 },
            { stepNumber: 4, description: '将鸡胸肉片放在蔬菜上，淋上沙拉汁即可', time: 1 }
          ],
          tips: ['鸡胸肉不要煎过头，保持嫩滑', '蔬菜尽量选择不同颜色，营养更丰富', '沙拉汁可以根据个人喜好调整'],
          kitPrice: 24,
          readyMealPrice: 32,
          category: ['午餐', '减脂'],
          tags: ['低卡', '高蛋白', '轻食'],
          cuisineType: '西式',
          popularity: 0.85,
          seasonality: ['spring', 'summer', 'autumn'],
          mealTime: ['lunch', 'dinner']
        },
        {
          id: 'recipe-3',
          name: '香煎三文鱼配牛油果',
          image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Omega-3丰富，增肌减脂两相宜',
          cookTime: 12,
          rating: 4.9,
          nutrition: { calories: 520, protein: 32, carbs: 8, fat: 28, sodium: 220, fiber: 7 },
          difficulty: 'medium',
          ingredients: [
            { name: '三文鱼', amount: '180g', category: 'main' },
            { name: '牛油果', amount: '1个', category: 'main' },
            { name: '柠檬', amount: '半个', category: 'seasoning' },
            { name: '橄榄油', amount: '1勺', category: 'seasoning' },
            { name: '海盐', amount: '适量', category: 'seasoning' },
            { name: '黑胡椒', amount: '适量', category: 'seasoning' },
            { name: '迷迭香', amount: '2枝', category: 'seasoning' }
          ],
          steps: [
            { stepNumber: 1, description: '三文鱼用盐和胡椒腌制15分钟', time: 15 },
            { stepNumber: 2, description: '牛油果切片，淋上柠檬汁防氧化', time: 3 },
            { stepNumber: 3, description: '平底锅刷油，煎三文鱼3-4分钟至表面金黄', time: 4 },
            { stepNumber: 4, description: '翻面再煎2分钟，加入迷迭香提香', time: 2 },
            { stepNumber: 5, description: '摆盘配牛油果，挤柠檬汁即可', time: 2 }
          ],
          tips: ['三文鱼不要煎过头，保持内部粉嫩', '牛油果要选择适度成熟的', '可配简单沙拉增加饱腹感'],
          kitPrice: 42,
          readyMealPrice: 55,
          category: ['晚餐', '增肌'],
          tags: ['高蛋白', '健康脂肪', '轻奢'],
          cuisineType: '西式',
          isNew: true,
          popularity: 0.92,
          seasonality: ['spring', 'summer', 'autumn', 'winter'],
          mealTime: ['lunch', 'dinner']
        },
        {
          id: 'recipe-4',
          name: '日式照烧鸡腿',
          image: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: '甜咸平衡，下饭神器',
          cookTime: 25,
          rating: 4.8,
          nutrition: { calories: 580, protein: 38, carbs: 25, fat: 22, sodium: 680, fiber: 2 },
          difficulty: 'medium',
          ingredients: [
            { name: '鸡腿', amount: '2个', category: 'main' },
            { name: '生抽', amount: '3勺', category: 'seasoning' },
            { name: '老抽', amount: '1勺', category: 'seasoning' },
            { name: '味淋', amount: '2勺', category: 'seasoning' },
            { name: '清酒', amount: '1勺', category: 'seasoning' },
            { name: '蜂蜜', amount: '1勺', category: 'seasoning' },
            { name: '姜片', amount: '3片', category: 'seasoning' },
            { name: '白芝麻', amount: '适量', category: 'garnish' }
          ],
          steps: [
            { stepNumber: 1, description: '鸡腿洗净，用刀在皮上划几刀', time: 3 },
            { stepNumber: 2, description: '调制照烧汁：生抽、老抽、味淋、清酒、蜂蜜混合', time: 2 },
            { stepNumber: 3, description: '平底锅刷油，鸡腿皮朝下煎5分钟至金黄', time: 5 },
            { stepNumber: 4, description: '翻面再煎3分钟，倒入照烧汁', time: 3 },
            { stepNumber: 5, description: '小火煮10分钟，收汁至浓稠', time: 10 },
            { stepNumber: 6, description: '撒白芝麻，切块装盘', time: 2 }
          ],
          tips: ['鸡皮一定要煎得焦黄，才香', '收汁时要不断翻动，避免糊底', '可配白米饭或蔬菜沙拉'],
          kitPrice: 18,
          readyMealPrice: 28,
          category: ['午餐', '晚餐'],
          tags: ['下饭', '香甜', '经典'],
          cuisineType: '日式',
          popularity: 0.91,
          seasonality: ['autumn', 'winter'],
          mealTime: ['lunch', 'dinner']
        },
        {
          id: 'recipe-5',
          name: '藜麦牛油果碗',
          image: 'https://images.pexels.com/photos/1640776/pexels-photo-1640776.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: '超级食物组合，营养密度超高',
          cookTime: 20,
          rating: 4.5,
          nutrition: { calories: 420, protein: 18, carbs: 35, fat: 16, sodium: 180, fiber: 12 },
          difficulty: 'easy',
          ingredients: [
            { name: '藜麦', amount: '100g', category: 'main' },
            { name: '牛油果', amount: '1个', category: 'main' },
            { name: '樱桃番茄', amount: '150g', category: 'main' },
            { name: '胡萝卜丝', amount: '50g', category: 'main' },
            { name: '紫甘蓝丝', amount: '50g', category: 'main' },
            { name: '芝麻菜', amount: '30g', category: 'main' },
            { name: '南瓜籽', amount: '20g', category: 'garnish' },
            { name: '柠檬汁', amount: '2勺', category: 'seasoning' },
            { name: '橄榄油', amount: '1勺', category: 'seasoning' },
            { name: '海盐', amount: '适量', category: 'seasoning' }
          ],
          steps: [
            { stepNumber: 1, description: '藜麦洗净，加水煮15分钟至软烂', time: 15 },
            { stepNumber: 2, description: '各种蔬菜洗净切好备用', time: 5 },
            { stepNumber: 3, description: '牛油果切块，淋柠檬汁', time: 2 },
            { stepNumber: 4, description: '所有食材摆入碗中，淋橄榄油和柠檬汁', time: 3 },
            { stepNumber: 5, description: '撒南瓜籽和海盐，轻拌即可', time: 1 }
          ],
          tips: ['藜麦要充分洗净去苦味', '可加煮蛋增加蛋白质', '调料可根据喜好调整'],
          kitPrice: 32,
          readyMealPrice: 38,
          category: ['午餐', '轻食'],
          tags: ['超级食物', '素食', '高纤维'],
          cuisineType: '西式',
          isNew: true,
          popularity: 0.78,
          seasonality: ['spring', 'summer'],
          mealTime: ['breakfast', 'lunch']
        }
      ];

      const defaultUserPreferences = {
        cuisineTypes: ['中式', '西式'],
        difficulty: ['easy', 'medium'] as ('easy' | 'medium' | 'hard')[],
        cookTime: 30,
        dietaryRestrictions: [] as string[],
        favoriteIngredients: ['鸡胸肉', '虾仁', '鸡蛋', '西兰花'],
        dislikedIngredients: ['香菜', '芹菜'],
        favoriteCategories: ['减脂', '快手菜'],
        nutritionFocus: ['high_protein', 'low_fat'] as ('high_protein' | 'low_fat' | 'low_carb' | 'high_fiber')[]
      };

      const defaultUserHistory = {
        recentRecipes: ['recipe-1', 'recipe-2'],
        ratedRecipes: { 'recipe-1': 5, 'recipe-2': 4 } as { [recipeId: string]: number },
        frequentCategories: { '减脂': 5, '快手菜': 3, '高蛋白': 4 } as { [category: string]: number },
        nutritionGoals: {
          dailyCalories: 1800,
          proteinTarget: 120,
          carbsTarget: 180,
          fatTarget: 60
        },
        healthProfile: {
          healthGoal: 'weight_loss' as 'weight_loss' | 'muscle_gain' | 'maintain_health' | 'special_nutrition',
          activityLevel: 'moderate' as 'light' | 'moderate' | 'heavy'
        }
      };

      return { extendedRecipes, defaultUserPreferences, defaultUserHistory };
    } catch (error) {
      console.error('Failed to load recipe data:', error);
      return { 
        extendedRecipes: [] as Recipe[],
        defaultUserPreferences: {
          cuisineTypes: [],
          difficulty: [] as ('easy' | 'medium' | 'hard')[],
          cookTime: 30,
          dietaryRestrictions: [],
          favoriteIngredients: [],
          dislikedIngredients: [],
          favoriteCategories: [],
          nutritionFocus: [] as ('high_protein' | 'low_fat' | 'low_carb' | 'high_fiber')[]
        },
        defaultUserHistory: {
          recentRecipes: [],
          ratedRecipes: {} as { [recipeId: string]: number },
          frequentCategories: {} as { [category: string]: number },
          nutritionGoals: {
            dailyCalories: 1800,
            proteinTarget: 120,
            carbsTarget: 180,
            fatTarget: 60
          },
          healthProfile: {
            healthGoal: 'maintain_health' as 'weight_loss' | 'muscle_gain' | 'maintain_health' | 'special_nutrition',
            activityLevel: 'moderate' as 'light' | 'moderate' | 'heavy'
          }
        }
      };
    }
  })();

  // 菜谱数据
  const recipes: Recipe[] = extendedRecipes;

  // 常见食物数据
  const commonFoods: CommonFood[] = [
    // 蛋白质类
    { id: '1', name: '鸡蛋', icon: '🥚', nutrition: { calories: 155, protein: 13, carbs: 1, fat: 11, sodium: 124, fiber: 0 }, category: 'protein' },
    { id: '2', name: '鸡胸肉', icon: '🍗', nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 74, fiber: 0 }, category: 'protein' },
    { id: '3', name: '三文鱼', icon: '🐟', nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, sodium: 93, fiber: 0 }, category: 'protein' },
    { id: '4', name: '豆腐', icon: '🥛', nutrition: { calories: 70, protein: 8, carbs: 2, fat: 4, sodium: 7, fiber: 1 }, category: 'protein' },
    
    // 碳水化合物类
    { id: '5', name: '燕麦', icon: '🌾', nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7, sodium: 2, fiber: 11 }, category: 'carbs' },
    { id: '6', name: '糙米饭', icon: '🍚', nutrition: { calories: 112, protein: 2.3, carbs: 22, fat: 0.9, sodium: 7, fiber: 1.8 }, category: 'carbs' },
    { id: '7', name: '红薯', icon: '🍠', nutrition: { calories: 103, protein: 2.3, carbs: 24, fat: 0.1, sodium: 6, fiber: 3.9 }, category: 'carbs' },
    { id: '8', name: '全麦面包', icon: '🍞', nutrition: { calories: 247, protein: 13, carbs: 41, fat: 4.2, sodium: 400, fiber: 6 }, category: 'carbs' },
    
    // 蔬菜类
    { id: '9', name: '西兰花', icon: '🥦', nutrition: { calories: 25, protein: 3, carbs: 5, fat: 0.4, sodium: 41, fiber: 3 }, category: 'vegetables' },
    { id: '10', name: '菠菜', icon: '🥬', nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sodium: 79, fiber: 2.2 }, category: 'vegetables' },
    { id: '11', name: '胡萝卜', icon: '🥕', nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, sodium: 69, fiber: 2.8 }, category: 'vegetables' },
    { id: '12', name: '西红柿', icon: '🍅', nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, sodium: 5, fiber: 1.2 }, category: 'vegetables' },
    
    // 水果类
    { id: '13', name: '苹果', icon: '🍎', nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sodium: 1, fiber: 2.4 }, category: 'fruits' },
    { id: '14', name: '香蕉', icon: '🍌', nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, sodium: 1, fiber: 2.6 }, category: 'fruits' },
    { id: '15', name: '蓝莓', icon: '🫐', nutrition: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, sodium: 1, fiber: 2.4 }, category: 'fruits' },
    { id: '16', name: '橙子', icon: '🍊', nutrition: { calories: 43, protein: 1.2, carbs: 8.3, fat: 0.2, sodium: 40, fiber: 2.2 }, category: 'fruits' },
    
    // 坚果类
    { id: '17', name: '杏仁', icon: '🌰', nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, sodium: 1, fiber: 12 }, category: 'nuts' },
    { id: '18', name: '核桃', icon: '🥜', nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, sodium: 2, fiber: 7 }, category: 'nuts' },
    
    // 乳制品类
    { id: '19', name: '牛奶', icon: '🥛', nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, sodium: 44, fiber: 0 }, category: 'dairy' },
    { id: '20', name: '希腊酸奶', icon: '🥛', nutrition: { calories: 100, protein: 10, carbs: 6, fat: 4, sodium: 36, fiber: 0 }, category: 'dairy' }
  ];

  const renderProgressBar = (current: number, target: number, color: string) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color} transition-all duration-300`}
        style={{ width: `${Math.min((current / target) * 100, 100)}%` }}
      ></div>
    </div>
  );

  const renderNutritionCard = (label: string, current: number, target: number, unit: string, color: string) => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-xs text-gray-500">{current}/{target}{unit}</span>
      </div>
      {renderProgressBar(current, target, color)}
      <div className="mt-1 text-xs text-gray-500">
        {target - current > 0 ? `还需${target - current}${unit}` : '已达标'}
      </div>
    </div>
  );


  // 健康档案设置组件
  const HealthProfileSetup = () => {
    const [formData, setFormData] = useState<Partial<HealthProfile>>({
      name: '',
      age: 25,
      gender: 'male',
      height: 170,
      weight: 65,
      activityLevel: 'moderate',
      healthGoal: 'maintain_health',
      specialNutritionFocus: undefined
    });

    const handleSave = () => {
      if (!formData.name || !formData.age || !formData.height || !formData.weight) {
        alert('请填写完整的基本信息');
        return;
      }

      const profile: HealthProfile = {
        id: Date.now().toString(),
        name: formData.name!,
        age: formData.age!,
        gender: formData.gender!,
        height: formData.height!,
        weight: formData.weight!,
        activityLevel: formData.activityLevel!,
        healthGoal: formData.healthGoal!,
        specialNutritionFocus: formData.specialNutritionFocus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setHealthProfile(profile);
      localStorage.setItem('healthProfile', JSON.stringify(profile));
      setShowProfileSetup(false);
      alert('健康档案保存成功！已为您计算个性化营养目标。');
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* 头部 */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800">创建健康档案</h2>
              <button 
                onClick={() => setShowProfileSetup(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500">填写基本信息，获得个性化营养建议</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">基本信息</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入您的姓名"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="16"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="120"
                      max="220"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="30"
                      max="200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 运动习惯 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">运动习惯</h3>
              <div className="space-y-3">
                {[
                  { value: 'light', label: '轻度运动', desc: '每周1-3次轻松运动' },
                  { value: 'moderate', label: '中度运动', desc: '每周3-5次适中强度运动' },
                  { value: 'heavy', label: '重度运动', desc: '每周6-7次高强度运动' }
                ].map((activity) => (
                  <button
                    key={activity.value}
                    onClick={() => setFormData({...formData, activityLevel: activity.value as 'light' | 'moderate' | 'heavy'})}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.activityLevel === activity.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{activity.label}</div>
                    <div className="text-sm text-gray-600">{activity.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 健康目标 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">健康目标</h3>
              <div className="space-y-3">
                {[
                  { value: 'weight_loss', label: '减脂', desc: '减少体脂，塑造身形', icon: '🔥' },
                  { value: 'muscle_gain', label: '增肌', desc: '增加肌肉量，强健体魄', icon: '💪' },
                  { value: 'maintain_health', label: '维持健康', desc: '保持现状，均衡营养', icon: '⚖️' },
                  { value: 'special_nutrition', label: '特定营养关注', desc: '针对特殊营养需求', icon: '🎯' }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({...formData, healthGoal: goal.value as 'weight_loss' | 'muscle_gain' | 'maintain_health' | 'special_nutrition'})}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.healthGoal === goal.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{goal.icon}</span>
                      <div>
                        <div className="font-medium">{goal.label}</div>
                        <div className="text-sm text-gray-600">{goal.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 特殊营养关注 */}
            {formData.healthGoal === 'special_nutrition' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">特殊营养关注</h3>
                <div className="space-y-3">
                  {[
                    { value: 'low_sodium', label: '低钠饮食', desc: '控制钠摄入量' },
                    { value: 'high_protein', label: '高蛋白饮食', desc: '增加蛋白质摄入' },
                    { value: 'low_carb', label: '低碳水饮食', desc: '减少碳水化合物' },
                    { value: 'high_fiber', label: '高纤维饮食', desc: '增加膳食纤维' }
                  ].map((focus) => (
                    <button
                      key={focus.value}
                      onClick={() => setFormData({...formData, specialNutritionFocus: focus.value as 'low_sodium' | 'high_protein' | 'low_carb' | 'high_fiber'})}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        formData.specialNutritionFocus === focus.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{focus.label}</div>
                      <div className="text-xs text-gray-600">{focus.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              保存健康档案
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 健康档案查看组件
  const HealthProfileView = () => {
    if (!healthProfile) return null;

    const targets = calculateNutritionTargets(healthProfile);
    const bmr = calculateBMR(healthProfile);
    const tdee = calculateTDEE(healthProfile);

    const goalLabels: Record<string, string> = {
      'weight_loss': '减脂',
      'muscle_gain': '增肌',
      'maintain_health': '维持健康',
      'special_nutrition': '特定营养关注'
    };

    const activityLabels: Record<string, string> = {
      'light': '轻度运动',
      'moderate': '中度运动',
      'heavy': '重度运动'
    };

    const specialNutritionLabels: Record<string, string> = {
      'low_sodium': '低钠饮食',
      'high_protein': '高蛋白饮食',
      'low_carb': '低碳水饮食',
      'high_fiber': '高纤维饮食'
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">我的健康档案</h2>
            <button 
              onClick={() => setShowHealthProfile(false)}
              className="text-gray-500 p-2"
            >
              ✕
            </button>
          </div>

          {/* 基本信息卡片 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {healthProfile.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-lg">{healthProfile.name}</h3>
                <p className="text-sm text-gray-600">
                  {healthProfile.age}岁 • {healthProfile.gender === 'male' ? '男' : '女'} • BMI: {(healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-800">{healthProfile.height} cm</div>
                <div className="text-gray-600">身高</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-800">{healthProfile.weight} kg</div>
                <div className="text-gray-600">体重</div>
              </div>
            </div>
          </div>

          {/* 健康目标 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">健康目标</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">{goalLabels[healthProfile.healthGoal]}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                运动习惯: {activityLabels[healthProfile.activityLevel]}
              </div>
              {healthProfile.specialNutritionFocus && (
                <div className="text-sm text-gray-600">
                  特殊关注: {specialNutritionLabels[healthProfile.specialNutritionFocus]}
                </div>
              )}
            </div>
          </div>

          {/* 代谢信息 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">代谢信息</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{Math.round(bmr)}</div>
                <div className="text-xs text-gray-600">基础代谢率 (千卡/天)</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{Math.round(tdee)}</div>
                <div className="text-xs text-gray-600">总消耗 (千卡/天)</div>
              </div>
            </div>
          </div>

          {/* 营养目标 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">每日营养目标</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{targets.calories}</div>
                <div className="text-xs text-gray-600">千卡</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">{targets.protein}g</div>
                <div className="text-xs text-gray-600">蛋白质</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">{targets.carbs}g</div>
                <div className="text-xs text-gray-600">碳水化合物</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{targets.fat}g</div>
                <div className="text-xs text-gray-600">脂肪</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-indigo-600">{targets.sodium}mg</div>
                <div className="text-xs text-gray-600">钠</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-teal-600">{targets.fiber}g</div>
                <div className="text-xs text-gray-600">膳食纤维</div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                setShowHealthProfile(false);
                setShowProfileSetup(true);
              }}
              className="py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700"
            >
              编辑档案
            </button>
            <button 
              onClick={() => setShowHealthProfile(false)}
              className="py-3 px-4 bg-green-500 text-white rounded-lg font-semibold"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CameraView = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900 z-50 overflow-hidden">
      {/* 动态背景粒子 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${6 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative h-full">
        {/* 顶部导航栏 - 超美化版 */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex justify-between items-center p-6 pt-12">
            <button 
              onClick={() => setShowCamera(false)}
              className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl transform hover:scale-110 active:scale-95"
            >
              ✕
            </button>
            <div className="text-white text-center flex-1 mx-4">
              <div className="text-xl font-bold drop-shadow-lg mb-1 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">🤖 AI营养识别</div>
              <div className="text-sm opacity-90 font-medium">深度学习 · 精准识别 · 智能分析</div>
            </div>
            <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
              <Brain size={20} className="text-green-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            </div>
          </div>
        </div>
        
        {/* 主拍照区域 - 超美化版 */}
        <div className="h-full flex items-center justify-center relative overflow-hidden">
          {/* 动态背景光效 */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            {/* 额外的光晕效果 */}
            <div className="absolute top-20 right-20 w-20 h-20 bg-green-400/30 rounded-full blur-2xl animate-pulse delay-200"></div>
            <div className="absolute bottom-20 left-20 w-16 h-16 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-700"></div>
          </div>
          
          {/* 拍照框架 - 未来科技感设计 */}
          <div className="relative z-10">
            <div className="w-80 h-80 relative">
              {/* 主框架 */}
              <div className="w-full h-full border-2 border-dashed border-emerald-400/90 rounded-3xl relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 shadow-2xl">
                {/* 科技感角落装饰 */}
                <div className="absolute top-3 left-3 w-8 h-8 border-l-3 border-t-3 border-emerald-400 rounded-tl-xl shadow-lg"></div>
                <div className="absolute top-3 right-3 w-8 h-8 border-r-3 border-t-3 border-emerald-400 rounded-tr-xl shadow-lg"></div>
                <div className="absolute bottom-3 left-3 w-8 h-8 border-l-3 border-b-3 border-emerald-400 rounded-bl-xl shadow-lg"></div>
                <div className="absolute bottom-3 right-3 w-8 h-8 border-r-3 border-b-3 border-emerald-400 rounded-br-xl shadow-lg"></div>
                
                {/* 内部十字线 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/60 transform -translate-y-1/2"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-400/60 transform -translate-x-1/2"></div>
                </div>
                
                {/* 中心内容 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-blue-500 rounded-full shadow-2xl animate-pulse"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-emerald-300 to-blue-400 rounded-full flex items-center justify-center">
                        <Eye size={32} className="text-white animate-bounce" />
                      </div>
                      {/* 环绕光点 */}
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-32px)`,
                            animation: `spin 4s linear infinite`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xl font-bold mb-2 drop-shadow-lg bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">将美食放在框内</div>
                    <div className="text-sm opacity-90 font-medium mb-4">AI智能识别 · 营养精准分析</div>
                    
                    {/* 美化提示标签 */}
                    <div className="flex justify-center space-x-2 mt-6">
                      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-400/40 shadow-lg">
                        <span className="text-xs text-emerald-300 font-semibold flex items-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></div>
                          光线充足
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/40 shadow-lg">
                        <span className="text-xs text-blue-300 font-semibold flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1.5 animate-pulse delay-300"></div>
                          角度清晰
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 动态扫描线 */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-500"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-pulse delay-250"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse delay-750"></div>
                </div>
              </div>
              
              {/* 多层外围装饰环 */}
              <div className="absolute -inset-4 border border-emerald-400/40 rounded-3xl animate-pulse shadow-lg"></div>
              <div className="absolute -inset-8 border border-blue-400/30 rounded-3xl animate-pulse delay-1000 shadow-lg"></div>
              <div className="absolute -inset-12 border border-purple-400/20 rounded-3xl animate-pulse delay-2000 shadow-xl"></div>
            </div>
          </div>
        </div>
        
        {/* 底部拍照按钮区域 - 超美化版 */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex justify-center items-center px-8 pt-8 pb-6">
            {/* 拍照按钮 */}
            <div className="relative">
              <button 
                onClick={() => {
                  // 模拟拍照并保存图片
                  setCapturedPhoto('mock-photo-data');
                  // 根据当前时间自动设置餐次
                  setSelectedMealType(detectMealType());
                  // 关闭拍照界面，开始AI分析流程
                  setShowCamera(false);
                  setShowAIAnalysis(true);
                  // 启动AI分析流程
                  startAIAnalysis();
                }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-green-500 to-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 relative z-10 transform hover:rotate-12 active:rotate-0"
              >
                <Camera size={36} className="drop-shadow-lg" />
              </button>
              
              {/* 多层外围动画环 */}
              <div className="absolute inset-0 w-24 h-24 border-2 border-emerald-400/60 rounded-full animate-ping"></div>
              <div className="absolute -inset-2 w-28 h-28 border border-green-400/40 rounded-full animate-pulse"></div>
              <div className="absolute -inset-4 w-32 h-32 border border-blue-400/30 rounded-full animate-pulse delay-500"></div>
              
              {/* 环绕光点 */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-emerald-400 rounded-full opacity-80"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
                    animation: `spin 6s linear infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
              
            </div>
          </div>
          
          {/* 功能提示栏 - 美化版 */}
          <div className="flex justify-center space-x-3 pt-8 pb-6">
            <div className="flex items-center space-x-2 text-white/90 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-semibold">AI实时识别</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse delay-300 shadow-lg"></div>
              <span className="text-sm font-semibold">营养分析</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse delay-600 shadow-lg"></div>
              <span className="text-sm font-semibold">智能推荐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // AI分析流程组件 - 超美化版
  const AIAnalysisModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white opacity-10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
          {/* 漂浮的AI图标 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`icon-${i}`}
              className="absolute opacity-5 text-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {i % 4 === 0 ? <Brain size={24} /> : 
               i % 4 === 1 ? <Eye size={20} /> :
               i % 4 === 2 ? <Cpu size={18} /> : <Wand2 size={22} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-4 backdrop-blur-md border border-white/20">
          {/* 头部 - 超美化版 */}
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-white p-8 text-center relative overflow-hidden">
            {/* 动态背景波纹 */}
            <div className="absolute inset-0">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-ping"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/15 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-transparent to-white/5 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
              {/* 流动的光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            </div>
            
            <div className="relative z-10">
              {/* AI图标 - 增强动画 */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 shadow-lg animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center">
                  <div className="animate-spin" style={{ animationDuration: '3s' }}>
                    <Brain size={32} className="text-white drop-shadow-lg" />
                  </div>
                </div>
                {/* 环绕粒子 */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-24px)`,
                      animation: `spin 4s linear infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
              
              <h2 className="text-2xl font-bold mb-2 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">🤖 AI智能识别</h2>
              <p className="text-sm opacity-90 font-medium">深度学习算法正在分析您的美食...</p>
              
              {/* 动态进度条 */}
              <div className="mt-6 w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/30">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${Math.min(((currentAnalysisStep + 1) / aiAnalysisSteps.length) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  {/* 流光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-8 animate-pulse" style={{ animation: 'shimmer 2s infinite' }}></div>
                </div>
              </div>
              <div className="text-xs opacity-80 mt-3 flex items-center justify-center space-x-2">
                <Sparkles size={12} className="animate-pulse" />
                <span>
                  {currentAnalysisStep >= 0 && currentAnalysisStep < aiAnalysisSteps.length 
                    ? `正在执行步骤 ${currentAnalysisStep + 1} / ${aiAnalysisSteps.length}` 
                    : '分析完成 ✨'}
                </span>
                <Sparkles size={12} className="animate-pulse" />
              </div>
            </div>
          </div>

          {/* 分析步骤 - 超美化版，移除滚动控制 */}
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-purple-50/30 scrollbar-hide">
            {aiAnalysisSteps.map((step, index) => (
              <div 
                key={index} 
                className={`relative flex items-start space-x-4 p-4 rounded-2xl transition-all duration-700 transform ${
                  step.status === 'completed' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-lg scale-100 translate-y-0' :
                  step.status === 'processing' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-xl scale-105 -translate-y-1' :
                  'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 scale-95 opacity-70'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* 背景光效 */}
                {step.status === 'processing' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-2xl animate-pulse"></div>
                )}
                
                {/* 状态图标 - 超增强版 */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transform transition-all duration-500 ${
                  step.status === 'completed' ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white shadow-emerald-200' :
                  step.status === 'processing' ? 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white shadow-blue-200 animate-pulse' :
                  'bg-gradient-to-br from-gray-300 to-slate-400 text-gray-500 shadow-gray-200'
                }`}>
                  {step.status === 'completed' ? (
                    <>
                      <Check size={20} className="animate-bounce" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-ping opacity-20"></div>
                    </>
                  ) : step.status === 'processing' ? (
                    <>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-30"></div>
                      {/* 添加旋转环效果 */}
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/50 animate-spin"></div>
                    </>
                  ) : (
                    <div className="w-4 h-4 bg-gray-500 rounded-full opacity-50" />
                  )}
                </div>

                {/* 内容 - 超增强版 */}
                <div className="flex-1 relative">
                  <div className={`font-bold text-lg mb-1 transition-all duration-500 ${
                    step.status === 'completed' ? 'text-emerald-700' :
                    step.status === 'processing' ? 'text-blue-700' :
                    'text-gray-400'
                  }`}>
                    {step.content.split('\n')[0]}
                  </div>
                  
                  {step.status === 'completed' && step.content.includes('\n') && (
                    <div className="mt-3 p-4 text-sm text-gray-700 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm transform transition-all duration-500 animate-in slide-in-from-top-2">
                      <div className="whitespace-pre-line leading-relaxed">
                        {step.content.split('\n').slice(1).join('\n')}
                      </div>
                    </div>
                  )}
                  
                  {step.timestamp && (
                    <div className="text-xs text-gray-500 mt-3 flex items-center opacity-70">
                      <Clock size={12} className="mr-1" />
                      <span className="font-medium">{step.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 自动关闭倒计时提示 - 美化版 */}
          {autoCloseCountdown !== null && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 text-center">
              <div className="flex items-center justify-center space-x-3 text-blue-700 mb-4">
                <div className="relative">
                  <Clock size={20} className="animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                </div>
                <span className="text-sm font-medium">
                  分析完成！将在 <span className="font-bold text-blue-800 text-lg">{autoCloseCountdown}</span> 秒后自动跳转
                </span>
              </div>
              <button
                onClick={() => {
                  setAutoCloseCountdown(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                取消自动跳转
              </button>
            </div>
          )}

          {/* 分析完成后的操作按钮 - 超美化版 */}
          {currentAnalysisStep >= 6 && analysisResults && (
            <div className="p-6 border-t border-purple-100 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full animate-pulse delay-1000"></div>
              </div>
              
              {/* 营养评分展示 - 增强版 */}
              <div className="relative text-center mb-6 p-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-500 hover:scale-105">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-full mb-4 shadow-xl">
                  <Star size={28} className="text-white animate-pulse" />
                  {/* 环绕光环 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-ping opacity-20"></div>
                  <div className="absolute -inset-2 rounded-full border-2 border-emerald-300 opacity-50 animate-spin" style={{ animationDuration: '3s' }}></div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {analysisResults.nutritionScore}分
                </div>
                <div className="text-sm text-gray-600 font-semibold mb-3">🌟 营养健康评分 🌟</div>
                
                {/* 动态进度条 */}
                <div className="relative w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 transition-all duration-2000 ease-out relative overflow-hidden shadow-lg"
                    style={{ width: `${analysisResults.nutritionScore}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-6" style={{ animation: 'shimmer 2s infinite' }}></div>
                  </div>
                </div>
                
                {/* 评分文字 */}
                <div className="mt-3 text-xs font-medium text-gray-500">
                  {analysisResults.nutritionScore >= 90 ? '🏆 优秀' :
                   analysisResults.nutritionScore >= 80 ? '🥇 良好' :
                   analysisResults.nutritionScore >= 70 ? '🥈 合格' : '🥉 需改善'}
                </div>
              </div>
              
              {/* 操作按钮 - 超美化版 */}
              <div className="relative flex space-x-4">
                <button
                  onClick={() => {
                    setShowAIAnalysis(false);
                    setShowMealSelection(true);
                  }}
                  className="flex-1 relative py-4 px-4 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 text-gray-700 rounded-2xl font-bold hover:from-slate-200 hover:via-gray-200 hover:to-slate-300 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 border border-gray-200 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <Utensils size={18} className="text-gray-600" />
                    <span>修改餐次</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowAIAnalysis(false);
                    setShowNutritionReport(true);
                  }}
                  className="flex-1 relative py-4 px-4 bg-gradient-to-br from-emerald-500 via-green-600 to-blue-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:via-green-700 hover:to-blue-700 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 animate-pulse opacity-50"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <BarChart3 size={18} className="text-white" />
                    <span>查看详细报告</span>
                    <Sparkles size={14} className="text-white animate-pulse" />
                  </div>
                </button>
              </div>
              
              {/* 额外的提示信息 */}
              <div className="relative mt-4 text-center">
                <div className="text-xs text-gray-500 bg-white/70 backdrop-blur-sm rounded-lg py-2 px-4 inline-block shadow-sm border border-gray-200">
                  <Clock size={12} className="inline mr-1" />
                  分析耗时: {((Date.now() - (analysisResults.timestamp || Date.now())) / 1000).toFixed(1)}秒
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 餐次选择界面
  const MealSelectionModal = () => {
    const mealTypes = [
      { 
        type: 'breakfast' as const, 
        name: '早餐', 
        icon: '🌅', 
        time: '6:00-10:00',
        description: '开启活力一天' 
      },
      { 
        type: 'lunch' as const, 
        name: '午餐', 
        icon: '☀️', 
        time: '10:00-14:00',
        description: '午间能量补充' 
      },
      { 
        type: 'dinner' as const, 
        name: '晚餐', 
        icon: '🌙', 
        time: '17:00-21:00',
        description: '营养均衡收官' 
      },
      { 
        type: 'snack' as const, 
        name: '加餐', 
        icon: '🍎', 
        time: '其他时间',
        description: '健康小食补给' 
      }
    ];

    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-xl">
          {/* 头部 */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800">选择餐次</h2>
              <button 
                onClick={() => {
                  setShowMealSelection(false);
                  setCapturedPhoto(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500">当前时间 {currentTime}，AI推荐餐次已选中</p>
          </div>

          {/* 餐次选项 */}
          <div className="p-6 pt-4">
            <div className="space-y-3">
              {mealTypes.map((meal) => (
                <button
                  key={meal.type}
                  onClick={() => setSelectedMealType(meal.type)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    selectedMealType === meal.type
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{meal.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{meal.name}</span>
                        <span className="text-xs text-gray-500">{meal.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                    </div>
                    {selectedMealType === meal.type && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 底部按钮 */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMealSelection(false);
                  setCapturedPhoto(null);
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                重新拍照
              </button>
              <button
                onClick={() => {
                  setShowMealSelection(false);
                  setShowNutritionReport(true);
                }}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                确认分析
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NutritionReportModal = () => {
    // 检查是否来自拍照流程
    const isFromPhotoCapture = capturedPhoto !== null;
    
    // 根据选择的餐次获取数据
    const getMealData = () => {
      // 如果来自拍照流程，使用AI分析结果
      if (isFromPhotoCapture && analysisResults) {
        const mealTypeNames = {
          'breakfast': '早餐',
          'lunch': '午餐', 
          'dinner': '晚餐',
          'snack': '加餐'
        };
        
        return {
          title: `AI识别：${mealTypeNames[selectedMealType as keyof typeof mealTypeNames]}营养分析`,
          totalCalories: analysisResults.nutritionSummary.calories,
          totalProtein: analysisResults.nutritionSummary.protein,
          totalCarbs: analysisResults.nutritionSummary.carbs,
          totalFat: analysisResults.nutritionSummary.fat,
          averageScore: analysisResults.nutritionScore,
          description: 'AI识别成功！' + analysisResults.recommendations[0],
          isPhotoAnalysis: true
        };
      }
      // 如果来自拍照流程但没有分析结果，返回默认数据
      if (isFromPhotoCapture) {
        const mealTypeNames = {
          'breakfast': '早餐',
          'lunch': '午餐', 
          'dinner': '晚餐',
          'snack': '加餐'
        };
        
        return {
          title: `AI识别：${mealTypeNames[selectedMealType as keyof typeof mealTypeNames]}营养分析`,
          totalCalories: 520,
          totalProtein: 28,
          totalCarbs: 45,
          totalFat: 18,
          averageScore: 92,
          description: 'AI识别成功！这份餐品营养搭配均衡，蛋白质含量充足，建议适量增加蔬菜摄入。',
          isPhotoAnalysis: true
        };
      }
      if (selectedMealForReport === 'all') {
        return {
          title: '全天营养汇总',
          totalCalories: todayNutrition.current.calories,
          totalProtein: todayNutrition.current.protein,
          totalCarbs: todayNutrition.current.carbs,
          totalFat: todayNutrition.current.fat,
          averageScore: Math.round(todayMeals.reduce((sum, meal) => sum + meal.score, 0) / todayMeals.length),
          description: '今日整体营养摄入均衡，各营养素比例适宜'
        };
      } else {
        const mealsOfType = todayMeals.filter(meal => meal.mealType === selectedMealForReport);
        const totalNutrition = mealsOfType.reduce((sum, meal) => ({
          calories: sum.calories + meal.nutrition.calories,
          protein: sum.protein + meal.nutrition.protein,
          carbs: sum.carbs + meal.nutrition.carbs,
          fat: sum.fat + meal.nutrition.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        const averageScore = mealsOfType.length > 0 
          ? Math.round(mealsOfType.reduce((sum, meal) => sum + meal.score, 0) / mealsOfType.length)
          : 0;
          
        return {
          title: `${mealTypeNames[selectedMealForReport as keyof typeof mealTypeNames]}营养详报`,
          totalCalories: totalNutrition.calories,
          totalProtein: totalNutrition.protein,
          totalCarbs: totalNutrition.carbs,
          totalFat: totalNutrition.fat,
          averageScore,
          description: `${mealTypeNames[selectedMealForReport as keyof typeof mealTypeNames]}营养搭配${averageScore >= 90 ? '优秀' : averageScore >= 80 ? '良好' : '一般'}，${totalNutrition.protein >= 20 ? '蛋白质充足' : '建议增加蛋白质'}`
        };
      }
    };

    const mealData = getMealData();

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* 头部 - 固定 */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-xl font-bold">📊 营养分析报告</h2>
            <button 
              onClick={() => {
                // 奖励经验值 - 记录餐食
                // 记录餐食并获得游戏化奖励
                logMeal(); // 这会自动添加经验值并检查成就
                
                // 高营养评分额外奖励
                if (mealData.averageScore >= 85) {
                  addExp(20, '高营养评分奖励');
                }
                
                setShowNutritionReport(false);
                setSelectedMealForReport(null);
                // 如果来自拍照流程，清理拍照相关状态
                if (isFromPhotoCapture) {
                  setCapturedPhoto(null);
                  setAnalysisResults(null);
                  setAiAnalysisSteps([]);
                  setCurrentAnalysisStep(-1);
                }
              }}
              className="text-gray-500 p-2"
            >
              ✕
            </button>
          </div>

          {/* 主内容区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto p-6 pt-0">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="text-2xl font-bold text-white">{mealData.averageScore}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">{mealData.title}</h3>
              <p className="text-gray-600 text-sm">{mealData.description}</p>
              
              {/* 评分描述 */}
              <div className="mt-3 inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <Star size={16} className="text-green-600 fill-current" />
                <span className="text-sm font-medium text-green-700">
                  {mealData.averageScore >= 90 ? '营养搭配优秀' :
                   mealData.averageScore >= 80 ? '营养搭配良好' :
                   mealData.averageScore >= 70 ? '营养搭配合格' : '需要改善营养搭配'}
                </span>
              </div>
            </div>

            {/* 营养数据概览 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">🔥</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{mealData.totalCalories}</div>
                <div className="text-sm text-gray-600 font-medium">总热量</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center border border-orange-200 shadow-sm">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">🍖</span>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{mealData.totalProtein}g</div>
                <div className="text-sm text-gray-600 font-medium">蛋白质</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200 shadow-sm">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">🍚</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">{mealData.totalCarbs}g</div>
                <div className="text-sm text-gray-600 font-medium">碳水化合物</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200 shadow-sm">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">🧈</span>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">{mealData.totalFat}g</div>
                <div className="text-sm text-gray-600 font-medium">脂肪</div>
              </div>
            </div>

          {/* 营养摄入分布 - 美化版 */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BarChart3 size={14} className="text-white" />
              </div>
              <h4 className="text-base font-semibold text-gray-800">营养成分分析</h4>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
              {/* 热量总览卡片 */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-3 shadow-lg">
                    <span className="text-white font-bold text-lg">🔥</span>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {mealData.totalCalories}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">总热量 (千卡)</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((mealData.totalCalories / 800) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">推荐摄入: 约800千卡</div>
                </div>
              </div>

              {/* 三大营养素详细展示 */}
              <div className="space-y-4">
                {/* 蛋白质 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">蛋白</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">蛋白质</div>
                        <div className="text-xs text-gray-500">4千卡/克</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">{mealData.totalProtein}g</div>
                      <div className="text-xs text-gray-500">{mealData.totalProtein * 4}千卡 ({Math.round((mealData.totalProtein * 4 / mealData.totalCalories) * 100)}%)</div>
                    </div>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${Math.min((mealData.totalProtein / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>推荐: 50g</span>
                    <span>{Math.round((mealData.totalProtein / 50) * 100)}%</span>
                  </div>
                </div>

                {/* 碳水化合物 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">碳水</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">碳水化合物</div>
                        <div className="text-xs text-gray-500">4千卡/克</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{mealData.totalCarbs}g</div>
                      <div className="text-xs text-gray-500">{mealData.totalCarbs * 4}千卡 ({Math.round((mealData.totalCarbs * 4 / mealData.totalCalories) * 100)}%)</div>
                    </div>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${Math.min((mealData.totalCarbs / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>推荐: 100g</span>
                    <span>{Math.round((mealData.totalCarbs / 100) * 100)}%</span>
                  </div>
                </div>

                {/* 脂肪 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">脂肪</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">脂肪</div>
                        <div className="text-xs text-gray-500">9千卡/克</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">{mealData.totalFat}g</div>
                      <div className="text-xs text-gray-500">{mealData.totalFat * 9}千卡 ({Math.round((mealData.totalFat * 9 / mealData.totalCalories) * 100)}%)</div>
                    </div>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${Math.min((mealData.totalFat / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>推荐: 30g</span>
                    <span>{Math.round((mealData.totalFat / 30) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* 圆环图 - 优化版 */}
              <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-center mb-4">
                  <h5 className="text-sm font-semibold text-gray-700">营养成分占比</h5>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '蛋白质', value: mealData.totalProtein * 4, color: '#f97316' },
                            { name: '碳水化合物', value: mealData.totalCarbs * 4, color: '#22c55e' },
                            { name: '脂肪', value: mealData.totalFat * 9, color: '#a855f7' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[
                            { name: '蛋白质', value: mealData.totalProtein * 4, color: '#f97316' },
                            { name: '碳水化合物', value: mealData.totalCarbs * 4, color: '#22c55e' },
                            { name: '脂肪', value: mealData.totalFat * 9, color: '#a855f7' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* 中心显示营养评分 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                          {mealData.averageScore}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">营养评分</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 美化的图例 */}
                <div className="flex justify-center space-x-3 mt-4">
                  <div className="flex items-center bg-orange-50 px-3 py-2 rounded-full border border-orange-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-orange-700">蛋白质</span>
                  </div>
                  <div className="flex items-center bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-green-700">碳水</span>
                  </div>
                  <div className="flex items-center bg-purple-50 px-3 py-2 rounded-full border border-purple-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-purple-700">脂肪</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 根据餐次显示相关食物 */}
          {isFromPhotoCapture ? (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">AI识别结果</h4>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Camera size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">AI分析餐品</div>
                    <div className="text-sm text-gray-600">
                      餐次: {
                        selectedMealType === 'breakfast' ? '早餐' :
                        selectedMealType === 'lunch' ? '午餐' :
                        selectedMealType === 'dinner' ? '晚餐' : '加餐'
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{mealData.totalCalories}千卡</div>
                    <div className="text-xs text-green-500">AI评分: {mealData.averageScore}</div>
                  </div>
                </div>
              </div>
              
              {/* 识别到的食物详情 */}
              {analysisResults && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Star size={14} className="text-white" />
                    </div>
                    <div className="text-base font-semibold text-gray-800">AI识别到的食物</div>
                  </div>
                  {analysisResults.detectedFoods.map((food, index) => {
                    // 食物图标映射
                    const getFoodIcon = (foodName: string) => {
                      const name = foodName.toLowerCase();
                      if (name.includes('米饭') || name.includes('面条') || name.includes('面包')) return '🍚';
                      if (name.includes('鸡') || name.includes('牛') || name.includes('猪') || name.includes('肉')) return '🍖';
                      if (name.includes('鱼') || name.includes('虾') || name.includes('蟹')) return '🐟';
                      if (name.includes('菜') || name.includes('萝卜') || name.includes('白菜') || name.includes('豆腐')) return '🥬';
                      if (name.includes('蛋') || name.includes('鸡蛋')) return '🥚';
                      if (name.includes('汤') || name.includes('汁')) return '🍲';
                      if (name.includes('水果') || name.includes('苹果') || name.includes('香蕉')) return '🍎';
                      return '🍽️';
                    };

                    // 置信度颜色映射
                    const getConfidenceColor = (confidence: number) => {
                      if (confidence >= 90) return 'from-green-500 to-green-600';
                      if (confidence >= 70) return 'from-blue-500 to-blue-600';
                      if (confidence >= 50) return 'from-yellow-500 to-yellow-600';
                      return 'from-gray-400 to-gray-500';
                    };

                    // 置信度星级
                    const getConfidenceStars = (confidence: number) => {
                      const stars = Math.round(confidence / 20);
                      return Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                        />
                      ));
                    };

                    return (
                      <div key={index} className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300">
                        <div className="flex items-start space-x-3">
                          {/* 食物图标 */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-xl shadow-sm">
                              {getFoodIcon(food.name)}
                            </div>
                          </div>
                          
                          {/* 食物信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 text-lg truncate">{food.name}</h4>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getConfidenceColor(food.confidence)} shadow-sm`}>
                                {food.confidence}%
                              </div>
                            </div>
                            
                            {/* 重量和营养信息 */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">重量:</span>
                                  <span className="text-sm font-semibold text-blue-600">{food.weight}g</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">热量:</span>
                                  <span className="text-sm font-semibold text-orange-600">{food.nutrition.calories}千卡</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">准确度:</span>
                                {getConfidenceStars(food.confidence)}
                                <span className="text-xs text-gray-600 ml-1">
                                  {food.confidence >= 90 ? '非常准确' : 
                                   food.confidence >= 70 ? '比较准确' : 
                                   food.confidence >= 50 ? '基本准确' : '需要确认'}
                                </span>
                              </div>
                            </div>

                            {/* 营养成分简览 */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-orange-50 px-2 py-1 rounded-lg text-center">
                                <div className="text-xs font-semibold text-orange-600">{food.nutrition.protein}g</div>
                                <div className="text-xs text-gray-500">蛋白质</div>
                              </div>
                              <div className="bg-green-50 px-2 py-1 rounded-lg text-center">
                                <div className="text-xs font-semibold text-green-600">{food.nutrition.carbs}g</div>
                                <div className="text-xs text-gray-500">碳水</div>
                              </div>
                              <div className="bg-purple-50 px-2 py-1 rounded-lg text-center">
                                <div className="text-xs font-semibold text-purple-600">{food.nutrition.fat}g</div>
                                <div className="text-xs text-gray-500">脂肪</div>
                              </div>
                            </div>
                            
                            {/* 食材成分分析 */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">🧪 食材成分分析</span>
                              </div>
                              
                              {/* 按类别分组显示食材 */}
                              {['protein', 'vegetable', 'carb', 'seasoning', 'other'].map(category => {
                                const categoryIngredients = food.ingredients.filter(ing => ing.category === category);
                                if (categoryIngredients.length === 0) return null;
                                
                                const categoryInfo = {
                                  protein: { 
                                    name: '蛋白质', 
                                    icon: '🍖', 
                                    bgColor: 'bg-orange-50', 
                                    textColor: 'text-orange-700', 
                                    borderColor: 'border-orange-200' 
                                  },
                                  vegetable: { 
                                    name: '蔬菜', 
                                    icon: '🥬', 
                                    bgColor: 'bg-green-50', 
                                    textColor: 'text-green-700', 
                                    borderColor: 'border-green-200' 
                                  },
                                  carb: { 
                                    name: '主食', 
                                    icon: '🍚', 
                                    bgColor: 'bg-blue-50', 
                                    textColor: 'text-blue-700', 
                                    borderColor: 'border-blue-200' 
                                  },
                                  seasoning: { 
                                    name: '调料', 
                                    icon: '🧂', 
                                    bgColor: 'bg-gray-50', 
                                    textColor: 'text-gray-700', 
                                    borderColor: 'border-gray-200' 
                                  },
                                  other: { 
                                    name: '其他', 
                                    icon: '🥄', 
                                    bgColor: 'bg-purple-50', 
                                    textColor: 'text-purple-700', 
                                    borderColor: 'border-purple-200' 
                                  }
                                };
                                
                                const info = categoryInfo[category as keyof typeof categoryInfo];
                                
                                return (
                                  <div key={category} className="bg-white rounded-lg border border-gray-100 p-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm">{info.icon}</span>
                                      <span className={`text-xs font-medium ${info.textColor}`}>{info.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {categoryIngredients.map((ingredient, idx) => (
                                        <div key={idx} className={`flex items-center space-x-1 ${info.bgColor} ${info.textColor} px-2 py-1 rounded-md border ${info.borderColor}`}>
                                          <span className="text-xs font-medium">{ingredient.name}</span>
                                          <span className="text-xs opacity-75">{ingredient.amount}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 修正按钮区域 */}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setCorrectionFoodIndex(index);
                              setCorrectionType('weight');
                              setShowFoodCorrectionModal(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-all duration-200 border border-blue-200"
                          >
                            <span className="text-sm">⚖️</span>
                            <span className="text-sm font-medium">调整重量</span>
                          </button>
                          <button
                            onClick={() => {
                              setCorrectionFoodIndex(index);
                              setCorrectionType('food');
                              setShowFoodCorrectionModal(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg transition-all duration-200 border border-orange-200"
                          >
                            <span className="text-sm">🔄</span>
                            <span className="text-sm font-medium">更换菜品</span>
                          </button>
                        </div>

                        {/* 底部装饰线 */}
                        <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${getConfidenceColor(food.confidence)} opacity-60`}></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : selectedMealForReport !== 'all' && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">包含食物</h4>
              <div className="space-y-2">
                {todayMeals
                  .filter(meal => meal.mealType === selectedMealForReport)
                  .map(meal => (
                    <div key={meal.id} className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <img src={meal.image} alt={meal.name} className="w-10 h-10 object-cover rounded mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{meal.name}</div>
                        <div className="text-xs text-gray-600">{meal.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{meal.score}分</div>
                        <div className="text-xs text-gray-500">{meal.nutrition.calories}千卡</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              AI营养师建议
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              {/* 如果来自AI分析，显示AI推荐建议 */}
              {isFromPhotoCapture && analysisResults && analysisResults.recommendations ? (
                analysisResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>营养素配比{mealData.averageScore >= 90 ? '非常' : ''}均衡，有助于身体健康</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>蛋白质含量{mealData.totalProtein >= 20 ? '充足' : '适中'}，支持肌肉合成</span>
                  </div>
                  {mealData.totalCalories < (selectedMealForReport === 'all' ? 2000 : mealCalorieStandards[selectedMealForReport as keyof typeof mealCalorieStandards] || 500) && (
                    <div className="flex items-start">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 mt-0.5 flex-shrink-0"></div>
                      <span>热量偏低，建议适当增加健康食物摄入</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          </div>

          {/* 底部操作按钮 - 固定 */}
          <div className="p-6 pt-4 border-t border-gray-100 flex-shrink-0">
            <button 
              onClick={() => {
                // 如果来自拍照流程，添加新的餐食记录
                if (isFromPhotoCapture) {
                  // 这里应该将新餐食添加到状态中，但为了演示简化处理
                  // 在实际应用中，可以将餐食数据添加到todayMeals数组中
                  console.log('记录新餐食:', {
                    mealType: selectedMealType,
                    nutrition: mealData
                  });
                  setCapturedPhoto(null);
                  setAnalysisResults(null);
                  setAiAnalysisSteps([]);
                  setCurrentAnalysisStep(-1);
                }
                setShowNutritionReport(false);
                setSelectedMealForReport(null);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {isFromPhotoCapture ? '✅ 确认并记录餐食' : '✅ 确认记录'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const KOLPostModal = ({ post }: { post: KOLPost }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">一键跟吃</h2>
          <button 
            onClick={() => setSelectedKOLPost(null)}
            className="text-gray-500 p-2"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center mb-4">
          <img src={post.avatar} alt={post.name} className="w-12 h-12 rounded-full mr-3" />
          <div>
            <div className="font-semibold">{post.name}</div>
            <div className="text-sm text-gray-500">{post.time}</div>
          </div>
        </div>

        <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-4" />
        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>

        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{post.nutrition.calories}</div>
            <div className="text-xs text-gray-600">千卡</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{post.nutrition.protein}g</div>
            <div className="text-xs text-gray-600">蛋白质</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-600">{post.nutrition.fiber}g</div>
            <div className="text-xs text-gray-600">膳食纤维</div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <h4 className="font-semibold mb-3">选择跟吃方式</h4>
          <div className="space-y-3">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-green-800">美味复刻 - 净菜包</div>
                  <div className="text-sm text-green-600 mt-1">预处理食材 + 调料包，15分钟轻松烹饪</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">¥{post.price}</div>
                  <div className="text-xs text-green-500">推荐</div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">即享同款 - 健康餐</div>
                  <div className="text-sm text-gray-600 mt-1">中央厨房制作，加热即食</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">¥{post.price + 8}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setSelectedKOLPost(null)}
            className="py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700"
          >
            稍后决定
          </button>
          <button 
            onClick={() => {
              setSelectedKOLPost(null);
              alert('已成功下单！预计30分钟后送达，营养数据将自动记录到您的健康档案中');
            }}
            className="py-3 px-4 bg-green-500 text-white rounded-lg font-semibold"
          >
            立即跟吃
          </button>
        </div>
      </div>
    </div>
  );

  // 常见食物模态框
  const CommonFoodsModal = () => {
    const categoryNames = {
      protein: '蛋白质',
      carbs: '碳水化合物', 
      vegetables: '蔬菜',
      fruits: '水果',
      nuts: '坚果',
      dairy: '乳制品'
    };

    const categories = ['protein', 'carbs', 'vegetables', 'fruits', 'nuts', 'dairy'] as const;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">常见食物营养库</h2>
            <button 
              onClick={() => setShowCommonFoods(false)}
              className="text-gray-500 p-2"
            >
              ✕
            </button>
          </div>

          {categories.map(category => {
            const foodsInCategory = commonFoods.filter(food => food.category === category);
            return (
              <div key={category} className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">{categoryNames[category]}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {foodsInCategory.map(food => (
                    <div 
                      key={food.id}
                      onClick={() => {
                        setShowCommonFoods(false);
                        alert(`已添加 ${food.name} 到今日饮食记录中`);
                      }}
                      className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{food.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{food.name}</div>
                          <div className="text-xs text-gray-500">{food.nutrition.calories}千卡/100g</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
                        <div>蛋白 {food.nutrition.protein}g</div>
                        <div>碳水 {food.nutrition.carbs}g</div>
                        <div>脂肪 {food.nutrition.fat}g</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 菜谱详情模态框
  const RecipeDetailModal = ({ recipe }: { recipe: Recipe }) => {
    const [selectedOption, setSelectedOption] = useState<'kit' | 'ready'>('kit');
    const [activeTab, setActiveTab] = useState<'ingredients' | 'steps' | 'nutrition'>('ingredients');

    const difficultyMap = {
      easy: { text: '简单', color: 'text-green-600', bg: 'bg-green-100' },
      medium: { text: '中等', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      hard: { text: '困难', color: 'text-red-600', bg: 'bg-red-100' }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto">
          {/* 头部图片和基本信息 */}
          <div className="relative">
            <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
            <button 
              onClick={() => {
                setShowRecipeDetail(false);
                setSelectedRecipe(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <h2 className="text-xl font-bold mb-2">{recipe.name}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{recipe.rating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{recipe.cookTime}分钟</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${difficultyMap[recipe.difficulty].bg} ${difficultyMap[recipe.difficulty].color}`}>
                  {difficultyMap[recipe.difficulty].text}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 描述和标签 */}
            <p className="text-gray-600 mb-4">{recipe.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag, index) => (
                <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>

            {/* 选项卡导航 */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              {[
                { key: 'ingredients', label: '食材' },
                { key: 'steps', label: '步骤' },
                { key: 'nutrition', label: '营养' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'ingredients' | 'steps' | 'nutrition')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key 
                      ? 'bg-white text-green-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 选项卡内容 */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">食材清单</h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-600">{ingredient.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">制作步骤</h3>
                <div className="space-y-4">
                  {recipe.steps.map((step) => (
                    <div key={step.stepNumber} className="flex space-x-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{step.description}</p>
                        {step.time && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{step.time}分钟</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 小贴士 */}
                {recipe.tips.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      💡 烹饪小贴士
                    </h4>
                    <ul className="space-y-1">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-yellow-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">营养成分</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{recipe.nutrition.calories}</div>
                    <div className="text-sm text-gray-600">千卡</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{recipe.nutrition.protein}g</div>
                    <div className="text-sm text-gray-600">蛋白质</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{recipe.nutrition.carbs}g</div>
                    <div className="text-sm text-gray-600">碳水化合物</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{recipe.nutrition.fat}g</div>
                    <div className="text-sm text-gray-600">脂肪</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">{recipe.nutrition.sodium}mg</div>
                    <div className="text-sm text-gray-600">钠</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{recipe.nutrition.fiber}g</div>
                    <div className="text-sm text-gray-600">膳食纤维</div>
                  </div>
                </div>
              </div>
            )}

            {/* 净菜包选择 */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="font-semibold mb-4">选择购买方式</h4>
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedOption('kit')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOption === 'kit' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-green-800 flex items-center">
                        净菜包 - 自己烹饪
                        {selectedOption === 'kit' && (
                          <Check className="w-4 h-4 ml-2 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-green-600 mt-1">预处理食材 + 调料包，{recipe.cookTime}分钟轻松烹饪</div>
                      <div className="text-xs text-gray-600 mt-1">包含所有食材，按份量配好，新鲜直达</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">¥{recipe.kitPrice}</div>
                      <div className="text-xs text-green-500">推荐</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setSelectedOption('ready')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOption === 'ready' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-800 flex items-center">
                        即食餐 - 加热即享
                        {selectedOption === 'ready' && (
                          <Check className="w-4 h-4 ml-2 text-blue-600" />
                        )}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">中央厨房制作，微波2分钟即可享用</div>
                      <div className="text-xs text-gray-600 mt-1">营养数据精确，无需烹饪技巧</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">¥{recipe.readyMealPrice}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowRecipeDetail(false);
                  setSelectedRecipe(null);
                }}
                className="py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700"
              >
                稍后决定
              </button>
              <button 
                onClick={() => {
                  const optionText = selectedOption === 'kit' ? '净菜包' : '即食餐';
                  const price = selectedOption === 'kit' ? recipe.kitPrice : recipe.readyMealPrice;
                  setShowRecipeDetail(false);
                  setSelectedRecipe(null);
                  alert(`已成功添加"${recipe.name} - ${optionText}"到购物车！价格：¥${price}\n\n营养数据将在送达后自动记录到您的健康档案中。`);
                }}
                className="py-3 px-4 bg-green-500 text-white rounded-lg font-semibold flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                加入购物车
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI营养师卡卡智能交互界面
  const AIChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
      {
        id: 1,
        text: "主人您好！我是您的专属营养师卡卡 🦝✨ 我发现您今天蛋白质摄入很不错呢，已经完成了74%的目标！👏",
        isAI: true,
        timestamp: new Date(Date.now() - 300000),
        mood: 'happy'
      },
      {
        id: 2,
        text: "不过我注意到您的膳食纤维摄入稍微不足，晚餐建议加点绿叶蔬菜或者来个苹果当夜宵怎么样？🍎",
        isAI: true,
        timestamp: new Date(Date.now() - 240000),
        mood: 'caring'
      },
      {
        id: 3,
        text: "好的，谢谢提醒！有什么推荐的晚餐吗？",
        isAI: false,
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: 4,
        text: "基于您的口味偏好和今日营养缺口，我推荐「蒜蓉西兰花炒虾仁」！高蛋白低脂，还能补充膳食纤维～要不要看看菜谱？",
        isAI: true,
        timestamp: new Date(Date.now() - 120000),
        mood: 'excited'
      }
    ]);
    
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [kakaStatus, setKakaStatus] = useState('online'); // online, thinking, typing
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 卡卡的不同情绪状态
    const kakaMoods = {
      happy: { emoji: '🦝😊', bgGradient: 'from-green-400 to-green-500' },
      caring: { emoji: '🦝💕', bgGradient: 'from-green-400 to-blue-400' },
      excited: { emoji: '🦝✨', bgGradient: 'from-green-400 to-yellow-400' },
      thinking: { emoji: '🦝🤔', bgGradient: 'from-green-400 to-purple-400' },
      default: { emoji: '🦝', bgGradient: 'from-green-400 to-green-500' }
    };

    // 智能回复模板
    const aiResponses = {
      nutrition: [
        "根据您今天的摄入，我建议{suggestion}！这样能更好地平衡营养哦 💪",
        "您的{nutrient}摄入{status}，建议{recommendation} 🌟",
        "从营养角度来说，{advice}会对您的健康很有帮助呢 ✨"
      ],
      encouragement: [
        "您今天的饮食记录做得很棒！坚持下去就是最好的投资 💖",
        "哇，看到您这么认真地记录饮食，卡卡超感动的！🥰",
        "每一天的健康选择都在让您变得更好，加油！🌟"
      ],
      recipes: [
        "这道菜不仅美味，营养价值也很高呢！要不要我教您制作方法？👩‍🍳",
        "根据您的口味偏好，我为您推荐了几道营养餐，都很适合您哦 🍽️",
        "这个搭配既满足味蕾又健康，一举两得！😋"
      ]
    };

    // 快捷回复选项
    const quickReplies = [
      "今天吃什么好？🤔",
      "帮我分析营养 📊", 
      "推荐减脂餐 💪",
      "我想吃甜食 🍰",
      "制定饮食计划 📝",
      "查看今日总结 📈"
    ];

    // 生成营养建议卡片数据
    const generateNutritionCard = (type: 'analysis' | 'recommendation') => {
      if (type === 'analysis') {
        return {
          title: "今日营养分析",
          icon: "📊",
          data: [
            { label: "蛋白质", value: "74%", color: "text-blue-600", bgColor: "bg-blue-50" },
            { label: "碳水化合物", value: "82%", color: "text-green-600", bgColor: "bg-green-50" },
            { label: "膳食纤维", value: "45%", color: "text-orange-600", bgColor: "bg-orange-50" },
            { label: "维生素C", value: "91%", color: "text-purple-600", bgColor: "bg-purple-50" }
          ],
          score: 85,
          suggestion: "膳食纤维稍显不足，建议增加蔬菜水果摄入"
        };
      } else {
        return {
          title: "个性化推荐",
          icon: "🎯",
          dishes: [
            { name: "蒜蓉西兰花炒虾仁", calories: 180, protein: 25, time: 15 },
            { name: "番茄鸡胸肉", calories: 220, protein: 30, time: 20 },
            { name: "三文鱼蔬菜沙拉", calories: 280, protein: 28, time: 10 }
          ]
        };
      }
    };

    // 模拟AI智能回复
    const generateAIResponse = (userMessage: string): { text: string; card?: any; hasCard?: boolean } => {
      const message = userMessage.toLowerCase();
      
      if (message.includes('吃什么') || message.includes('推荐') || message.includes('晚餐') || message.includes('午餐') || message.includes('早餐')) {
        const suggestions = [
          "蒜蓉西兰花炒虾仁配糙米饭",
          "番茄鸡胸肉意面",
          "三文鱼蔬菜沙拉",
          "紫薯银耳羹配水煮蛋",
          "牛油果吐司配煎蛋"
        ];
        return {
          text: `根据您的营养需求，我为您推荐几道营养餐！既美味又营养，要不要看看具体制作方法？👩‍🍳✨`,
          card: generateNutritionCard('recommendation'),
          hasCard: true
        };
      }
      
      if (message.includes('减脂') || message.includes('减肥') || message.includes('瘦身')) {
        return {
          text: "减脂期间要保证营养均衡哦！我建议高蛋白、适量碳水、丰富蔬菜的搭配。比如鸡胸肉配彩椒、糙米饭，既有饱腹感又不会热量超标 💪✨"
        };
      }
      
      if (message.includes('甜食') || message.includes('甜品') || message.includes('蛋糕')) {
        return {
          text: "理解您想吃甜食的心情呢 🥰 不如试试自制水果酸奶杯或者红薯紫薯？既能满足甜味需求，又相对健康一些～偶尔放纵一下也没关系啦！"
        };
      }
      
      if (message.includes('营养') || message.includes('分析') || message.includes('数据')) {
        return {
          text: "让我来为您分析今天的营养摄入情况吧！📊 从数据来看，您今天的营养摄入整体很不错呢！",
          card: generateNutritionCard('analysis'),
          hasCard: true
        };
      }
      
      if (message.includes('计划') || message.includes('规划')) {
        return {
          text: "好的！我会根据您的身体状况、目标和偏好来制定个性化饮食计划 📝 包括三餐安排、营养搭配和健康小贴士，让健康饮食变得简单有趣！"
        };
      }
      
      // 默认温暖回复
      const defaultResponses = [
        "听起来很有趣呢！能告诉我更多细节吗？我想更好地帮助您 🤗",
        "卡卡正在思考中...这个问题让我想到了很多营养知识呢！💭",
        "您的健康意识真的很棒！有任何营养问题都可以问我哦 ✨",
        "每一个关于健康的想法都值得鼓励！说说您的具体需求吧 🌟"
      ];
      
      return {
        text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
      };
    };

    // 发送消息
    const sendMessage = async (text: string) => {
      if (!text.trim()) return;
      
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        text: text,
        isAI: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setKakaStatus('thinking');
      
      // 模拟AI思考和回复
      setTimeout(() => {
        setKakaStatus('typing');
        setIsTyping(true);
        
        setTimeout(() => {
          const aiResponse = generateAIResponse(text);
          const aiReply = {
            id: Date.now() + 1,
            text: aiResponse.text,
            isAI: true,
            timestamp: new Date(),
            mood: ['happy', 'caring', 'excited'][Math.floor(Math.random() * 3)] as 'happy' | 'caring' | 'excited',
            hasCard: aiResponse.hasCard,
            card: aiResponse.card
          };
          
          setMessages(prev => [...prev, aiReply]);
          setIsTyping(false);
          setKakaStatus('online');
          
          // AI回复语音播报
          if (voiceEnabled) {
            setTimeout(() => speakText(aiResponse.text), 500);
          }
        }, 1500 + Math.random() * 1000); // 随机打字时间
      }, 800); // 思考时间
    };

    // 快捷回复
    const handleQuickReply = (text: string) => {
      sendMessage(text);
    };

    // 自动滚动到底部
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 语音识别功能
    const startVoiceRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别功能');
        return;
      }

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setKakaStatus('thinking');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        setKakaStatus('online');
      };

      recognition.onerror = () => {
        setIsListening(false);
        setKakaStatus('online');
        alert('语音识别出错，请重试');
      };

      recognition.onend = () => {
        setIsListening(false);
        setKakaStatus('online');
      };

      recognition.start();
    };

    // 语音合成功能
    const speakText = (text: string) => {
      if (!voiceEnabled || !('speechSynthesis' in window)) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;

      // 尝试使用中文女声
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => voice.lang.includes('zh') && voice.name.includes('Female'));
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      speechSynthesis.speak(utterance);
    };

    // 获取当前卡卡状态的视觉效果
    const getCurrentKakaStyle = () => {
      if (kakaStatus === 'thinking') return kakaMoods.thinking;
      if (kakaStatus === 'typing') return kakaMoods.excited;
      return kakaMoods.default;
    };

    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          {/* 头部 - 增强设计 */}
          <div className={`bg-gradient-to-r ${getCurrentKakaStyle().bgGradient} text-white p-4 pb-6 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setAiChatOpen(false)}
                  className="mr-3 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  ←
                </button>
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                      <span className="text-xl">{getCurrentKakaStyle().emoji}</span>
                    </div>
                    {/* 在线状态指示器 */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      kakaStatus === 'online' ? 'bg-green-400' : 
                      kakaStatus === 'thinking' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}>
                      {kakaStatus === 'typing' && (
                        <div className="flex space-x-1 items-center justify-center h-full">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">AI营养师卡卡</div>
                    <div className="text-sm opacity-90">
                      {kakaStatus === 'thinking' ? '🤔 正在思考...' : 
                       kakaStatus === 'typing' ? '💬 正在回复...' : '😊 您的专属健康管家'}
                    </div>
                  </div>
                </div>
              </div>
              {/* 功能按钮 */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    voiceEnabled ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70'
                  } hover:bg-white/20`}
                  title={voiceEnabled ? '关闭语音播报' : '开启语音播报'}
                >
                  {voiceEnabled ? '🔊' : '🔇'}
                </button>
                <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          {/* 聊天消息区域 - 增强设计 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className={`flex ${message.isAI ? 'items-start animate-slideInLeft' : 'justify-end animate-slideInRight'}`}>
                  {message.isAI && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3 mt-1 shadow-sm animate-heartbeat">
                      <span className="text-sm">
                        {message.mood && message.mood in kakaMoods ? kakaMoods[message.mood].emoji.split('🦝')[1] || '🦝' : '🦝'}
                      </span>
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                    message.isAI 
                      ? 'bg-white border border-gray-100 rounded-tl-sm hover:border-green-200' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tr-sm hover:from-green-600 hover:to-green-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className={`text-xs mt-2 flex items-center justify-between ${message.isAI ? 'text-gray-400' : 'text-green-100'}`}>
                      <span>{message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {!message.isAI && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                    {/* AI消息的营养建议标签 */}
                    {message.isAI && (message.text.includes('推荐') || message.text.includes('建议')) && (
                      <div className="mt-2 flex space-x-1">
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">💡 营养建议</span>
                      </div>
                    )}
                    {/* 食谱相关消息的标签 */}
                    {message.isAI && message.text.includes('菜谱') && (
                      <div className="mt-2 flex space-x-1">
                        <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">👩‍🍳 菜谱推荐</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 营养建议卡片 */}
                  {message.isAI && message.hasCard && message.card && (
                    <div className="w-full max-w-sm mt-3 animate-fadeIn">
                      {message.card.title === "今日营养分析" ? (
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center mb-3">
                            <span className="text-lg mr-2">{message.card.icon}</span>
                            <h4 className="font-semibold text-gray-800">{message.card.title}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {message.card.data.map((item: any, idx: number) => (
                              <div key={idx} className={`${item.bgColor} p-3 rounded-lg text-center`}>
                                <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                                <div className="text-xs text-gray-600">{item.label}</div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">综合评分</span>
                              <span className="text-lg font-bold text-green-600">{message.card.score}分</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${message.card.score}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{message.card.suggestion}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center mb-3">
                            <span className="text-lg mr-2">{message.card.icon}</span>
                            <h4 className="font-semibold text-gray-800">{message.card.title}</h4>
                          </div>
                          <div className="space-y-2">
                            {message.card.dishes.map((dish: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-medium text-gray-800 text-sm">{dish.name}</h5>
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{dish.time}分钟</span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  <span>🔥 {dish.calories}千卡</span>
                                  <span>💪 {dish.protein}g蛋白质</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                            查看详细菜谱 →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* 打字指示器 */}
              {isTyping && (
                <div className="flex items-start animate-fadeIn">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    🦝
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 快捷回复区域 */}
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* 输入区域 - 增强设计 */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3">
              <button className="text-gray-400 hover:text-green-500 mr-3 transition-colors">
                📷
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                placeholder="和卡卡聊聊您的饮食想法..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button 
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`mx-3 transition-colors ${
                  isListening 
                    ? 'text-red-500 animate-pulse' 
                    : 'text-gray-400 hover:text-green-500'
                }`}
                title={isListening ? '正在录音...' : '语音输入'}
              >
                {isListening ? '🔴' : '🎤'}
              </button>
              <button 
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
                className={`font-semibold text-sm px-4 py-2 rounded-xl transition-all ${
                  inputText.trim() 
                    ? 'text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg' 
                    : 'text-gray-400 bg-gray-200'
                }`}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">食刻</h1>
            <p className="text-green-100 text-sm">精准营养解码，预见更健康的你</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 游戏化状态显示 */}
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Zap size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">Lv.{level}</span>
              {streak > 0 && (
                <>
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="flex items-center gap-1">
                    <span className="text-orange-300">🔥</span>
                    <span className="text-xs">{streak}</span>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => setAiChatOpen(true)}
              className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center"
            >
              🦝
            </button>
          </div>
        </div>
        
        {/* 分餐选项卡 */}
        <div className="flex bg-green-300/30 rounded-full p-1 mb-4">
          {Object.entries(mealTypeNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedMealTime(key)}
              className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                selectedMealTime === key 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-green-100 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            {selectedMealTime === 'all' 
              ? todayNutrition.current.calories 
              : mealNutritionByType[selectedMealTime as keyof typeof mealNutritionByType]?.calories || 0
            }
          </div>
          <div className="text-green-100 text-sm">
            {selectedMealTime === 'all' 
              ? `今日摄入热量 / ${todayNutrition.target.calories} 千卡`
              : `${mealTypeNames[selectedMealTime as keyof typeof mealTypeNames]}热量摄入 / ${mealCalorieStandards[selectedMealTime as keyof typeof mealCalorieStandards]} 千卡`
            }
          </div>
          <div className="w-full bg-green-300 rounded-full h-2 mt-3">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ 
                width: selectedMealTime === 'all' 
                  ? `${(todayNutrition.current.calories / todayNutrition.target.calories) * 100}%`
                  : `${((mealNutritionByType[selectedMealTime as keyof typeof mealNutritionByType]?.calories || 0) / mealCalorieStandards[selectedMealTime as keyof typeof mealCalorieStandards]) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={async () => {
              await executeWithPermission(
                'ai_recognition',
                () => {
                  setShowCamera(true);
                  return Promise.resolve();
                },
                {
                  autoPromptUpgrade: true,
                  onDenied: (reason) => {
                    console.log('AI识别权限不足:', reason);
                  }
                }
              );
            }}
            className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg hover:bg-green-600 transition-colors relative"
          >
            <Camera size={20} />
            <span className="font-semibold text-sm">拍照记录</span>
            {!permissions.hasUnlimitedAi && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {membership.remainingUsage?.aiRecognition || 0}
              </div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className="bg-blue-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <BookOpen size={20} />
            <span className="font-semibold text-sm">AI推荐</span>
          </button>
        </div>
        
        {/* 游戏化快捷入口 */}
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award size={20} />
              <span className="font-semibold">成就进度</span>
            </div>
            <button 
              onClick={() => setActiveTab('gamification')}
              className="text-xs bg-white/20 px-2 py-1 rounded-full"
            >
              查看全部
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-purple-100">等级 </span>
              <span className="font-bold">Lv.{level}</span>
            </div>
            <div>
              <span className="text-purple-100">连击 </span>
              <span className="font-bold">{streak} 天</span>
            </div>
            <div>
              <span className="text-purple-100">经验 </span>
              <span className="font-bold">{exp}</span>
            </div>
          </div>
        </div>

        {/* 快捷添加餐食 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">快捷记录</h3>
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => setShowCommonFoods(true)}
              className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center space-y-1 hover:shadow-md transition-shadow"
            >
              <Coffee className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-600">早餐</span>
            </button>
            <button 
              onClick={() => setShowCommonFoods(true)}
              className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center space-y-1 hover:shadow-md transition-shadow"
            >
              <Utensils className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-600">午餐</span>
            </button>
            <button 
              onClick={() => setShowCommonFoods(true)}
              className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center space-y-1 hover:shadow-md transition-shadow"
            >
              <Sandwich className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-600">晚餐</span>
            </button>
            <button 
              onClick={() => setShowCommonFoods(true)}
              className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center space-y-1 hover:shadow-md transition-shadow"
            >
              <Apple className="w-5 h-5 text-red-500" />
              <span className="text-xs text-gray-600">加餐</span>
            </button>
          </div>
        </div>

        {/* 我的营养计划 */}
        {userNutritionPlans.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">我的营养计划</h3>
              <button 
                onClick={() => setActiveTab('store')}
                className="text-xs text-blue-600"
              >
                查看全部
              </button>
            </div>
            <div className="space-y-3">
              {/* 活跃计划 */}
              {userNutritionPlans.filter(plan => plan.status === 'active').map(userPlan => (
                <div key={userPlan.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{userPlan.plan.title}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span>第 {userPlan.currentDay}/{userPlan.totalDays} 天</span>
                        <span>•</span>
                        <span className="text-green-600">遵循率 {userPlan.adherenceRate}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">还剩</div>
                      <div className="text-sm font-bold text-blue-600">{userPlan.remainingDays} 天</div>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>计划进度</span>
                      <span>{userPlan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${userPlan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 今日推荐 */}
                  {userPlan.todayRecommendation && (
                    <div className="bg-white/60 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-xs font-medium text-gray-700">今日推荐</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {userPlan.todayRecommendation.breakfast && (
                          <div className="flex items-center gap-1">
                            <Coffee className="w-3 h-3 text-orange-500" />
                            <span className="text-gray-600">{userPlan.todayRecommendation.breakfast}</span>
                          </div>
                        )}
                        {userPlan.todayRecommendation.lunch && (
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600">{userPlan.todayRecommendation.lunch}</span>
                          </div>
                        )}
                        {userPlan.todayRecommendation.dinner && (
                          <div className="flex items-center gap-1">
                            <Sandwich className="w-3 h-3 text-blue-500" />
                            <span className="text-gray-600">{userPlan.todayRecommendation.dinner}</span>
                          </div>
                        )}
                        {userPlan.todayRecommendation.snack && (
                          <div className="flex items-center gap-1">
                            <Apple className="w-3 h-3 text-red-500" />
                            <span className="text-gray-600">{userPlan.todayRecommendation.snack}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* 暂停的计划 */}
              {userNutritionPlans.filter(plan => plan.status === 'paused').map(userPlan => (
                <div key={userPlan.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-600 text-sm">{userPlan.plan.title}</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">已暂停</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>已进行 {userPlan.currentDay}/{userPlan.totalDays} 天</span>
                        <span>•</span>
                        <span>遵循率 {userPlan.adherenceRate}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const activePlan = getActivePlan();
                        if (activePlan) {
                          const confirmed = window.confirm(
                            `您当前正在进行"${activePlan.plan.title}"计划。\n\n恢复"${userPlan.plan.title}"将暂停当前计划，是否确认？`
                          );
                          if (!confirmed) return;
                        }
                        
                        // 恢复选中的计划，暂停其他活跃计划
                        const updatedPlans = userNutritionPlans.map(plan => {
                          if (plan.id === userPlan.id) {
                            return { ...plan, status: 'active' as const };
                          } else if (plan.status === 'active') {
                            return { ...plan, status: 'paused' as const };
                          }
                          return plan;
                        });
                        setUserNutritionPlans(updatedPlans);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      恢复
                    </button>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>计划进度</span>
                      <span>{userPlan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                        style={{ width: `${userPlan.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 今日目标进度概览 */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">今日目标</h3>
            <span className="text-xs text-gray-600">82% 完成</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600 mb-1">
                {todayNutrition.current.calories}
              </div>
              <div className="text-xs text-gray-600">千卡 / {todayNutrition.target.calories}</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-green-500"
                  style={{ width: `${Math.min((todayNutrition.current.calories / todayNutrition.target.calories) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-600 mb-1">
                {todayNutrition.current.protein}g
              </div>
              <div className="text-xs text-gray-600">蛋白质 / {todayNutrition.target.protein}g</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-orange-500"
                  style={{ width: `${Math.min((todayNutrition.current.protein / todayNutrition.target.protein) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">今日营养概览</h2>
          <div className="grid grid-cols-2 gap-3">
            {renderNutritionCard(
              '蛋白质', 
              todayNutrition.current.protein, 
              todayNutrition.target.protein, 
              'g', 
              'bg-orange-500'
            )}
            {renderNutritionCard(
              '碳水化合物', 
              todayNutrition.current.carbs, 
              todayNutrition.target.carbs, 
              'g', 
              'bg-green-500'
            )}
            {renderNutritionCard(
              '脂肪', 
              todayNutrition.current.fat, 
              todayNutrition.target.fat, 
              'g', 
              'bg-purple-500'
            )}
            {renderNutritionCard(
              '膳食纤维', 
              todayNutrition.current.fiber, 
              todayNutrition.target.fiber, 
              'g', 
              'bg-blue-500'
            )}
            {renderNutritionCard(
              '钠', 
              todayNutrition.current.sodium, 
              todayNutrition.target.sodium, 
              'mg', 
              'bg-red-500'
            )}
            {renderNutritionCard(
              '热量密度', 
              Math.round((todayNutrition.current.calories / todayNutrition.target.calories) * 100), 
              100, 
              '%', 
              'bg-indigo-500'
            )}
          </div>
        </div>

        {/* Today's Meals */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">今日饮食</h2>
            <div className="relative">
              <button 
                onClick={() => setSelectedMealForReport(selectedMealForReport ? null : 'menu')}
                className="text-green-500 text-sm font-medium"
              >
                查看详报 {selectedMealForReport === 'menu' ? '▲' : '▼'}
              </button>
              
              {/* 餐次选择下拉菜单 */}
              {selectedMealForReport === 'menu' && (
                <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
                  <button 
                    onClick={() => {
                      setSelectedMealForReport('all');
                      setShowNutritionReport(true);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    全天汇总
                  </button>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                    const mealsOfType = todayMeals.filter(meal => meal.mealType === mealType);
                    if (mealsOfType.length === 0) return null;
                    
                    return (
                      <button 
                        key={mealType}
                        onClick={() => {
                          setSelectedMealForReport(mealType);
                          setShowNutritionReport(true);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        {mealTypeNames[mealType as keyof typeof mealTypeNames]}详报
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* 按餐类分组显示 */}
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const mealsOfType = todayMeals.filter(meal => meal.mealType === mealType);
            if (mealsOfType.length === 0) return null;
            
            return (
              <div key={mealType} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-700 text-sm">
                    {mealTypeNames[mealType as keyof typeof mealTypeNames]}
                  </h3>
                  <div className="text-xs text-gray-500">
                    {mealsOfType.reduce((sum, meal) => sum + meal.nutrition.calories, 0)} 千卡
                  </div>
                </div>
                <div className="space-y-2">
                  {mealsOfType.map((meal) => (
                    <div 
                      key={meal.id}
                      className="bg-white p-3 rounded-lg shadow-sm flex items-center cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <img src={meal.image} alt={meal.name} className="w-12 h-12 object-cover rounded-lg mr-3" />
                      <div className="flex-1">
                        <div className="font-medium mb-1 text-sm">{meal.name}</div>
                        <div className="text-xs text-gray-600 mb-1">{meal.time}</div>
                        <div className="text-xs text-gray-500">
                          {meal.nutrition.calories}千卡 • {meal.nutrition.protein}g蛋白质
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{meal.score}</div>
                        <div className="text-xs text-gray-500">分</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Health Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">健康洞察</h3>
            </div>
            
            {/* 洞察期间选择 */}
            <div className="flex bg-white rounded-full p-1">
              {Object.entries(insightPeriods).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setSelectedInsightPeriod(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedInsightPeriod === key 
                      ? 'bg-blue-500 text-white' 
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* 根据选择的期间显示不同内容 */}
          {selectedInsightPeriod === 'today' && (
            <div>
              <div className="flex items-center mb-3">
                <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-sm">今日营养评估</span>
              </div>
              
              {/* Apple Watch风格圆环图 */}
              <div className="bg-white/70 rounded-lg p-4 mb-3">
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    {/* 圆环图容器 */}
                    <div className="absolute inset-0">
                      <svg width="128" height="128" className="transform -rotate-90">
                        {/* 背景圆环 */}
                        <circle
                          cx="64"
                          cy="64"
                          r="55"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* 热量圆环 */}
                        <circle
                          cx="64"
                          cy="64"
                          r="55"
                          stroke="#10b981"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 55}`}
                          strokeDashoffset={`${2 * Math.PI * 55 * (1 - todayNutrition.current.calories / todayNutrition.target.calories)}`}
                          strokeLinecap="round"
                        />
                        {/* 蛋白质圆环 */}
                        <circle
                          cx="64"
                          cy="64"
                          r="45"
                          stroke="#f59e0b"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - todayNutrition.current.protein / todayNutrition.target.protein)}`}
                          strokeLinecap="round"
                        />
                        {/* 碳水化合物圆环 */}
                        <circle
                          cx="64"
                          cy="64"
                          r="35"
                          stroke="#3b82f6"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 35}`}
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - todayNutrition.current.carbs / todayNutrition.target.carbs)}`}
                          strokeLinecap="round"
                        />
                        {/* 脂肪圆环 */}
                        <circle
                          cx="64"
                          cy="64"
                          r="26"
                          stroke="#8b5cf6"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 26}`}
                          strokeDashoffset={`${2 * Math.PI * 26 * (1 - todayNutrition.current.fat / todayNutrition.target.fat)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    
                    {/* 中心文字 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">82%</div>
                        <div className="text-xs text-gray-600">完成度</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 图例 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>热量 {Math.round((todayNutrition.current.calories / todayNutrition.target.calories) * 100)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span>蛋白质 {Math.round((todayNutrition.current.protein / todayNutrition.target.protein) * 100)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>碳水 {Math.round((todayNutrition.current.carbs / todayNutrition.target.carbs) * 100)}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>脂肪 {Math.round((todayNutrition.current.fat / todayNutrition.target.fat) * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-blue-700 mb-3">
                今日摄入均衡度良好！蛋白质达标率{Math.round((todayNutrition.current.protein / todayNutrition.target.protein) * 100)}%，建议晚间补充一份低脂酸奶。
              </p>
            </div>
          )}

          {selectedInsightPeriod === 'week' && (
            <div>
              <div className="flex items-center mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                <span className="font-medium text-sm">本周趋势分析</span>
              </div>
              
              {/* 使用Recharts的折线图 */}
              <div className="bg-white/70 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-gray-600">本周营养趋势</span>
                  <span className="text-xs text-gray-500">平均1953千卡</span>
                </div>
                
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <YAxis hide />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 4, fill: '#10b981' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="protein" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 4, fill: '#f59e0b' }}
                        yAxisId="protein"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* 图例 */}
                <div className="flex justify-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-gray-600">热量</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                    <span className="text-xs text-gray-600">蛋白质</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-blue-700 mb-3">
                本周营养摄入稳定性优秀，平均营养分89分。蛋白质摄入呈上升趋势。
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="font-bold text-green-600">89</div>
                  <div className="text-gray-600">平均分</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="font-bold text-orange-600">+8%</div>
                  <div className="text-gray-600">蛋白质↗</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="font-bold text-blue-600">7天</div>
                  <div className="text-gray-600">连续记录</div>
                </div>
              </div>
            </div>
          )}

          <button className="text-blue-600 text-sm font-medium mt-3 flex items-center">
            查看详细分析 
            <TrendingUp className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* 水分摄入追踪 */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Droplets className="w-5 h-5 text-cyan-600 mr-2" />
              <h3 className="font-semibold text-cyan-800">今日水分</h3>
            </div>
            <button 
              onClick={() => alert('添加200ml水分记录')}
              className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center"
            >
              <Plus size={12} className="mr-1" />
              记录
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-cyan-700">1600ml</span>
                <span className="text-cyan-600">/2000ml</span>
              </div>
              <div className="w-full bg-cyan-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-cyan-500 transition-all duration-300"
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-600">80%</div>
              <div className="text-xs text-cyan-600">完成</div>
            </div>
          </div>
        </div>

        {/* 智能提醒 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl mb-6">
          <div className="flex items-center mb-3">
            <Zap className="w-5 h-5 text-amber-600 mr-2" />
            <h3 className="font-semibold text-amber-800">智能提醒</h3>
          </div>
          <div className="space-y-2">
            <div className="bg-white/70 rounded-lg p-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">距离晚餐时间还有2小时</div>
                <div className="text-xs text-gray-600">建议现在来点健康零食补充能量</div>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">膳食纤维已超标！</div>
                <div className="text-xs text-gray-600">今日纤维摄入优秀，有助消化健康</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 推荐算法实现
  const getPersonalizedRecommendations = (count = 10) => {
    const recommendations = [];
    
    // 根据用户历史和偏好生成推荐分数
    for (const recipe of recipes) {
      let score = 0;
      const reasons = [];
      let category = 'discovery';

      // 1. 营养目标匹配
      if (defaultUserHistory?.healthProfile?.healthGoal === 'weight_loss') {
        if (recipe.nutrition.calories < 400) {
          score += 0.3;
          reasons.push('低热量，适合减脂');
        }
        if (recipe.nutrition.protein > 20) {
          score += 0.2;
          reasons.push('高蛋白，增强饱腹感');
        }
        category = 'nutrition_optimized';
      }

      // 2. 历史偏好匹配
      if (defaultUserHistory?.frequentCategories) {
        for (const cat of recipe.category) {
          if (defaultUserHistory.frequentCategories[cat] > 2) {
            score += 0.2;
            reasons.push(`您经常制作${cat}类菜品`);
            category = 'history_based';
            break;
          }
        }
      }

      // 3. 新菜品发现
      if (recipe.isNew) {
        score += 0.3;
        reasons.push('新品上线，抢先体验');
        category = 'discovery';
      }

      // 4. 难度匹配
      if (defaultUserPreferences?.difficulty?.includes(recipe.difficulty)) {
        score += 0.1;
      }

      // 5. 时间偏好
      if (recipe.cookTime <= (defaultUserPreferences?.cookTime || 30)) {
        score += 0.1;
        if (recipe.cookTime <= 15) {
          reasons.push('快手菜，节省时间');
        }
      }

      // 6. 受欢迎程度
      if (recipe.popularity && recipe.popularity > 0.8) {
        score += 0.1;
        reasons.push('热门好评菜品');
      }

      if (score > 0.3) {
        recommendations.push({
          recipe,
          score,
          reasons: reasons.slice(0, 2),
          category
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  };

  const RecipesView = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    const recommendations = getPersonalizedRecommendations(8);
    
    // 按类别分组推荐
    const groupedRecommendations = recommendations.reduce((groups, rec) => {
      if (!groups[rec.category]) {
        groups[rec.category] = [];
      }
      groups[rec.category].push(rec);
      return groups;
    }, {} as Record<string, typeof recommendations>);

    const categoryNames = {
      history_based: '基于您的喜好',
      nutrition_optimized: '营养目标推荐',
      discovery: '新品发现',
      trending: '热门推荐'
    };

    const categoryIcons = {
      history_based: '❤️',
      nutrition_optimized: '🎯',
      discovery: '✨',
      trending: '🔥'
    };

    const difficultyMap = {
      easy: { text: '简单', color: 'text-green-600', bg: 'bg-green-100' },
      medium: { text: '中等', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      hard: { text: '困难', color: 'text-red-600', bg: 'bg-red-100' }
    };

    return (
      <div className="pb-20 p-6 bg-gray-50 min-h-screen">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI菜谱推荐</h1>
            <p className="text-sm text-gray-600 mt-1">为您解决"吃什么"的困扰</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 智能推荐横幅 */}
      <div className="mb-6">
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-2xl border border-green-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white" />
          </div>
                <span className="font-semibold text-gray-800 text-lg">AI智能推荐</span>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                基于您的健康目标、饮食偏好和历史记录，为您精心挑选{recommendations.length}道菜谱
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-white/80 backdrop-blur-sm text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">🎯 营养匹配</span>
                <span className="inline-block bg-white/80 backdrop-blur-sm text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">❤️ 个人喜好</span>
                <span className="inline-block bg-white/80 backdrop-blur-sm text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200">✨ 新品发现</span>
              </div>
          </div>
        </div>
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-3">筛选条件</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeFilter === filter
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? '全部' : 
                   filter === 'breakfast' ? '早餐' :
                   filter === 'lunch' ? '午餐' :
                   filter === 'dinner' ? '晚餐' : '加餐'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 推荐菜谱列表 */}
        <div className="space-y-6">
          {Object.entries(groupedRecommendations).map(([category, recs]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <h2 className="text-lg font-bold text-gray-800">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h2>
                <span className="text-sm text-gray-500">({recs.length}道)</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
                {recs.map(({ recipe, reasons }) => (
                  <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="relative">
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-48 object-cover"
            />
                      {recipe.isNew && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            ✨ 新品
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className={`${difficultyMap[recipe.difficulty].bg} ${difficultyMap[recipe.difficulty].color} text-xs px-2 py-1 rounded-full font-medium`}>
                          {difficultyMap[recipe.difficulty].text}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
                          {recipe.cuisineType && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {recipe.cuisineType}
                            </span>
                          )}
                </div>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm ml-1 font-medium">{recipe.rating}</span>
              </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{recipe.description}</p>

                      {/* 推荐理由 */}
                      {reasons.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {reasons.map((reason, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-200"
                              >
                                💡 {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{recipe.cookTime}分钟</span>
                </div>
                          <div className="text-gray-400">|</div>
                          <div>{recipe.nutrition.calories}千卡</div>
                          <div className="text-gray-400">|</div>
                          <div>{recipe.nutrition.protein}g蛋白质</div>
              </div>
                      </div>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recipe.tags && recipe.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeDetail(true);
                  }}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center"
                >
                          <BookOpen className="w-4 h-4 mr-2" />
                  查看菜谱
                </button>
                <button 
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeDetail(true);
                  }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无推荐菜谱</h3>
            <p className="text-gray-600">请先记录一些饮食数据，让AI了解您的喜好</p>
          </div>
        )}
    </div>
  );
  };

  const CommunityView = () => (
    <div className="pb-20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">健康社区</h1>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-green-700 text-sm font-medium">一键跟吃</span>
        </div>
      </div>

      <div className="space-y-4">
        {kolPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <img src={post.avatar} alt={post.name} className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="font-semibold">{post.name}</div>
                  <div className="text-sm text-gray-500">{post.time}</div>
                </div>
                <button className="text-green-600 text-sm font-medium">+ 关注</button>
              </div>
              
              <h3 className="font-semibold mb-2">{post.title}</h3>
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-3" />
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <div className="flex space-x-4">
                  <span>{post.nutrition.calories}千卡</span>
                  <span>{post.nutrition.protein}g蛋白质</span>
                  <span>{post.nutrition.fiber}g膳食纤维</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gray-500">
                  <button className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">评论</span>
                  </button>
                </div>
                
                {post.isFollowable && (
                  <button 
                    onClick={() => setSelectedKOLPost(post)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-1"
                  >
                    <span>一键跟吃</span>
                    <span className="text-green-200">¥{post.price}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <div className="text-lg font-semibold mb-2">成为健康达人</div>
          <p className="text-gray-600 text-sm mb-4">分享您的健康饮食，影响更多人</p>
          <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
            立即分享
          </button>
        </div>
      </div>
    </div>
  );

  const GamificationView = () => (
    <div className="pb-20">
      <UltraSimpleGamificationPanel className="p-6" />
    </div>
  );

  // 商城页面组件
  const StoreView = () => {
    const filteredPlans = getFilteredPlans();
    const recommendedPlans = getRecommendedPlans(healthProfile);

    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">营养商城</h1>
              <p className="text-purple-100 text-sm">专业饮食计划，个性化健康方案</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Crown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索饮食计划..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-purple-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        <div className="p-6">
          {/* 分类筛选 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">选择目标</h2>
              <Filter className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dietPlanCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : `${category.color} text-gray-700 hover:shadow-md`
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 个性化推荐 */}
          {recommendedPlans.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                <h2 className="text-lg font-semibold">为您推荐</h2>
              </div>
              <div className="grid gap-4">
                {recommendedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200"
                  >
                    <div className="flex gap-4">
                      <img
                        src={plan.coverImage}
                        alt={plan.title}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{plan.title}</h3>
                          {plan.isRecommended && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">推荐</span>
                          )}
                        </div>
                        <p className="text-sm text-purple-600 mb-2">{plan.subtitle}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-gray-600">{plan.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{plan.duration}天</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {plan.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">¥{plan.originalPrice}</span>
                            )}
                            <div className="text-lg font-bold text-purple-600">¥{plan.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDietPlan(plan);
                        setShowPurchaseModal(true);
                      }}
                      className="w-full mt-3 bg-purple-500 text-white py-2 rounded-xl font-medium hover:bg-purple-600 transition-colors"
                    >
                      查看详情
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 所有计划 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {selectedCategory === 'all' ? '全部计划' : dietPlanCategories.find(c => c.id === selectedCategory)?.name}
                <span className="text-sm text-gray-500 ml-2">({filteredPlans.length})</span>
              </h2>
            </div>

            <div className="grid gap-6">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={plan.coverImage}
                      alt={plan.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {plan.isPopular && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">热门</span>
                      )}
                      {plan.isRecommended && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">推荐</span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{plan.title}</h3>
                        <p className="text-sm text-purple-600">{plan.subtitle}</p>
                      </div>
                      <div className="text-right">
                        {plan.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">¥{plan.originalPrice}</span>
                        )}
                        <div className="text-xl font-bold text-purple-600">¥{plan.price}</div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plan.description}</p>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>{plan.rating}</span>
                        <span className="ml-1">({plan.reviewCount})</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{plan.duration}天</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{plan.purchaseCount}人已购买</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {plan.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {plan.trainerInfo && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={plan.trainerInfo.avatar}
                          alt={plan.trainerInfo.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-sm">{plan.trainerInfo.name}</div>
                          <div className="text-xs text-gray-500">{plan.trainerInfo.title}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDietPlan(plan);
                          setShowPurchaseModal(true);
                        }}
                        className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
                      >
                        立即购买
                      </button>
                      <button className="px-4 py-3 border border-purple-500 text-purple-500 rounded-xl hover:bg-purple-50 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlans.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">没有找到相关计划</h3>
                <p className="text-gray-500 text-sm">试试调整搜索关键词或筛选条件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 营养师咨询界面
  const NutritionistView = () => {
    const [activeNutritionistTab, setActiveNutritionistTab] = useState<'consultations' | 'premium_plans'>('consultations');
    
    return (
      <div className="pb-20 p-6 space-y-6">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">专业营养师服务</h1>
          <p className="text-gray-600">获得专业营养师的一对一指导，让健康饮食更科学</p>
        </div>

        {/* 服务类型切换 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveNutritionistTab('consultations')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeNutritionistTab === 'consultations'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            在线咨询
          </button>
          <button
            onClick={() => setActiveNutritionistTab('premium_plans')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeNutritionistTab === 'premium_plans'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            高级计划
          </button>
        </div>

        {/* 在线咨询部分 */}
        {activeNutritionistTab === 'consultations' && (
          <div className="space-y-6">
            {/* 服务特色介绍 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-3">专业营养师一对一咨询</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-700">资质认证</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="text-blue-500" size={20} />
                  <span className="text-gray-700">视频咨询</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="text-purple-500" size={20} />
                  <span className="text-gray-700">实时沟通</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-orange-500" size={20} />
                  <span className="text-gray-700">灵活预约</span>
                </div>
              </div>
            </div>

            {/* 营养师列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">精选营养师</h3>
              {nutritionists.map((nutritionist) => (
                <div key={nutritionist.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={nutritionist.avatar} 
                      alt={nutritionist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-800">{nutritionist.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-sm text-gray-600">{nutritionist.rating}</span>
                          <span className="text-sm text-gray-400">({nutritionist.reviewCount}评价)</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{nutritionist.title}</p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="text-blue-500" size={14} />
                        <span className="text-sm text-gray-600">{nutritionist.experience}年经验</span>
                        <MapPin className="text-gray-400" size={14} />
                        <span className="text-sm text-gray-600">{nutritionist.location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {nutritionist.specialties.slice(0, 3).map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nutritionist.bio}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-2xl font-bold text-green-600">¥{nutritionist.consultationPrice}</span>
                          <span className="text-gray-600">/次</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className={`text-xs ${nutritionist.available ? 'text-green-600' : 'text-orange-600'}`}>
                              {nutritionist.available ? '可预约' : '暂不可约'}
                            </div>
                            {nutritionist.nextAvailableTime && (
                              <div className="text-xs text-gray-500">{nutritionist.nextAvailableTime}</div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedNutritionist(nutritionist);
                              setShowNutritionistDetail(true);
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 高级计划部分 */}
        {activeNutritionistTab === 'premium_plans' && (
          <div className="space-y-6">
            {/* 计划特色介绍 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-3">特定人群定制化营养计划</h3>
              <p className="text-gray-700 mb-4">针对孕妇、糖尿病患者、术后康复等特殊人群，提供专业的长期营养指导方案</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="text-purple-500" size={20} />
                  <span className="text-gray-700">专家制定</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="text-blue-500" size={20} />
                  <span className="text-gray-700">针对性强</span>
                </div>
              </div>
            </div>

            {/* 高级计划列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">精选高级计划</h3>
              {premiumMealPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
                  {plan.isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-xs font-medium">
                        热门
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <img 
                      src={plan.image} 
                      alt={plan.title}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-800">{plan.title}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {plan.targetGroupLabel}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-sm text-gray-600">{plan.rating}</span>
                          <span className="text-sm text-gray-400">({plan.reviewCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="text-gray-400" size={16} />
                          <span className="text-sm text-gray-600">{plan.duration}天</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plan.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-purple-600">¥{plan.price}</span>
                            <span className="text-lg text-gray-400 line-through">¥{plan.originalPrice}</span>
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              {plan.discount}%OFF
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedPremiumPlan(plan);
                            setShowPremiumPlanDetail(true);
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProfileView = () => (
    <div className="pb-20 p-6 bg-gray-50 min-h-screen">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex items-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 backdrop-blur-sm">
            {healthProfile ? healthProfile.name.charAt(0) : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold mb-1">{healthProfile ? healthProfile.name : '健康达人'}</h1>
            <p className="text-white/80 text-sm">已坚持记录 42 天</p>
          </div>
        </div>
        
        {/* 会员徽章区域 */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <MembershipBadge 
              onClick={actions.showCenter}
              className="hover:scale-105 transition-transform"
            />
            <div className="text-xs">
              <div className="text-white/90">当前会员等级</div>
              <div className="font-semibold">{membership?.tier === MembershipTier.FREE ? '免费版' : membership?.tier === MembershipTier.PREMIUM ? '会员版' : membership?.tier === MembershipTier.VIP ? 'VIP版' : '免费版'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">等级 {level}</div>
            <div className="text-lg font-bold">{exp} XP</div>
          </div>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">92.5</div>
          <div className="text-xs text-gray-600">平均营养分</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">{totalMeals}</div>
          <div className="text-xs text-gray-600">记录餐数</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600 mb-1">{streak}</div>
          <div className="text-xs text-gray-600">连续天数</div>
        </div>
      </div>

      {/* 健康档案状态 */}
      {healthProfile && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <User className="w-4 h-4 mr-2 text-green-600" />
              我的健康档案
            </h3>
            <button 
              onClick={() => setShowHealthProfile(true)}
              className="text-green-600 text-sm font-medium hover:text-green-700"
            >
              查看详情
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-gray-800">{healthProfile.height} cm</div>
              <div className="text-gray-600 text-xs">身高</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-gray-800">{healthProfile.weight} kg</div>
              <div className="text-gray-600 text-xs">体重</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
            BMI: {(healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)} • 
            每日目标: {nutritionTargets.calories} 千卡
          </div>
        </div>
      )}

      {/* 功能菜单 */}
      <div className="space-y-3 mb-6">
        {/* VIP会员中心 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={actions.showCenter}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">VIP会员中心</div>
                <div className="text-xs text-gray-500">解锁全部高级功能</div>
              </div>
            </div>
            <div className="flex items-center">
              {membership?.tier && membership?.tier !== MembershipTier.FREE && (
                <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full mr-2">
                  {membership?.tier}
                </div>
              )}
              <span className="text-gray-400">→</span>
            </div>
          </button>
        </div>

        {/* 成就中心 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setActiveTab('gamification')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">成就中心</div>
                <div className="text-xs text-gray-500">查看徽章和连击记录</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mr-2">
                {achievements ? achievements.length : 0} 个成就
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        </div>

        {/* 其他功能 */}
        <div className="bg-white rounded-xl shadow-sm">
          <button 
            onClick={() => healthProfile ? setShowHealthProfile(true) : setShowProfileSetup(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">健康档案</div>
                <div className="text-xs text-gray-500">{healthProfile ? '管理个人健康信息' : '创建健康档案'}</div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">健康目标</div>
                <div className="text-xs text-gray-500">设置和调整营养目标</div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">健康报告</div>
                <div className="text-xs text-gray-500">查看详细营养分析</div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">我的订单</div>
                <div className="text-xs text-gray-500">查看购买历史记录</div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* 升级提示卡片 */}
      {!healthProfile && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white mb-6">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">创建健康档案</h3>
            <p className="text-white/90 text-sm mb-4">填写基本信息，获得个性化营养建议</p>
            <button 
              onClick={() => setShowProfileSetup(true)}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              立即创建档案
            </button>
          </div>
        </div>
      )}

      {(!membership?.tier || membership?.tier === MembershipTier.FREE) && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-center">
            <div className="text-3xl mb-2">👑</div>
            <h3 className="font-bold text-lg mb-2">升级VIP会员</h3>
            <p className="text-white/90 text-sm mb-4">解锁全部AI功能、无限识别和专属特权</p>
            <button 
              onClick={actions.showCenter}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              查看会员特权
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 购买模态框组件
  // 营养计划管理函数
  const getActivePlan = (): UserNutritionPlan | null => {
    return userNutritionPlans.find(plan => plan.status === 'active') || null;
  };

  const switchToNewPlan = (newPlan: DietPlan) => {
    const activePlan = getActivePlan();
    
    if (activePlan) {
      // 如果有活跃计划，暂停当前计划并激活新计划
      const updatedPlans = userNutritionPlans.map(plan => {
        if (plan.status === 'active') {
          return { ...plan, status: 'paused' as const };
        }
        return plan;
      });
      
      // 添加新计划
      const newUserPlan: UserNutritionPlan = {
        id: `user-plan-${Date.now()}`,
        plan: newPlan,
        purchaseDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + newPlan.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentDay: 1,
        totalDays: newPlan.duration,
        status: 'active',
        progress: 0,
        todayRecommendation: {
          breakfast: '根据计划定制',
          lunch: '根据计划定制',
          dinner: '根据计划定制',
          snack: '根据计划定制'
        },
        adherenceRate: 100,
        remainingDays: newPlan.duration
      };
      
      setUserNutritionPlans([...updatedPlans, newUserPlan]);
      return activePlan;
    } else {
      // 如果没有活跃计划，直接添加新计划
      const newUserPlan: UserNutritionPlan = {
        id: `user-plan-${Date.now()}`,
        plan: newPlan,
        purchaseDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + newPlan.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentDay: 1,
        totalDays: newPlan.duration,
        status: 'active',
        progress: 0,
        todayRecommendation: {
          breakfast: '根据计划定制',
          lunch: '根据计划定制',
          dinner: '根据计划定制',
          snack: '根据计划定制'
        },
        adherenceRate: 100,
        remainingDays: newPlan.duration
      };
      
      setUserNutritionPlans([...userNutritionPlans, newUserPlan]);
      return null;
    }
  };

  const PurchaseModal = ({ plan }: { plan: DietPlan }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wechat' | 'alipay' | 'card'>('wechat');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handlePurchase = () => {
      if (!agreedToTerms) {
        alert('请先同意服务条款');
        return;
      }
      
      const activePlan = getActivePlan();
      
      // 如果已有活跃计划，需要用户确认是否替换
      if (activePlan) {
        const confirmed = window.confirm(
          `您当前正在进行"${activePlan.plan.title}"计划（第${activePlan.currentDay}/${activePlan.totalDays}天）。\n\n选择新计划将暂停当前计划，是否确认切换到"${plan.title}"？`
        );
        
        if (!confirmed) {
          return;
        }
      }
      
      // 切换到新计划
      const replacedPlan = switchToNewPlan(plan);
      
      // 显示购买成功信息
      if (replacedPlan) {
        alert(`恭喜！您已成功购买"${plan.title}"！\n\n原计划"${replacedPlan.plan.title}"已暂停，您可以稍后在"我的计划"中恢复。`);
      } else {
        alert(`恭喜！您已成功购买"${plan.title}"，请在"我的计划"中查看详情。`);
      }
      
      setShowPurchaseModal(false);
      setSelectedDietPlan(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">确认购买</h2>
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedDietPlan(null);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto">
            {/* 计划信息 */}
            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <img
                src={plan.coverImage}
                alt={plan.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{plan.title}</h3>
                <p className="text-sm text-gray-600">{plan.subtitle}</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{plan.duration}天</span>
                </div>
              </div>
              <div className="text-right">
                {plan.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">¥{plan.originalPrice}</span>
                )}
                <div className="text-xl font-bold text-purple-600">¥{plan.price}</div>
              </div>
            </div>

            {/* 服务内容 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">您将获得：</h3>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">选择支付方式：</h3>
              <div className="space-y-2">
                {[
                  { id: 'wechat', name: '微信支付', icon: '💚' },
                  { id: 'alipay', name: '支付宝', icon: '💙' },
                  { id: 'card', name: '银行卡', icon: '💳' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                    className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-3 text-xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                    <div className="ml-auto">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedPaymentMethod === method.id
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <Check className="w-3 h-3 text-white mx-auto mt-0.5" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 优惠信息 */}
            {plan.originalPrice && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-600">
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="font-medium text-sm">限时优惠</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  立省 ¥{plan.originalPrice - plan.price}，活动仅剩3天！
                </p>
              </div>
            )}

            {/* 服务条款 */}
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-600">
                  我已阅读并同意<span className="text-purple-600 underline">《服务协议》</span>和<span className="text-purple-600 underline">《隐私政策》</span>
                </span>
              </label>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
            <button
              onClick={handlePurchase}
              disabled={!agreedToTerms}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                agreedToTerms
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              立即支付 ¥{plan.price}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 菜品修正模态框组件
  const FoodCorrectionModal = () => {
    const [newWeight, setNewWeight] = useState<number>(100);
    const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
    const [correctionWeight, setCorrectionWeight] = useState<number>(100);
    
    if (!analysisResults || correctionFoodIndex === -1) return null;
    
    const currentFood = analysisResults.detectedFoods[correctionFoodIndex];
    
    // 过滤食物数据库
    const filteredFoods = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {correctionType === 'weight' ? '调整重量' : '更换菜品'}
              </h2>
              <button 
                onClick={() => setShowFoodCorrectionModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                ✕
              </button>
            </div>
            <p className="text-sm opacity-90 mt-2">
              当前食物：{currentFood.name} ({currentFood.weight}g)
            </p>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {correctionType === 'weight' ? (
              /* 重量调整界面 */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">{currentFood.name.includes('鸡') ? '🍗' : currentFood.name.includes('米饭') ? '🍚' : '🍽️'}</div>
                  <div className="text-lg font-semibold text-gray-800">{currentFood.name}</div>
                  <div className="text-sm text-gray-600">当前重量: {currentFood.weight}g</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新重量 (克)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-semibold"
                      min="1"
                      max="1000"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      g
                    </div>
                  </div>
                </div>
                
                {/* 预设重量按钮 */}
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 150, 200, 250, 300].map(weight => (
                    <button
                      key={weight}
                      onClick={() => setNewWeight(weight)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        newWeight === weight 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {weight}g
                    </button>
                  ))}
                </div>
                
                {/* 营养预览 */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 mb-2">调整后营养成分</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>热量: {Math.round(currentFood.nutrition.calories * newWeight / currentFood.weight)}千卡</div>
                    <div>蛋白质: {Math.round(currentFood.nutrition.protein * newWeight / currentFood.weight * 10) / 10}g</div>
                    <div>碳水: {Math.round(currentFood.nutrition.carbs * newWeight / currentFood.weight * 10) / 10}g</div>
                    <div>脂肪: {Math.round(currentFood.nutrition.fat * newWeight / currentFood.weight * 10) / 10}g</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFoodCorrectionModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleWeightCorrection(newWeight)}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                  >
                    确认调整
                  </button>
                </div>
              </div>
            ) : (
              /* 菜品替换界面 */
              <div className="space-y-6">
                {/* 搜索框 */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索菜品名称或类别..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                {/* 菜品列表 */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredFoods.map(food => (
                    <div 
                      key={food.id}
                      onClick={() => setSelectedFoodId(food.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedFoodId === food.id 
                          ? 'bg-orange-50 border-2 border-orange-500' 
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{food.name}</div>
                          <div className="text-xs text-gray-600">{food.category} • {food.calories}千卡/100g</div>
                          <div className="text-xs text-gray-500 mt-1">{food.description}</div>
                        </div>
                        <div className="text-xl">
                          {food.name.includes('鸡') ? '🍗' : 
                           food.name.includes('米饭') ? '🍚' : 
                           food.name.includes('豆腐') ? '🧀' : 
                           food.name.includes('鱼') ? '🐟' : '🍽️'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 重量设置 */}
                {selectedFoodId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      设置重量 (克)
                    </label>
                    <input
                      type="number"
                      value={correctionWeight}
                      onChange={(e) => setCorrectionWeight(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg font-semibold"
                      min="1"
                      max="1000"
                    />
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowFoodCorrectionModal(false)}
                      className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (selectedFoodId) {
                          const selectedFood = foodDatabase.find(f => f.id === selectedFoodId);
                          if (selectedFood) {
                            handleFoodReplacement(selectedFood, correctionWeight);
                          }
                        }
                      }}
                      disabled={!selectedFoodId}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        selectedFoodId 
                          ? 'bg-orange-500 text-white hover:bg-orange-600' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      确认替换
                    </button>
                  </div>
                  
                  {/* 重新拍照选项 */}
                  <button
                    onClick={() => {
                      setShowFoodCorrectionModal(false);
                      setShowCamera(true);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Camera size={20} />
                    <span>重新拍照识别</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'recipes', name: '菜谱', icon: BookOpen },
    { id: 'store', name: '商城', icon: ShoppingCart },
    { id: 'nutritionist', name: '营养师', icon: Stethoscope },
    { id: 'community', name: '社区', icon: Users },
    { id: 'profile', name: '我的', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'recipes' && <RecipesView />}
      {activeTab === 'store' && <StoreView />}
      {activeTab === 'nutritionist' && <NutritionistView />}
      {activeTab === 'gamification' && <GamificationView />}
      {activeTab === 'community' && <CommunityView />}
      {activeTab === 'profile' && <ProfileView />}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showCamera && <CameraView />}
      {showAIAnalysis && <AIAnalysisModal />}
      {showMealSelection && <MealSelectionModal />}
      {showNutritionReport && <NutritionReportModal />}
      {aiChatOpen && <AIChat />}
      {selectedKOLPost && <KOLPostModal post={selectedKOLPost} />}
      {showCommonFoods && <CommonFoodsModal />}
      {selectedRecipe && showRecipeDetail && <RecipeDetailModal recipe={selectedRecipe} />}
      {showProfileSetup && <HealthProfileSetup />}
      {showHealthProfile && <HealthProfileView />}
      {showPurchaseModal && selectedDietPlan && <PurchaseModal plan={selectedDietPlan} />}
      {showFoodCorrectionModal && <FoodCorrectionModal />}
      {showNutritionistDetail && selectedNutritionist && (
        <NutritionistDetailModal 
          nutritionist={selectedNutritionist} 
          onClose={() => {
            setShowNutritionistDetail(false);
            setSelectedNutritionist(null);
          }}
        />
      )}
      {showBookingModal && selectedNutritionist && (
        <BookingModal 
          nutritionist={selectedNutritionist} 
          onClose={() => setShowBookingModal(false)}
        />
      )}
      {showConsultationChat && currentConsultation && (
        <ConsultationChatModal 
          consultation={currentConsultation} 
          onClose={() => setShowConsultationChat(false)}
        />
      )}
      {showPremiumPlanDetail && selectedPremiumPlan && (
        <PremiumPlanDetailModal 
          plan={selectedPremiumPlan} 
          onClose={() => setShowPremiumPlanDetail(false)}
        />
      )}

      {/* 会员系统模态框 */}
      <UpgradeModal 
        isOpen={ui.showUpgradeModal} 
        onClose={actions.hideUpgrade} 
      />
      
      <MembershipCenter 
        isOpen={ui.showMembershipModal} 
        onClose={actions.hideCenter} 
      />
    </div>
    );
  };

  // 营养师详情弹窗
  const NutritionistDetailModal = ({ nutritionist, onClose }: { nutritionist: Nutritionist; onClose: () => void }) => {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* 头部信息 */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={nutritionist.avatar} 
                  alt={nutritionist.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{nutritionist.name}</h2>
                  <p className="text-gray-600">{nutritionist.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm font-medium">{nutritionist.rating}</span>
                      <span className="text-sm text-gray-500">({nutritionist.reviewCount}评价)</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors z-10 relative"
              >
                <XCircle size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* 专业信息 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">专业背景</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="text-blue-500" size={16} />
                    <span className="text-gray-700">{nutritionist.education}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="text-green-500" size={16} />
                    <span className="text-gray-700">{nutritionist.experience}年专业经验</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-purple-500" size={16} />
                    <span className="text-gray-700">{nutritionist.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">认证资质</h3>
                <div className="flex flex-wrap gap-2">
                  {nutritionist.certifications.map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">专业领域</h3>
                <div className="flex flex-wrap gap-2">
                  {nutritionist.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">个人简介</h3>
                <p className="text-gray-700 leading-relaxed">{nutritionist.bio}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">语言能力</h3>
                <div className="flex space-x-2">
                  {nutritionist.languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* 预约信息 */}
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-green-800">咨询预约</h3>
                  <span className="text-2xl font-bold text-green-600">¥{nutritionist.consultationPrice}</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-green-600" size={16} />
                    <span className="text-green-700">45分钟专业咨询</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="text-green-600" size={16} />
                    <span className="text-green-700">支持视频/语音通话</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="text-green-600" size={16} />
                    <span className="text-green-700">7天内免费追问</span>
                  </div>
                </div>
                
                <div className="text-center">
                  {nutritionist.available ? (
                    <div className="space-y-2">
                      <p className="text-green-700 text-sm">最近可约时间：{nutritionist.nextAvailableTime}</p>
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                      >
                        立即预约咨询
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-orange-600 text-sm">暂时无法预约，最近可约：{nutritionist.nextAvailableTime}</p>
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-400 text-white rounded-xl font-medium hover:bg-gray-500 transition-colors"
                      >
                        暂时无法预约
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 预约弹窗
  const BookingModal = ({ nutritionist, onClose }: { nutritionist: Nutritionist; onClose: () => void }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState<'video' | 'voice' | 'chat'>('video');
    const [consultationNote, setConsultationNote] = useState('');

    const availableDates = [
      { date: '2024-01-15', label: '今天' },
      { date: '2024-01-16', label: '明天' },
      { date: '2024-01-17', label: '后天' },
      { date: '2024-01-18', label: '1月18日' },
    ];

    const availableTimes = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'
    ];

    const handleBooking = () => {
      // 处理预约逻辑
      alert('预约成功！我们将在24小时内确认您的预约。');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">预约咨询</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 营养师信息 */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={nutritionist.avatar} 
                  alt={nutritionist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold">{nutritionist.name}</h3>
                  <p className="text-sm text-gray-600">{nutritionist.title}</p>
                </div>
              </div>

              {/* 选择日期 */}
              <div>
                <h3 className="text-lg font-bold mb-3">选择日期</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.date}
                      onClick={() => setSelectedDate(date.date)}
                      className={`p-3 rounded-xl border transition-all ${
                        selectedDate === date.date
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 选择时间 */}
              <div>
                <h3 className="text-lg font-bold mb-3">选择时间</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        selectedTime === time
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 咨询方式 */}
              <div>
                <h3 className="text-lg font-bold mb-3">咨询方式</h3>
                <div className="space-y-2">
                  {[
                    { type: 'video' as const, label: '视频通话', icon: Video, desc: '面对面交流，效果最佳' },
                    { type: 'voice' as const, label: '语音通话', icon: Phone, desc: '语音沟通，方便快捷' },
                    { type: 'chat' as const, label: '文字咨询', icon: MessageSquare, desc: '文字交流，随时回看' }
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setConsultationType(option.type)}
                      className={`w-full p-4 rounded-xl border transition-all flex items-center space-x-3 ${
                        consultationType === option.type
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <option.icon 
                        size={20} 
                        className={consultationType === option.type ? 'text-green-600' : 'text-gray-400'} 
                      />
                      <div className="text-left">
                        <div className={`font-medium ${consultationType === option.type ? 'text-green-700' : 'text-gray-700'}`}>
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 咨询说明 */}
              <div>
                <h3 className="text-lg font-bold mb-3">咨询说明</h3>
                <textarea
                  value={consultationNote}
                  onChange={(e) => setConsultationNote(e.target.value)}
                  placeholder="请简单描述您的健康状况、饮食习惯或想要咨询的问题，帮助营养师更好地为您服务"
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24"
                />
              </div>

              {/* 费用信息 */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">咨询费用</span>
                  <span className="text-2xl font-bold text-blue-600">¥{nutritionist.consultationPrice}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">包含45分钟专业咨询 + 7天内免费追问</p>
              </div>

              {/* 预约按钮 */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  selectedDate && selectedTime
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认预约 (¥{nutritionist.consultationPrice})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 咨询聊天弹窗
  const ConsultationChatModal = ({ consultation, onClose }: { consultation: ConsultationSession; onClose: () => void }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ConsultationMessage[]>([
      {
        id: '1',
        senderId: consultation.nutritionist.id,
        senderType: 'nutritionist',
        content: '您好！我是' + consultation.nutritionist.name + '，很高兴为您提供营养咨询服务。请告诉我您的具体情况。',
        timestamp: '2024-01-15 14:00:00',
        type: 'text'
      }
    ]);

    const sendMessage = () => {
      if (!message.trim()) return;
      
      const newMessage: ConsultationMessage = {
        id: Date.now().toString(),
        senderId: 'user',
        senderType: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl h-[90vh] flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src={consultation.nutritionist.avatar} 
                alt={consultation.nutritionist.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold">{consultation.nutritionist.name}</h3>
                <p className="text-sm text-green-600">在线咨询中</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle size={20} className="text-gray-400" />
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.senderType === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderType === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="输入您的问题..."
                className="flex-1 p-3 border border-gray-200 rounded-xl"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 高级计划详情弹窗
  const PremiumPlanDetailModal = ({ plan, onClose }: { plan: PremiumMealPlan; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'nutritionist'>('overview');

    const handlePurchase = () => {
      alert(`成功购买${plan.title}！您可以在"我的"页面查看计划详情。`);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* 头部 */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{plan.title}</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {plan.targetGroupLabel}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{plan.description}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="font-medium">{plan.rating}</span>
                    <span className="text-gray-500">({plan.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-gray-600">{plan.duration}天</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            {/* 标签切换 */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {[
                { id: 'overview', label: '计划概览' },
                { id: 'meals', label: '示例食谱' },
                { id: 'nutritionist', label: '专家介绍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <img 
                    src={plan.image} 
                    alt={plan.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3">计划特色</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3">包含内容</h3>
                    <div className="space-y-2">
                      {plan.included.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="text-purple-500" size={16} />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3">预期效果</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Target className="text-blue-500" size={16} />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.contraindications && (
                    <div className="bg-yellow-50 p-4 rounded-xl">
                      <h3 className="text-lg font-bold mb-2 text-yellow-800">注意事项</h3>
                      <div className="space-y-1">
                        {plan.contraindications.map((item, index) => (
                          <p key={index} className="text-yellow-700 text-sm">• {item}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="space-y-6">
                  {Object.entries(plan.sampleMeals).map(([mealType, meals]) => (
                    <div key={mealType}>
                      <h3 className="text-lg font-bold mb-3 capitalize">
                        {mealType === 'breakfast' ? '早餐' : 
                         mealType === 'lunch' ? '午餐' : 
                         mealType === 'dinner' ? '晚餐' : '加餐'}
                      </h3>
                      <div className="space-y-2">
                        {meals.map((meal, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                            <Utensils className="text-purple-500" size={16} />
                            <span className="text-gray-700">{meal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'nutritionist' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <img 
                      src={plan.nutritionist.avatar} 
                      alt={plan.nutritionist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold">{plan.nutritionist.name}</h3>
                      <p className="text-gray-600">{plan.nutritionist.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-sm">{plan.nutritionist.rating}</span>
                        <span className="text-sm text-gray-500">({plan.nutritionist.reviewCount}评价)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3">专业背景</h3>
                    <p className="text-gray-700 leading-relaxed">{plan.nutritionist.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3">专业领域</h3>
                    <div className="flex flex-wrap gap-2">
                      {plan.nutritionist.specialties.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 购买区域 */}
            <div className="mt-8 p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-purple-600">¥{plan.price}</span>
                    <span className="text-xl text-gray-400 line-through">¥{plan.originalPrice}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                      {plan.discount}%OFF
                    </span>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">{plan.duration}天专业营养指导</p>
                </div>
              </div>
              
              <button
                onClick={handlePurchase}
                className="w-full py-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
              >
                立即购买
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default App;