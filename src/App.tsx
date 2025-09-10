import React, { useState } from 'react';
import { Camera, Home, BookOpen, Users, User, MessageCircle, TrendingUp, Target, Award, ShoppingCart, Heart, Star, Clock, Zap, Check, BarChart3, Plus, Utensils, Coffee, Sandwich, Apple, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showCamera, setShowCamera] = useState(false);
  const [showNutritionReport, setShowNutritionReport] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedKOLPost, setSelectedKOLPost] = useState<KOLPost | null>(null);
  
  // 新增状态：拍照后的餐次选择
  const [showMealSelection, setShowMealSelection] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
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

  // 菜谱数据
  const recipes: Recipe[] = [
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
        {
          stepNumber: 1,
          description: '虾仁洗净去虾线，用料酒和淀粉腌制10分钟',
          time: 10
        },
        {
          stepNumber: 2,
          description: '西兰花洗净切成小朵，大蒜切片',
          time: 3
        },
        {
          stepNumber: 3,
          description: '锅中烧水，加少许盐，西兰花焯水1分钟后捞出',
          time: 2
        },
        {
          stepNumber: 4,
          description: '热锅下油，下蒜片爆香，再下虾仁炒至变色',
          time: 3
        },
        {
          stepNumber: 5,
          description: '加入西兰花翻炒，调味即可出锅',
          time: 2
        }
      ],
      tips: [
        '虾仁要提前腌制，口感更嫩滑',
        '西兰花焯水时间不宜过长，保持脆嫩',
        '可加少许蚝油提鲜'
      ],
      kitPrice: 28,
      readyMealPrice: 36,
      category: ['晚餐', '减脂'],
      tags: ['高蛋白', '低脂', '快手菜']
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
        {
          stepNumber: 1,
          description: '鸡胸肉用盐和黑胡椒腌制，煎至两面金黄，切片',
          time: 8
        },
        {
          stepNumber: 2,
          description: '各种蔬菜洗净切好，摆盘',
          time: 5
        },
        {
          stepNumber: 3,
          description: '调制沙拉汁：橄榄油、柠檬汁、盐、胡椒混合',
          time: 2
        },
        {
          stepNumber: 4,
          description: '将鸡胸肉片放在蔬菜上，淋上沙拉汁即可',
          time: 1
        }
      ],
      tips: [
        '鸡胸肉不要煎过头，保持嫩滑',
        '蔬菜尽量选择不同颜色，营养更丰富',
        '沙拉汁可以根据个人喜好调整'
      ],
      kitPrice: 24,
      readyMealPrice: 32,
      category: ['午餐', '减脂'],
      tags: ['低卡', '高蛋白', '轻食']
    }
  ];

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
                    onClick={() => setFormData({...formData, activityLevel: activity.value as any})}
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
                    onClick={() => setFormData({...formData, healthGoal: goal.value as any})}
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
                      onClick={() => setFormData({...formData, specialNutritionFocus: focus.value as any})}
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

    const goalLabels = {
      'weight_loss': '减脂',
      'muscle_gain': '增肌',
      'maintain_health': '维持健康',
      'special_nutrition': '特定营养关注'
    };

    const activityLabels = {
      'light': '轻度运动',
      'moderate': '中度运动',
      'heavy': '重度运动'
    };

    const specialNutritionLabels = {
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
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={() => setShowCamera(false)}
            className="text-white p-2 bg-black/30 rounded-full"
          >
            ✕
          </button>
          <div className="text-white text-center">
            <div className="text-lg font-semibold">AI营养识别</div>
            <div className="text-sm opacity-80">对准食物拍照，AI将精准识别营养成分</div>
          </div>
          <div></div>
        </div>
        
        <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="w-80 h-80 border-2 border-green-400 border-dashed rounded-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-4 text-green-400" />
              <div className="text-lg">将食物放在框内</div>
              <div className="text-sm opacity-80 mt-1">确保光线充足，食物清晰可见</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button 
            onClick={() => {
              // 模拟拍照并保存图片
              setCapturedPhoto('mock-photo-data');
              // 根据当前时间自动设置餐次
              setSelectedMealType(detectMealType());
              // 关闭拍照界面，打开餐次选择界面
              setShowCamera(false);
              setShowMealSelection(true);
            }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg"
          >
            <Camera size={24} />
          </button>
        </div>
      </div>
    </div>
  );

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
      // 如果来自拍照流程，返回模拟的分析结果
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">营养分析报告</h2>
            <button 
              onClick={() => {
                setShowNutritionReport(false);
                setSelectedMealForReport(null);
                // 如果来自拍照流程，清理拍照相关状态
                if (isFromPhotoCapture) {
                  setCapturedPhoto(null);
                }
              }}
              className="text-gray-500 p-2"
            >
              ✕
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl font-bold text-green-600">{mealData.averageScore}</div>
            </div>
            <h3 className="text-lg font-semibold mb-1">{mealData.title}</h3>
            <p className="text-gray-600 text-sm">{mealData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{mealData.totalCalories}</div>
              <div className="text-sm text-gray-600">千卡</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{mealData.totalProtein}g</div>
              <div className="text-sm text-gray-600">蛋白质</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{mealData.totalCarbs}g</div>
              <div className="text-sm text-gray-600">碳水化合物</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{mealData.totalFat}g</div>
              <div className="text-sm text-gray-600">脂肪</div>
            </div>
          </div>

          {/* 根据餐次显示相关食物 */}
          {isFromPhotoCapture ? (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">AI识别结果</h4>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
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
            </div>
          </div>

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
              }
              setShowNutritionReport(false);
              setSelectedMealForReport(null);
            }}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold"
          >
            {isFromPhotoCapture ? '确认并记录餐食' : '确认记录'}
          </button>
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
                  onClick={() => setActiveTab(tab.key as any)}
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

  const AIChat = () => (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="bg-green-500 text-white p-4 pb-6">
          <div className="flex items-center">
            <button 
              onClick={() => setAiChatOpen(false)}
              className="mr-3 p-1"
            >
              ←
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center mr-3">
                🦝
              </div>
              <div>
                <div className="font-semibold">AI营养师卡卡</div>
                <div className="text-sm opacity-90">您的专属健康管家</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
              🦝
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
              <p className="text-sm">主人您好！我发现您今天蛋白质摄入很不错呢，已经完成了74%的目标！👏</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
              🦝
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
              <p className="text-sm">不过我注意到您的膳食纤维摄入稍微不足，晚餐建议加点绿叶蔬菜或者来个苹果当夜宵怎么样？🍎</p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-green-500 text-white p-3 rounded-2xl rounded-tr-sm max-w-xs">
              <p className="text-sm">好的，谢谢提醒！有什么推荐的晚餐吗？</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
              🦝
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-xs">
              <p className="text-sm">基于您的口味偏好和今日营养缺口，我推荐"蒜蓉西兰花炒虾仁"！高蛋白低脂，还能补充膳食纤维～要不要看看菜谱？</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="和卡卡聊聊您的饮食想法..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button className="text-green-500 font-semibold text-sm ml-2">发送</button>
          </div>
        </div>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">食刻</h1>
            <p className="text-green-100 text-sm">精准营养解码，预见更健康的你</p>
          </div>
          <button 
            onClick={() => setAiChatOpen(true)}
            className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center"
          >
            🦝
          </button>
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
            onClick={() => setShowCamera(true)}
            className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <Camera size={20} />
            <span className="font-semibold text-sm">拍照记录</span>
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className="bg-blue-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <BookOpen size={20} />
            <span className="font-semibold text-sm">AI推荐</span>
          </button>
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

  const RecipesView = () => (
    <div className="pb-20 p-6">
      <h1 className="text-2xl font-bold mb-6">AI菜谱推荐</h1>
      
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border border-green-200">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-800">为您推荐</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            基于您今日营养缺口，推荐高纤维低脂晚餐
          </p>
          <div className="text-xs text-gray-600">
            还需蛋白质31g • 膳食纤维12g
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm">{recipe.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{recipe.cookTime}分钟</span>
                </div>
                <div>{recipe.nutrition.calories}千卡 | {recipe.nutrition.protein}g蛋白质</div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeDetail(true);
                  }}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold"
                >
                  查看菜谱
                </button>
                <button 
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeDetail(true);
                  }}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  const ProfileView = () => (
    <div className="pb-20 p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {healthProfile ? healthProfile.name.charAt(0) : 'U'}
        </div>
        <h1 className="text-xl font-bold mb-2">{healthProfile ? healthProfile.name : '健康达人'}</h1>
        <p className="text-gray-600 text-sm">已坚持记录 42 天</p>
      </div>

      {/* 显示健康档案状态 */}
      {healthProfile && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">我的健康档案</h3>
            <button 
              onClick={() => setShowHealthProfile(true)}
              className="text-green-600 text-sm font-medium"
            >
              查看详情
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/70 rounded-lg p-2 text-center">
              <div className="font-semibold text-gray-800">{healthProfile.height} cm</div>
              <div className="text-gray-600">身高</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2 text-center">
              <div className="font-semibold text-gray-800">{healthProfile.weight} kg</div>
              <div className="text-gray-600">体重</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            BMI: {(healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)} • 
            每日目标: {nutritionTargets.calories} 千卡
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">92.5</div>
          <div className="text-sm text-gray-600">平均营养分</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">127</div>
          <div className="text-sm text-gray-600">记录餐数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">15</div>
          <div className="text-sm text-gray-600">成就徽章</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium">健康档案</span>
            </div>
            <button 
              onClick={() => healthProfile ? setShowHealthProfile(true) : setShowProfileSetup(true)}
              className="text-sm text-gray-500"
            >
              {healthProfile ? '查看详情' : '创建档案'} →
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">健康目标</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium">健康报告</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="font-medium">成就中心</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-orange-600 mr-3" />
              <span className="font-medium">我的订单</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>
      </div>

      {!healthProfile && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">创建健康档案</h3>
            <p className="text-gray-600 text-sm mb-4">填写基本信息，获得个性化营养建议</p>
            <button 
              onClick={() => setShowProfileSetup(true)}
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold"
            >
              立即创建档案
            </button>
          </div>
        </div>
      )}

      {healthProfile && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">升级至专业版</h3>
            <p className="text-gray-600 text-sm mb-4">解锁全部AI功能和无限次识别</p>
            <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold">
              立即升级 ¥19.9/月
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'recipes', name: '菜谱', icon: BookOpen },
    { id: 'community', name: '社区', icon: Users },
    { id: 'profile', name: '我的', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'recipes' && <RecipesView />}
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
      {showMealSelection && <MealSelectionModal />}
      {showNutritionReport && <NutritionReportModal />}
      {aiChatOpen && <AIChat />}
      {selectedKOLPost && <KOLPostModal post={selectedKOLPost} />}
      {showCommonFoods && <CommonFoodsModal />}
      {selectedRecipe && showRecipeDetail && <RecipeDetailModal recipe={selectedRecipe} />}
      {showProfileSetup && <HealthProfileSetup />}
      {showHealthProfile && <HealthProfileView />}
    </div>
  );
};

export default App;