/**
 * 菜谱推荐算法 - 智能推荐系统
 * 基于用户历史记录、营养目标和偏好进行个性化推荐
 */

export interface UserPreferences {
  cuisineTypes: string[]; // 菜系偏好：中式、西式、日式等
  difficulty: ('easy' | 'medium' | 'hard')[]; // 制作难度偏好
  cookTime: number; // 最大制作时间偏偏好（分钟）
  dietaryRestrictions: string[]; // 饮食限制：素食、低盐、无糖等
  favoriteIngredients: string[]; // 喜爱的食材
  dislikedIngredients: string[]; // 不喜欢的食材
  favoriteCategories: string[]; // 偏爱的菜品类别
  nutritionFocus: ('high_protein' | 'low_fat' | 'low_carb' | 'high_fiber')[]; // 营养偏好
}

export interface UserHistory {
  recentRecipes: string[]; // 最近尝试的菜谱ID
  ratedRecipes: { [recipeId: string]: number }; // 评分过的菜谱 (1-5分)
  frequentCategories: { [category: string]: number }; // 常做的菜品类别统计
  nutritionGoals: {
    dailyCalories: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  };
  healthProfile: {
    healthGoal: 'weight_loss' | 'muscle_gain' | 'maintain_health' | 'special_nutrition';
    activityLevel: 'light' | 'moderate' | 'heavy';
  };
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  cookTime: number;
  rating: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    fiber: number;
  };
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

export interface RecommendationScore {
  recipeId: string;
  score: number;
  reasons: string[]; // 推荐理由
  category: 'history_based' | 'nutrition_optimized' | 'discovery' | 'trending';
}

/**
 * 核心推荐算法类
 */
export class RecipeRecommendationEngine {
  private recipes: Recipe[];
  private userHistory: UserHistory;
  private userPreferences: UserPreferences;

  constructor(recipes: Recipe[], userHistory: UserHistory, userPreferences: UserPreferences) {
    this.recipes = recipes;
    this.userHistory = userHistory;
    this.userPreferences = userPreferences;
  }

  /**
   * 获取个性化推荐
   */
  getRecommendations(count: number = 10): RecommendationScore[] {
    const scores: RecommendationScore[] = [];

    for (const recipe of this.recipes) {
      const score = this.calculateRecipeScore(recipe);
      if (score.score > 0.3) { // 只推荐评分超过0.3的菜谱
        scores.push(score);
      }
    }

    // 按分数排序，返回top N
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * 计算菜谱推荐分数
   */
  private calculateRecipeScore(recipe: Recipe): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];
    let category: RecommendationScore['category'] = 'discovery';

    // 1. 历史偏好匹配 (权重: 0.25)
    const historyScore = this.calculateHistoryScore(recipe);
    score += historyScore.score * 0.25;
    if (historyScore.score > 0.6) {
      reasons.push(...historyScore.reasons);
      category = 'history_based';
    }

    // 2. 营养目标匹配 (权重: 0.30)
    const nutritionScore = this.calculateNutritionScore(recipe);
    score += nutritionScore.score * 0.30;
    if (nutritionScore.score > 0.7) {
      reasons.push(...nutritionScore.reasons);
      if (category === 'discovery') category = 'nutrition_optimized';
    }

    // 3. 用户偏好匹配 (权重: 0.20)
    const preferenceScore = this.calculatePreferenceScore(recipe);
    score += preferenceScore.score * 0.20;
    reasons.push(...preferenceScore.reasons);

    // 4. 新菜品发现奖励 (权重: 0.15)
    const discoveryScore = this.calculateDiscoveryScore(recipe);
    score += discoveryScore.score * 0.15;
    if (discoveryScore.score > 0.8) {
      reasons.push(...discoveryScore.reasons);
      category = 'discovery';
    }

    // 5. 热门程度和季节性 (权重: 0.10)
    const trendingScore = this.calculateTrendingScore(recipe);
    score += trendingScore.score * 0.10;
    if (trendingScore.score > 0.8) {
      reasons.push(...trendingScore.reasons);
      if (category === 'discovery') category = 'trending';
    }

