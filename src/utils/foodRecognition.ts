import { useFoodMapStore } from '../stores/foodMapStore';

// 食物关键词映射到地图点位
export const foodKeywordMap: Record<string, { mapId: string; spotId: string; keywords: string[] }> = {
  // 中华美食大地图
  'beijing_roast_duck': {
    mapId: 'china_regional',
    spotId: 'beijing_roast_duck',
    keywords: ['烤鸭', '北京烤鸭', '片鸭', '全聚德', '便宜坊', 'roast duck', 'peking duck']
  },
  'sichuan_hotpot': {
    mapId: 'china_regional',
    spotId: 'sichuan_hotpot',
    keywords: ['火锅', '川锅', '四川火锅', '重庆火锅', '麻辣火锅', 'hotpot', 'sichuan', '麻辣烫']
  },
  'guangdong_dimsum': {
    mapId: 'china_regional',
    spotId: 'guangdong_dimsum',
    keywords: ['点心', '粤式茶点', '虾饺', '烧卖', '叉烧包', '流沙包', 'dimsum', 'dim sum', '早茶']
  },
  'xian_biang_noodles': {
    mapId: 'china_regional',
    spotId: 'xian_biang_noodles',
    keywords: ['biangbiang面', 'biang面', '陕西面', '西安面', '裤带面', '宽面条']
  },

  // 世界美食探索
  'italian_pasta': {
    mapId: 'world_cuisine',
    spotId: 'italian_pasta',
    keywords: ['意大利面', '通心粉', '面条', 'pasta', 'spaghetti', 'linguine', 'penne', '番茄面']
  },
  'japanese_sushi': {
    mapId: 'world_cuisine',
    spotId: 'japanese_sushi',
    keywords: ['寿司', '刺身', '生鱼片', 'sushi', 'sashimi', '握寿司', '卷寿司', 'maki']
  },
  'french_cuisine': {
    mapId: 'world_cuisine',
    spotId: 'french_cuisine',
    keywords: ['法式', '法国菜', '鹅肝', '牛排', 'french', 'foie gras', '红酒炖牛肉', '法式甜点']
  },

  // 营养食材宝典
  'quinoa': {
    mapId: 'healthy_ingredients',
    spotId: 'quinoa',
    keywords: ['藜麦', 'quinoa', '南美藜', '超级食物']
  },
  'avocado': {
    mapId: 'healthy_ingredients',
    spotId: 'avocado',
    keywords: ['牛油果', '鳄梨', 'avocado', '律师果']
  }
};

// 食物识别函数
export const recognizeFoodFromText = (text: string): Array<{ mapId: string; spotId: string }> => {
  const normalizedText = text.toLowerCase().trim();
  const detectedFoods: Array<{ mapId: string; spotId: string }> = [];
  
  Object.values(foodKeywordMap).forEach(food => {
    const isMatch = food.keywords.some(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );
    
    if (isMatch) {
      detectedFoods.push({ mapId: food.mapId, spotId: food.spotId });
    }
  });
  
  return detectedFoods;
};

// 根据食物描述自动发现美食
export const autoDiscoverFromMeal = (mealDescription: string, mealRecordId?: string): string[] => {
  const detectedFoods = recognizeFoodFromText(mealDescription);
  const discoveredSpots: string[] = [];
  
  detectedFoods.forEach(({ mapId, spotId }) => {
    const foodMapStore = useFoodMapStore.getState();
    
    // 检查是否已经发现过
    if (!foodMapStore.isSpotDiscovered(mapId, spotId)) {
      const success = foodMapStore.discoverFood(mapId, spotId, mealRecordId);
      if (success) {
        discoveredSpots.push(spotId);
      }
    }
  });
  
  return discoveredSpots;
};

// 推荐相关美食
export const suggestRelatedFoods = (currentFood: string): Array<{ name: string; mapId: string; spotId: string }> => {
  const suggestions: Array<{ name: string; mapId: string; spotId: string }> = [];
  const normalizedFood = currentFood.toLowerCase();
  
  // 基于已识别的食物推荐相关美食
  if (normalizedFood.includes('中') || normalizedFood.includes('chinese') || 
      normalizedFood.includes('川') || normalizedFood.includes('粤')) {
    suggestions.push(
      { name: '北京烤鸭', mapId: 'china_regional', spotId: 'beijing_roast_duck' },
      { name: '四川火锅', mapId: 'china_regional', spotId: 'sichuan_hotpot' },
      { name: '广式点心', mapId: 'china_regional', spotId: 'guangdong_dimsum' }
    );
  }
  
  if (normalizedFood.includes('意') || normalizedFood.includes('italian') || 
      normalizedFood.includes('pasta')) {
    suggestions.push(
      { name: '意大利面食', mapId: 'world_cuisine', spotId: 'italian_pasta' },
      { name: '法式大餐', mapId: 'world_cuisine', spotId: 'french_cuisine' }
    );
  }
  
  if (normalizedFood.includes('日') || normalizedFood.includes('japanese') || 
      normalizedFood.includes('sushi')) {
    suggestions.push(
      { name: '日式寿司', mapId: 'world_cuisine', spotId: 'japanese_sushi' }
    );
  }
  
  if (normalizedFood.includes('健康') || normalizedFood.includes('营养') || 
      normalizedFood.includes('superfood')) {
    suggestions.push(
      { name: '藜麦', mapId: 'healthy_ingredients', spotId: 'quinoa' },
      { name: '牛油果', mapId: 'healthy_ingredients', spotId: 'avocado' }
    );
  }
  
  return suggestions;
};

// 分析食物营养成分并推荐相关营养主题美食
export const analyzeNutritionAndSuggest = (nutritionData: any): Array<{ name: string; mapId: string; spotId: string; reason: string }> => {
  const suggestions: Array<{ name: string; mapId: string; spotId: string; reason: string }> = [];
  
  // 基于营养成分推荐
  if (nutritionData?.protein && nutritionData.protein > 20) {
    suggestions.push({
      name: '藜麦',
      mapId: 'healthy_ingredients',
      spotId: 'quinoa',
      reason: '高蛋白食物推荐'
    });
  }
  
  if (nutritionData?.healthy_fats && nutritionData.healthy_fats > 10) {
    suggestions.push({
      name: '牛油果',
      mapId: 'healthy_ingredients',
      spotId: 'avocado',
      reason: '健康脂肪推荐'
    });
  }
  
  return suggestions;
};

// 获取用户美食探索建议
export const getUserExplorationSuggestions = (): Array<{ 
  title: string; 
  description: string; 
  mapId: string; 
  spotId: string; 
  difficulty: string 
}> => {
  const foodMapStore = useFoodMapStore.getState();
  const suggestions: Array<{ title: string; description: string; mapId: string; spotId: string; difficulty: string }> = [];
  
  // 获取未发现的美食
  foodMapStore.availableMaps.forEach(map => {
    map.spots.forEach(spot => {
      if (!foodMapStore.isSpotDiscovered(map.id, spot.id)) {
        suggestions.push({
          title: spot.name,
          description: spot.description,
          mapId: map.id,
          spotId: spot.id,
          difficulty: spot.difficulty
        });
      }
    });
  });
  
  // 按难度排序，优先推荐简单的
  const difficultyOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
  suggestions.sort((a, b) => {
    const aDiff = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 5;
    const bDiff = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 5;
    return aDiff - bDiff;
  });
  
  return suggestions.slice(0, 5); // 返回前5个建议
};
