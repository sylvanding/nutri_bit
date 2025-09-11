import { create } from 'zustand';
import { FoodMap, FoodMapSpot, UserFoodDiscovery, MapProgress, FoodMapType, SpotDifficulty } from '../types/gamification';

interface FoodMapState {
  // 用户发现记录
  userDiscoveries: UserFoodDiscovery[];
  // 可用的地图
  availableMaps: FoodMap[];
  // 地图进度
  mapProgress: Record<string, MapProgress>;
  // 通知
  notifications: Array<{
    id: string;
    message: string;
    timestamp: number;
    type: 'discovery' | 'map_complete' | 'reward';
  }>;
}

interface FoodMapActions {
  // 发现新美食
  discoverFood: (mapId: string, spotId: string, mealRecordId?: string) => boolean;
  // 获取地图进度
  getMapProgress: (mapId: string) => MapProgress;
  // 获取用户在指定地图的发现列表
  getUserDiscoveriesForMap: (mapId: string) => UserFoodDiscovery[];
  // 检查是否已发现某个美食
  isSpotDiscovered: (mapId: string, spotId: string) => boolean;
  // 清除通知
  clearNotifications: () => void;
  // 获取统计信息
  getStats: () => {
    totalDiscoveries: number;
    completedMaps: number;
    totalMaps: number;
    discoveryRate: number;
    favoriteMapType: string;
  };
}

type FoodMapStore = FoodMapState & FoodMapActions;

// 示例地图数据
const sampleMaps: FoodMap[] = [
  {
    id: 'china_regional',
    title: '中华美食大地图',
    description: '探索中国各地的特色美食，从东北的锅包肉到广东的早茶',
    type: FoodMapType.REGIONAL,
    totalSpots: 20,
    isActive: true,
    backgroundImage: '/images/china-map.jpg',
    spots: [
      {
        id: 'beijing_roast_duck',
        mapId: 'china_regional',
        name: '北京烤鸭',
        description: '北京最著名的传统美食，皮脆肉嫩，蘸酱食用',
        category: '京菜',
        difficulty: SpotDifficulty.COMMON,
        coordinates: { x: 60, y: 25 },
        nutritionHighlight: '高蛋白，富含维生素B',
        culturalInfo: '起源于明朝，是宫廷菜的代表',
      },
      {
        id: 'sichuan_hotpot',
        mapId: 'china_regional',
        name: '四川火锅',
        description: '麻辣鲜香的四川特色火锅，以花椒和辣椒调味',
        category: '川菜',
        difficulty: SpotDifficulty.UNCOMMON,
        coordinates: { x: 40, y: 55 },
        nutritionHighlight: '促进血液循环，富含维生素C',
        culturalInfo: '重庆火锅文化的重要组成部分',
      },
      {
        id: 'guangdong_dimsum',
        mapId: 'china_regional',
        name: '广式点心',
        description: '精致的粤式茶点，包括虾饺、烧卖、叉烧包等',
        category: '粤菜',
        difficulty: SpotDifficulty.RARE,
        coordinates: { x: 45, y: 80 },
        nutritionHighlight: '营养均衡，制作精细',
        culturalInfo: '粤菜文化的精髓，注重食材新鲜',
      },
      {
        id: 'xian_biang_noodles',
        mapId: 'china_regional',
        name: '西安Biángbiáng面',
        description: '陕西特色宽面条，配以丰富的调料和蔬菜',
        category: '陕菜',
        difficulty: SpotDifficulty.LEGENDARY,
        coordinates: { x: 45, y: 40 },
        nutritionHighlight: '碳水化合物丰富，B族维生素含量高',
        culturalInfo: '历史悠久的关中美食，体现了西北文化',
      }
    ]
  },
  {
    id: 'world_cuisine',
    title: '世界美食探索',
    description: '品尝来自世界各地的经典美食',
    type: FoodMapType.CUISINE,
    totalSpots: 15,
    isActive: true,
    backgroundImage: '/images/world-map.jpg',
    spots: [
      {
        id: 'italian_pasta',
        mapId: 'world_cuisine',
        name: '意大利面食',
        description: '正宗的意大利面配各种酱汁',
        category: '意大利菜',
        difficulty: SpotDifficulty.COMMON,
        coordinates: { x: 52, y: 35 },
        nutritionHighlight: '碳水化合物和蛋白质均衡',
        culturalInfo: '意大利饮食文化的核心',
      },
      {
        id: 'japanese_sushi',
        mapId: 'world_cuisine',
        name: '日式寿司',
        description: '新鲜鱼类配醋饭的日本传统美食',
        category: '日本菜',
        difficulty: SpotDifficulty.RARE,
        coordinates: { x: 85, y: 40 },
        nutritionHighlight: '富含优质蛋白质和不饱和脂肪酸',
        culturalInfo: '日本料理的艺术体现',
      },
      {
        id: 'french_cuisine',
        mapId: 'world_cuisine',
        name: '法式大餐',
        description: '精致的法国料理，注重烹饪技法和摆盘',
        category: '法国菜',
        difficulty: SpotDifficulty.LEGENDARY,
        coordinates: { x: 48, y: 28 },
        nutritionHighlight: '营养丰富，制作精细',
        culturalInfo: '世界顶级烹饪艺术的代表',
      }
    ]
  },
  {
    id: 'healthy_ingredients',
    title: '营养食材宝典',
    description: '发现和了解各种健康食材的营养价值',
    type: FoodMapType.INGREDIENT,
    totalSpots: 25,
    isActive: true,
    backgroundImage: '/images/ingredients-map.jpg',
    spots: [
      {
        id: 'quinoa',
        mapId: 'healthy_ingredients',
        name: '藜麦',
        description: '南美洲的超级食物，含有完整蛋白质',
        category: '谷物',
        difficulty: SpotDifficulty.UNCOMMON,
        coordinates: { x: 25, y: 70 },
        nutritionHighlight: '完整蛋白质，低升糖指数',
        culturalInfo: '印加文明的主食，被称为谷物之母',
      },
      {
        id: 'avocado',
        mapId: 'healthy_ingredients',
        name: '牛油果',
        description: '富含健康脂肪的水果',
        category: '水果',
        difficulty: SpotDifficulty.COMMON,
        coordinates: { x: 20, y: 60 },
        nutritionHighlight: '单不饱和脂肪酸，维生素K',
        culturalInfo: '阿兹特克文明珍视的食物',
      }
    ]
  }
];