    return {
      recipeId: recipe.id,
      score: Math.min(score, 1), // 确保分数不超过1
      reasons: reasons.slice(0, 3), // 最多显示3个推荐理由
      category
    };
  }

  /**
   * 计算历史偏好分数
   */
  private calculateHistoryScore(recipe: Recipe): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 检查是否最近尝试过类似菜谱
    if (this.userHistory.recentRecipes.includes(recipe.id)) {
      return { score: 0, reasons: ['最近已经尝试过了'] }; // 避免重复推荐
    }

    // 分析用户评分过的菜谱的相似度
    const ratedRecipes = Object.keys(this.userHistory.ratedRecipes);
    if (ratedRecipes.length > 0) {
      let similaritySum = 0;
      let highRatedSimilarity = 0;

      for (const ratedId of ratedRecipes) {
        const ratedRecipe = this.recipes.find(r => r.id === ratedId);
        const rating = this.userHistory.ratedRecipes[ratedId];
        
        if (ratedRecipe) {
          const similarity = this.calculateRecipeSimilarity(recipe, ratedRecipe);
          similaritySum += similarity;
          
          if (rating >= 4) { // 高分菜谱的相似度加权
            highRatedSimilarity += similarity * (rating / 5);
          }
        }
      }

      const avgSimilarity = similaritySum / ratedRecipes.length;
      score += avgSimilarity * 0.6 + highRatedSimilarity * 0.4;

      if (highRatedSimilarity > 0.7) {
        reasons.push('与您喜欢的菜谱风格相似');
      }
    }

    // 分析常做菜品类别
    for (const category of recipe.category) {
      const frequency = this.userHistory.frequentCategories[category] || 0;
      if (frequency > 3) {
        score += 0.3;
        reasons.push(`您经常制作${category}类菜品`);
        break;
      }
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算营养目标匹配分数
   */
  private calculateNutritionScore(recipe: Recipe): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const { healthGoal } = this.userHistory.healthProfile;
    const { nutrition } = recipe;

    // 根据健康目标调整评分
    switch (healthGoal) {
      case 'weight_loss':
        if (nutrition.calories < 400) {
          score += 0.4;
          reasons.push('低热量，适合减脂');
        }
        if (nutrition.protein > 20) {
          score += 0.3;
          reasons.push('高蛋白，增强饱腹感');
        }
        if (nutrition.fat < 15) {
          score += 0.3;
          reasons.push('低脂肪，健康选择');
        }
        break;

      case 'muscle_gain':
        if (nutrition.protein > 25) {
          score += 0.5;
          reasons.push('高蛋白，助力增肌');
        }
        if (nutrition.calories > 400) {
          score += 0.3;
          reasons.push('充足热量，支持训练');
        }
        if (nutrition.carbs > 30) {
          score += 0.2;
          reasons.push('碳水充足，快速恢复');
        }
        break;

      case 'maintain_health':
        const balanced = this.isNutritionBalanced(nutrition);
        if (balanced) {
          score += 0.6;
          reasons.push('营养均衡，健康维护');
        }
        if (nutrition.fiber > 5) {
          score += 0.4;
          reasons.push('富含膳食纤维');
        }
        break;

      case 'special_nutrition':
        if (nutrition.sodium < 300) {
          score += 0.4;
          reasons.push('低钠配方，特殊营养关怀');
        }
        if (nutrition.fiber > 6) {
          score += 0.6;
          reasons.push('高纤维，促进消化');
        }
        break;
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算用户偏好匹配分数
   */
  private calculatePreferenceScore(recipe: Recipe): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 制作难度偏好
    if (this.userPreferences.difficulty.includes(recipe.difficulty)) {
      score += 0.3;
      const difficultyMap = { easy: '简单', medium: '中等', hard: '有挑战' };
      reasons.push(`${difficultyMap[recipe.difficulty]}难度，符合您的偏好`);
    }

    // 制作时间偏好
    if (recipe.cookTime <= this.userPreferences.cookTime) {
      score += 0.2;
      if (recipe.cookTime <= 15) {
        reasons.push('快手菜，节省时间');
      }
    }

    // 菜系类型偏好
    if (recipe.cuisineType && this.userPreferences.cuisineTypes.includes(recipe.cuisineType)) {
      score += 0.3;
      reasons.push(`${recipe.cuisineType}口味，您的最爱`);
    }

    // 食材偏好检查
    let ingredientScore = 0;
    let hasDisliked = false;

    for (const ingredient of recipe.ingredients) {
      if (this.userPreferences.favoriteIngredients.some(fav => 
        ingredient.name.includes(fav) || fav.includes(ingredient.name)
      )) {
        ingredientScore += 0.1;
      }
      
      if (this.userPreferences.dislikedIngredients.some(disliked => 
        ingredient.name.includes(disliked) || disliked.includes(ingredient.name)
      )) {
        hasDisliked = true;
        break;
      }
    }

    if (hasDisliked) {
      score *= 0.3; // 包含不喜欢的食材，大幅降低分数
    } else {
      score += Math.min(ingredientScore, 0.2);
      if (ingredientScore > 0.1) {
        reasons.push('包含您喜爱的食材');
      }
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算新菜品发现分数
   */
  private calculateDiscoveryScore(recipe: Recipe): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 新菜品奖励
    if (recipe.isNew) {
      score += 0.5;
      reasons.push('新品上线，抢先体验');
    }

    // 未尝试过的菜系奖励
    if (recipe.cuisineType && !this.hasTriedCuisine(recipe.cuisineType)) {
      score += 0.4;
      reasons.push(`探索新口味：${recipe.cuisineType}`);
    }

    // 未尝试过的食材奖励
    const newIngredients = this.getNewIngredients(recipe);
    if (newIngredients.length > 0) {
      score += Math.min(newIngredients.length * 0.1, 0.3);
      reasons.push(`尝试新食材：${newIngredients.slice(0, 2).join('、')}`);
    }

    // 营养素平衡奖励（鼓励尝试营养更全面的菜品）
    if (this.isNutritionBalanced(recipe.nutrition)) {
      score += 0.2;
      reasons.push('营养搭配均衡');
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * 计算热门和季节性分数
   */
  private calculateTrendingScore(recipe: Recipe): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 受欢迎程度
    if (recipe.popularity && recipe.popularity > 0.8) {
      score += 0.5;
      reasons.push('热门好评菜品');
    }

    // 季节性匹配
    const currentSeason = this.getCurrentSeason();
    if (recipe.seasonality && recipe.seasonality.includes(currentSeason)) {
      score += 0.3;
      reasons.push('当季时令推荐');
    }

    // 用餐时间匹配
    const currentMealTime = this.getCurrentMealTime();
    if (recipe.mealTime && recipe.mealTime.includes(currentMealTime)) {
      score += 0.2;
      reasons.push(`适合${this.getMealTimeName(currentMealTime)}`);
    }

    // 高评分奖励
    if (recipe.rating >= 4.5) {
      score += 0.3;
      reasons.push('高分好评');
    }

    return { score: Math.min(score, 1), reasons };
  }

  // 辅助方法
  private calculateRecipeSimilarity(recipe1: Recipe, recipe2: Recipe): number {
    let similarity = 0;

    // 类别相似度
    const commonCategories = recipe1.category.filter(cat => recipe2.category.includes(cat));
    similarity += (commonCategories.length / Math.max(recipe1.category.length, recipe2.category.length)) * 0.4;

    // 标签相似度
    const commonTags = recipe1.tags.filter(tag => recipe2.tags.includes(tag));
    similarity += (commonTags.length / Math.max(recipe1.tags.length, recipe2.tags.length)) * 0.3;

    // 营养相似度
    const nutritionSimilarity = this.calculateNutritionSimilarity(recipe1.nutrition, recipe2.nutrition);
    similarity += nutritionSimilarity * 0.3;

    return similarity;
  }

  private calculateNutritionSimilarity(nutrition1: Recipe['nutrition'], nutrition2: Recipe['nutrition']): number {
    const fields = ['calories', 'protein', 'carbs', 'fat'] as const;
    let similarity = 0;

    for (const field of fields) {
      const diff = Math.abs(nutrition1[field] - nutrition2[field]);
      const max = Math.max(nutrition1[field], nutrition2[field]);
      if (max > 0) {
        similarity += (1 - diff / max) * 0.25; // 每个字段占25%权重
      }
    }

    return similarity;
  }

  private isNutritionBalanced(nutrition: Recipe['nutrition']): boolean {
    const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
    if (totalMacros === 0) return false;

    const proteinRatio = nutrition.protein / totalMacros;
    const carbsRatio = nutrition.carbs / totalMacros;
    const fatRatio = nutrition.fat / totalMacros;

    // 检查是否在合理的营养素比例范围内
    return proteinRatio >= 0.15 && proteinRatio <= 0.35 &&
           carbsRatio >= 0.35 && carbsRatio <= 0.65 &&
           fatRatio >= 0.15 && fatRatio <= 0.35;
  }

  private hasTriedCuisine(cuisineType: string): boolean {
    return this.userHistory.recentRecipes.some(recipeId => {
      const recipe = this.recipes.find(r => r.id === recipeId);
      return recipe?.cuisineType === cuisineType;
    });
  }

  private getNewIngredients(recipe: Recipe): string[] {
    // 模拟用户历史食材记录，实际应该从用户数据中获取
    const triedIngredients = ['鸡胸肉', '西兰花', '鸡蛋', '牛奶', '燕麦', '苹果'];
    return recipe.ingredients
      .filter(ingredient => !triedIngredients.some(tried => 
        ingredient.name.includes(tried) || tried.includes(ingredient.name)
      ))
      .map(ingredient => ingredient.name);
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private getCurrentMealTime(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'breakfast';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'snack';
  }

  private getMealTimeName(mealTime: string): string {
    const names = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐'
    };
    return names[mealTime as keyof typeof names] || '用餐';
  }
}

/**
 * 便捷的推荐函数
 */
export function getPersonalizedRecommendations(
  recipes: Recipe[],
  userHistory: UserHistory,
  userPreferences: UserPreferences,
  count: number = 10
): RecommendationScore[] {
  const engine = new RecipeRecommendationEngine(recipes, userHistory, userPreferences);
  return engine.getRecommendations(count);
}
