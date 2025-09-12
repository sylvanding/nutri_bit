/**
 * 扩展菜谱数据 - 丰富的菜品选择
 * 包含不同菜系、难度、营养特点的菜谱
 */

import { Recipe } from '../utils/recipeRecommendation';

export const extendedRecipes: Recipe[] = [
  // 中式菜谱
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

  // 新增菜谱
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
    name: '蒸蛋羹配海苔',
    image: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '嫩滑补钙，老少皆宜',
    cookTime: 8,
    rating: 4.7,
    nutrition: { calories: 180, protein: 15, carbs: 3, fat: 12, sodium: 320, fiber: 1 },
    difficulty: 'easy',
    ingredients: [
      { name: '鸡蛋', amount: '3个', category: 'main' },
      { name: '温水', amount: '150ml', category: 'main' },
      { name: '海苔丝', amount: '适量', category: 'garnish' },
      { name: '生抽', amount: '1/2勺', category: 'seasoning' },
      { name: '香油', amount: '几滴', category: 'seasoning' },
      { name: '盐', amount: '少许', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '鸡蛋打散，加入温水和盐调匀', time: 2 },
      { stepNumber: 2, description: '过筛去除泡沫，倒入碗中', time: 1 },
      { stepNumber: 3, description: '保鲜膜覆盖，扎几个小孔，蒸6分钟', time: 6 },
      { stepNumber: 4, description: '出锅后撒海苔丝，淋生抽和香油', time: 1 }
    ],
    tips: ['水和蛋液比例1:1，口感最嫩', '一定要过筛，蒸蛋才会光滑', '可加虾仁或肉沫增加营养'],
    kitPrice: 8,
    readyMealPrice: 15,
    category: ['早餐', '养胃'],
    tags: ['简单', '嫩滑', '营养'],
    cuisineType: '中式',
    popularity: 0.88,
    seasonality: ['spring', 'summer', 'autumn', 'winter'],
    mealTime: ['breakfast', 'snack']
  },

  {
    id: 'recipe-5',
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
    id: 'recipe-6',
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
  },

  {
    id: 'recipe-7',
    name: '麻婆豆腐',
    image: 'https://images.pexels.com/photos/4194023/pexels-photo-4194023.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '川菜经典，麻辣鲜香',
    cookTime: 18,
    rating: 4.6,
    nutrition: { calories: 280, protein: 16, carbs: 12, fat: 18, sodium: 820, fiber: 3 },
    difficulty: 'medium',
    ingredients: [
      { name: '嫩豆腐', amount: '400g', category: 'main' },
      { name: '猪肉末', amount: '100g', category: 'main' },
      { name: '豆瓣酱', amount: '2勺', category: 'seasoning' },
      { name: '花椒粉', amount: '1勺', category: 'seasoning' },
      { name: '生抽', amount: '1勺', category: 'seasoning' },
      { name: '料酒', amount: '1勺', category: 'seasoning' },
      { name: '葱花', amount: '适量', category: 'garnish' },
      { name: '水淀粉', amount: '2勺', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '豆腐切块，开水焯一下去豆腥味', time: 3 },
      { stepNumber: 2, description: '热锅下油，爆炒肉末至变色', time: 3 },
      { stepNumber: 3, description: '下豆瓣酱炒出红油', time: 2 },
      { stepNumber: 4, description: '加水煮开，下豆腐煮5分钟', time: 5 },
      { stepNumber: 5, description: '用水淀粉勾芡，撒花椒粉和葱花', time: 3 }
    ],
    tips: ['豆腐要先焯水去腥', '豆瓣酱要炒出红油才香', '勾芡要适量，不宜过稠'],
    kitPrice: 12,
    readyMealPrice: 18,
    category: ['午餐', '晚餐'],
    tags: ['川菜', '麻辣', '经典'],
    cuisineType: '中式',
    popularity: 0.89,
    seasonality: ['autumn', 'winter'],
    mealTime: ['lunch', 'dinner']
  },

  {
    id: 'recipe-8',
    name: '蔬菜蛋白煎饼',
    image: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '快手早餐，营养全面',
    cookTime: 15,
    rating: 4.4,
    nutrition: { calories: 340, protein: 22, carbs: 28, fat: 14, sodium: 420, fiber: 5 },
    difficulty: 'easy',
    ingredients: [
      { name: '鸡蛋', amount: '2个', category: 'main' },
      { name: '面粉', amount: '50g', category: 'main' },
      { name: '胡萝卜丝', amount: '80g', category: 'main' },
      { name: '豆芽菜', amount: '100g', category: 'main' },
      { name: '韭菜', amount: '50g', category: 'main' },
      { name: '盐', amount: '适量', category: 'seasoning' },
      { name: '胡椒粉', amount: '适量', category: 'seasoning' },
      { name: '橄榄油', amount: '适量', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '所有蔬菜洗净切丝', time: 5 },
      { stepNumber: 2, description: '鸡蛋打散，加入面粉调成面糊', time: 2 },
      { stepNumber: 3, description: '将蔬菜丝加入面糊，调味', time: 2 },
      { stepNumber: 4, description: '平底锅刷油，倒入面糊摊成饼', time: 3 },
      { stepNumber: 5, description: '中小火煎至两面金黄即可', time: 3 }
    ],
    tips: ['面糊不要调太稠', '火候要控制好，避免外焦内生', '可搭配酸奶或豆浆'],
    kitPrice: 8,
    readyMealPrice: 12,
    category: ['早餐'],
    tags: ['快手', '营养', '饱腹'],
    cuisineType: '中式',
    popularity: 0.82,
    seasonality: ['spring', 'summer', 'autumn', 'winter'],
    mealTime: ['breakfast']
  },

  {
    id: 'recipe-9',
    name: '意式蘑菇烩饭',
    image: 'https://images.pexels.com/photos/1640778/pexels-photo-1640778.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '奶香浓郁，口感丰富',
    cookTime: 30,
    rating: 4.7,
    nutrition: { calories: 480, protein: 16, carbs: 58, fat: 18, sodium: 520, fiber: 4 },
    difficulty: 'hard',
    ingredients: [
      { name: '意大利米', amount: '150g', category: 'main' },
      { name: '混合蘑菇', amount: '200g', category: 'main' },
      { name: '洋葱', amount: '1/2个', category: 'main' },
      { name: '白葡萄酒', amount: '50ml', category: 'seasoning' },
      { name: '蔬菜高汤', amount: '500ml', category: 'main' },
      { name: '帕马森芝士', amount: '30g', category: 'main' },
      { name: '黄油', amount: '20g', category: 'seasoning' },
      { name: '橄榄油', amount: '2勺', category: 'seasoning' },
      { name: '盐和黑胡椒', amount: '适量', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '蘑菇切片，洋葱切丁', time: 5 },
      { stepNumber: 2, description: '热锅下橄榄油，炒香洋葱', time: 3 },
      { stepNumber: 3, description: '加入米粒炒2分钟至半透明', time: 2 },
      { stepNumber: 4, description: '倒入白酒，炒至酒精挥发', time: 2 },
      { stepNumber: 5, description: '分次加入热高汤，边搅拌边煮18分钟', time: 18 },
      { stepNumber: 6, description: '加入蘑菇和芝士，拌匀调味', time: 3 }
    ],
    tips: ['米粒要炒至半透明', '高汤要保持热度分次加入', '最后加芝士增加奶香'],
    kitPrice: 38,
    readyMealPrice: 48,
    category: ['午餐', '晚餐'],
    tags: ['意式', '奶香', '精致'],
    cuisineType: '意式',
    popularity: 0.85,
    seasonality: ['autumn', 'winter'],
    mealTime: ['lunch', 'dinner']
  },

  {
    id: 'recipe-10',
    name: '韩式泡菜豆腐汤',
    image: 'https://images.pexels.com/photos/5419336/pexels-photo-5419336.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '酸辣开胃，暖胃解腻',
    cookTime: 20,
    rating: 4.5,
    nutrition: { calories: 220, protein: 14, carbs: 18, fat: 8, sodium: 980, fiber: 6 },
    difficulty: 'easy',
    ingredients: [
      { name: '韩式泡菜', amount: '200g', category: 'main' },
      { name: '嫩豆腐', amount: '300g', category: 'main' },
      { name: '猪肉片', amount: '100g', category: 'main' },
      { name: '韩式辣椒酱', amount: '1勺', category: 'seasoning' },
      { name: '蒜泥', amount: '1勺', category: 'seasoning' },
      { name: '香油', amount: '1勺', category: 'seasoning' },
      { name: '葱花', amount: '适量', category: 'garnish' },
      { name: '高汤', amount: '400ml', category: 'main' }
    ],
    steps: [
      { stepNumber: 1, description: '泡菜切段，豆腐切块', time: 3 },
      { stepNumber: 2, description: '热锅下香油，爆香蒜泥', time: 2 },
      { stepNumber: 3, description: '下肉片炒至变色', time: 3 },
      { stepNumber: 4, description: '加入泡菜和辣椒酱炒香', time: 3 },
      { stepNumber: 5, description: '倒入高汤煮开，下豆腐煮8分钟', time: 8 },
      { stepNumber: 6, description: '撒葱花即可出锅', time: 1 }
    ],
    tips: ['泡菜要充分炒香', '豆腐下锅要轻拌避免破碎', '可加年糕增加口感'],
    kitPrice: 15,
    readyMealPrice: 22,
    category: ['晚餐', '汤品'],
    tags: ['韩式', '酸辣', '暖胃'],
    cuisineType: '韩式',
    popularity: 0.83,
    seasonality: ['autumn', 'winter'],
    mealTime: ['lunch', 'dinner']
  },

  {
    id: 'recipe-11',
    name: '燕麦香蕉杯',
    image: 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '免煮早餐，营养满分',
    cookTime: 5,
    rating: 4.3,
    nutrition: { calories: 380, protein: 12, carbs: 58, fat: 8, sodium: 120, fiber: 9 },
    difficulty: 'easy',
    ingredients: [
      { name: '燕麦片', amount: '50g', category: 'main' },
      { name: '香蕉', amount: '1根', category: 'main' },
      { name: '希腊酸奶', amount: '150g', category: 'main' },
      { name: '蜂蜜', amount: '1勺', category: 'seasoning' },
      { name: '核桃碎', amount: '20g', category: 'garnish' },
      { name: '蓝莓', amount: '50g', category: 'garnish' },
      { name: '肉桂粉', amount: '少许', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '香蕉切片，核桃压碎', time: 2 },
      { stepNumber: 2, description: '燕麦片用少量温水泡软', time: 2 },
      { stepNumber: 3, description: '杯中依次放入燕麦、酸奶、香蕉', time: 1 },
      { stepNumber: 4, description: '顶部撒核桃碎和蓝莓', time: 1 },
      { stepNumber: 5, description: '淋蜂蜜，撒肉桂粉即可', time: 1 }
    ],
    tips: ['可提前一晚准备，冷藏过夜', '水果可以自由搭配', '坚果增加饱腹感'],
    kitPrice: 12,
    readyMealPrice: 18,
    category: ['早餐'],
    tags: ['免煮', '快手', '高纤维'],
    cuisineType: '西式',
    isNew: true,
    popularity: 0.79,
    seasonality: ['spring', 'summer', 'autumn', 'winter'],
    mealTime: ['breakfast', 'snack']
  },

  {
    id: 'recipe-12',
    name: '黑椒牛柳意面',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '西餐经典，嫩滑牛肉配弹牙意面',
    cookTime: 25,
    rating: 4.8,
    nutrition: { calories: 620, protein: 35, carbs: 45, fat: 24, sodium: 580, fiber: 3 },
    difficulty: 'medium',
    ingredients: [
      { name: '牛柳', amount: '200g', category: 'main' },
      { name: '意大利面', amount: '120g', category: 'main' },
      { name: '洋葱', amount: '1/2个', category: 'main' },
      { name: '彩椒', amount: '1个', category: 'main' },
      { name: '黑椒汁', amount: '3勺', category: 'seasoning' },
      { name: '红酒', amount: '2勺', category: 'seasoning' },
      { name: '黄油', amount: '15g', category: 'seasoning' },
      { name: '盐和黑胡椒', amount: '适量', category: 'seasoning' }
    ],
    steps: [
      { stepNumber: 1, description: '意面煮至8分熟，捞起备用', time: 8 },
      { stepNumber: 2, description: '牛柳切条，用盐和胡椒腌制', time: 3 },
      { stepNumber: 3, description: '洋葱、彩椒切丝', time: 3 },
      { stepNumber: 4, description: '热锅下黄油，煎牛柳至7分熟', time: 4 },
      { stepNumber: 5, description: '加入蔬菜丝炒软', time: 3 },
      { stepNumber: 6, description: '倒入红酒和黑椒汁，下意面拌匀', time: 4 }
    ],
    tips: ['牛肉不要煎过头，保持嫩滑', '意面煮至8分熟最佳', '黑椒汁可自制或买现成的'],
    kitPrice: 35,
    readyMealPrice: 45,
    category: ['午餐', '晚餐'],
    tags: ['西餐', '嫩滑', '香浓'],
    cuisineType: '意式',
    popularity: 0.87,
    seasonality: ['spring', 'summer', 'autumn', 'winter'],
    mealTime: ['lunch', 'dinner']
  }
];

// 默认用户偏好（用于演示）
export const defaultUserPreferences = {
  cuisineTypes: ['中式', '西式'],
  difficulty: ['easy', 'medium'] as ('easy' | 'medium' | 'hard')[],
  cookTime: 30,
  dietaryRestrictions: [],
  favoriteIngredients: ['鸡胸肉', '虾仁', '鸡蛋', '西兰花'],
  dislikedIngredients: ['香菜', '芹菜'],
  favoriteCategories: ['减脂', '快手菜'],
  nutritionFocus: ['high_protein', 'low_fat'] as ('high_protein' | 'low_fat' | 'low_carb' | 'high_fiber')[]
};

// 默认用户历史（用于演示）
export const defaultUserHistory = {
  recentRecipes: ['recipe-1', 'recipe-2'],
  ratedRecipes: { 'recipe-1': 5, 'recipe-2': 4 },
  frequentCategories: { '减脂': 5, '快手菜': 3, '高蛋白': 4 },
  nutritionGoals: {
    dailyCalories: 1800,
    proteinTarget: 120,
    carbsTarget: 180,
    fatTarget: 60
  },
  healthProfile: {
    healthGoal: 'weight_loss' as const,
    activityLevel: 'moderate' as const
  }
};