export const useFoodMapStore = create<FoodMapStore>((set, get) => ({
  // 初始状态
  userDiscoveries: [],
  availableMaps: sampleMaps,
  mapProgress: {},
  notifications: [],

  // 发现新美食
  discoverFood: (mapId: string, spotId: string, mealRecordId?: string) => {
    const state = get();
    
    // 检查是否已经发现过
    const existingDiscovery = state.userDiscoveries.find(
      d => d.mapId === mapId && d.spotId === spotId
    );
    
    if (existingDiscovery) {
      return false; // 已经发现过了
    }
    
    // 查找对应的地图和点位
    const map = state.availableMaps.find(m => m.id === mapId);
    const spot = map?.spots.find(s => s.id === spotId);
    
    if (!map || !spot) {
      return false; // 地图或点位不存在
    }
    
    // 创建新的发现记录
    const newDiscovery: UserFoodDiscovery = {
      id: `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user', // 在实际应用中应该是真实的用户ID
      mapId,
      spotId,
      spot,
      discoveryMethod: mealRecordId ? 'meal_record' : 'manual',
      mealRecordId,
      discoveredAt: new Date()
    };
    
    // 更新状态
    set((prevState) => {
      const updatedDiscoveries = [...prevState.userDiscoveries, newDiscovery];
      
      // 更新地图进度
      const mapProgress = get().getMapProgress(mapId);
      const updatedMapProgress = {
        ...prevState.mapProgress,
        [mapId]: {
          ...mapProgress,
          discoveredSpots: [...mapProgress.discoveredSpots, spotId],
          completionPercentage: ((mapProgress.discoveredSpots.length + 1) / map.totalSpots) * 100
        }
      };
      
      // 添加通知
      const notifications = [...prevState.notifications];
      notifications.unshift({
        id: `discovery_${Date.now()}`,
        message: `🎉 发现新美食: ${spot.name}！`,
        timestamp: Date.now(),
        type: 'discovery'
      });
      
      // 检查地图是否完成
      if (mapProgress.discoveredSpots.length + 1 === map.totalSpots) {
        notifications.unshift({
          id: `map_complete_${Date.now()}`,
          message: `🏆 恭喜完成地图: ${map.title}！`,
          timestamp: Date.now(),
          type: 'map_complete'
        });
      }
      
      // 保持通知数量在10个以内
      if (notifications.length > 10) {
        notifications.splice(10);
      }
      
      return {
        userDiscoveries: updatedDiscoveries,
        mapProgress: updatedMapProgress,
        notifications
      };
    });
    
    return true; // 发现成功
  },

  // 获取地图进度
  getMapProgress: (mapId: string) => {
    const state = get();
    
    if (state.mapProgress[mapId]) {
      return state.mapProgress[mapId];
    }
    
    // 计算进度
    const userDiscoveriesForMap = state.userDiscoveries
      .filter(d => d.mapId === mapId)
      .map(d => d.spotId);
    
    const map = state.availableMaps.find(m => m.id === mapId);
    const totalSpots = map?.totalSpots || 0;
    
    const progress: MapProgress = {
      mapId,
      discoveredSpots: userDiscoveriesForMap,
      totalSpots,
      completionPercentage: totalSpots > 0 ? (userDiscoveriesForMap.length / totalSpots) * 100 : 0,
      rewardsEarned: []
    };
    
    return progress;
  },

  // 获取用户在指定地图的发现列表
  getUserDiscoveriesForMap: (mapId: string) => {
    const state = get();
    return state.userDiscoveries.filter(d => d.mapId === mapId);
  },

  // 检查是否已发现某个美食
  isSpotDiscovered: (mapId: string, spotId: string) => {
    const state = get();
    return state.userDiscoveries.some(d => d.mapId === mapId && d.spotId === spotId);
  },

  // 清除通知
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // 获取统计信息
  getStats: () => {
    const state = get();
    const totalDiscoveries = state.userDiscoveries.length;
    const totalMaps = state.availableMaps.length;
    const completedMaps = state.availableMaps.filter(map => {
      const progress = get().getMapProgress(map.id);
      return progress.completionPercentage >= 100;
    }).length;
    
    const discoveryRate = totalMaps > 0 ? (completedMaps / totalMaps) * 100 : 0;
    
    // 计算最喜欢的地图类型
    const mapTypeCount = state.userDiscoveries.reduce((acc, discovery) => {
      const map = state.availableMaps.find(m => m.id === discovery.mapId);
      if (map) {
        acc[map.type] = (acc[map.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteMapType = Object.entries(mapTypeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'regional';
    
    return {
      totalDiscoveries,
      completedMaps,
      totalMaps,
      discoveryRate,
      favoriteMapType
    };
  }
}));
