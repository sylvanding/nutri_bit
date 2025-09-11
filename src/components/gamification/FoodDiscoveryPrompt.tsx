import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Sparkles, X, ChevronRight } from 'lucide-react';
import { useFoodMapStore } from '../../stores/foodMapStore';
import { recognizeFoodFromText, autoDiscoverFromMeal, suggestRelatedFoods, getUserExplorationSuggestions } from '../../utils/foodRecognition';
import clsx from 'clsx';

interface FoodDiscoveryPromptProps {
  mealDescription: string;
  mealRecordId?: string;
  onClose?: () => void;
  className?: string;
}

const FoodDiscoveryPrompt: React.FC<FoodDiscoveryPromptProps> = ({
  mealDescription,
  mealRecordId,
  onClose,
  className = ''
}) => {
  const [detectedFoods, setDetectedFoods] = useState<Array<{ mapId: string; spotId: string }>>([]);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; mapId: string; spotId: string }>>([]);
  const [explorationSuggestions, setExplorationSuggestions] = useState<Array<{ 
    title: string; 
    description: string; 
    mapId: string; 
    spotId: string; 
    difficulty: string 
  }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [autoDiscovered, setAutoDiscovered] = useState<string[]>([]);
  
  const { discoverFood, isSpotDiscovered, availableMaps } = useFoodMapStore();

  useEffect(() => {
    if (mealDescription.trim()) {
      // 识别食物
      const detected = recognizeFoodFromText(mealDescription);
      setDetectedFoods(detected);
      
      // 自动发现美食
      const discovered = autoDiscoverFromMeal(mealDescription, mealRecordId);
      setAutoDiscovered(discovered);
      
      // 获取相关推荐
      const related = suggestRelatedFoods(mealDescription);
      setSuggestions(related);
      
      // 获取探索建议
      const exploration = getUserExplorationSuggestions();
      setExplorationSuggestions(exploration);
      
      // 如果有发现或建议，显示组件
      if (detected.length > 0 || related.length > 0 || discovered.length > 0) {
        setIsVisible(true);
      }
    }
  }, [mealDescription, mealRecordId]);

  const handleManualDiscover = (mapId: string, spotId: string) => {
    if (!isSpotDiscovered(mapId, spotId)) {
      discoverFood(mapId, spotId, mealRecordId);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getSpotInfo = (mapId: string, spotId: string) => {
    const map = availableMaps.find(m => m.id === mapId);
    const spot = map?.spots.find(s => s.id === spotId);
    return { map, spot };
  };

  const difficultyConfig = {
    'common': { label: '常见', color: 'bg-gray-100 text-gray-700', icon: '🍽️' },
    'uncommon': { label: '特色', color: 'bg-green-100 text-green-700', icon: '🌟' },
    'rare': { label: '稀有', color: 'bg-blue-100 text-blue-700', icon: '💎' },
    'legendary': { label: '传说', color: 'bg-yellow-100 text-yellow-700', icon: '👑' }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={clsx('fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">美食发现</h2>
                <p className="text-sm text-gray-600">发现新的美食宝藏</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* 自动发现的美食 */}
          {autoDiscovered.length > 0 && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">🎉 自动发现新美食！</h3>
              </div>
              <div className="space-y-2">
                {autoDiscovered.map((spotId) => {
                  const detected = detectedFoods.find(d => d.spotId === spotId);
                  if (!detected) return null;
                  
                  const { map, spot } = getSpotInfo(detected.mapId, detected.spotId);
                  const difficulty = difficultyConfig[spot?.difficulty as keyof typeof difficultyConfig];
                  
                  return (
                    <div key={spotId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <span className="text-2xl">{difficulty?.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{spot?.name}</h4>
                        <p className="text-sm text-gray-600">{map?.title}</p>
                      </div>
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', difficulty?.color)}>
                        {difficulty?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 可发现的美食 */}
          {detectedFoods.filter(d => !autoDiscovered.includes(d.spotId)).length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">发现相关美食</h3>
              </div>
              <div className="space-y-3">
                {detectedFoods
                  .filter(d => !autoDiscovered.includes(d.spotId))
                  .map(({ mapId, spotId }) => {
                    const { map, spot } = getSpotInfo(mapId, spotId);
                    const isDiscovered = isSpotDiscovered(mapId, spotId);
                    const difficulty = difficultyConfig[spot?.difficulty as keyof typeof difficultyConfig];
                    
                    return (
                      <motion.button
                        key={`${mapId}-${spotId}`}
                        className={clsx(
                          'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                          isDiscovered
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                            : 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100'
                        )}
                        onClick={() => !isDiscovered && handleManualDiscover(mapId, spotId)}
                        disabled={isDiscovered}
                        whileHover={!isDiscovered ? { scale: 1.02 } : {}}
                        whileTap={!isDiscovered ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{difficulty?.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{spot?.name}</h4>
                            <p className="text-sm text-gray-600">{spot?.description}</p>
                            <p className="text-xs text-blue-600 mt-1">{map?.title}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', difficulty?.color)}>
                              {difficulty?.label}
                            </span>
                            {isDiscovered ? (
                              <span className="text-xs text-gray-500">已发现</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* 相关推荐 */}
          {suggestions.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">相关推荐</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.slice(0, 3).map(({ name, mapId, spotId }) => {
                  const { map, spot } = getSpotInfo(mapId, spotId);
                  const isDiscovered = isSpotDiscovered(mapId, spotId);
                  const difficulty = difficultyConfig[spot?.difficulty as keyof typeof difficultyConfig];
                  
                  return (
                    <button
                      key={`${mapId}-${spotId}`}
                      className={clsx(
                        'p-3 rounded-lg border transition-all duration-200 text-left',
                        isDiscovered
                          ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          : 'bg-purple-50 border-purple-200 hover:border-purple-300'
                      )}
                      onClick={() => !isDiscovered && handleManualDiscover(mapId, spotId)}
                      disabled={isDiscovered}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{difficulty?.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{name}</h4>
                          <p className="text-xs text-purple-600">{map?.title}</p>
                        </div>
                        {!isDiscovered && <ChevronRight className="w-4 h-4 text-purple-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 探索建议 */}
          {explorationSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">探索建议</h3>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                尝试这些美食来解锁更多地图点位
              </div>
              <div className="space-y-2">
                {explorationSuggestions.slice(0, 2).map(({ title, description, mapId, spotId, difficulty }) => {
                  const difficultyInfo = difficultyConfig[difficulty as keyof typeof difficultyConfig];
                  
                  return (
                    <div key={`${mapId}-${spotId}`} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{difficultyInfo?.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{title}</h4>
                          <p className="text-xs text-gray-600">{description}</p>
                        </div>
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', difficultyInfo?.color)}>
                          {difficultyInfo?.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 底部操作 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
            >
              开始美食之旅
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodDiscoveryPrompt;
