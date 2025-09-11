import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Star, Crown, Sparkles, Book, Globe, Utensils, TrendingUp, Award, Lock } from 'lucide-react';
import { useFoodMapStore } from '../../stores/foodMapStore';
import FoodMapComponent from './FoodMapComponent';
import clsx from 'clsx';

interface FoodPassportPanelProps {
  className?: string;
}

const FoodPassportPanel: React.FC<FoodPassportPanelProps> = ({ className = '' }) => {
  const {
    availableMaps,
    userDiscoveries,
    notifications,
    getMapProgress,
    getUserDiscoveriesForMap,
    isSpotDiscovered,
    discoverFood,
    clearNotifications,
    getStats
  } = useFoodMapStore();

  const [activeMap, setActiveMap] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'maps' | 'passport' | 'stats'>('overview');

  const stats = getStats();

  // 难度等级配置
  const difficultyLevels = {
    'common': { label: '常见', color: 'bg-gray-100 text-gray-700', icon: '🍽️' },
    'uncommon': { label: '特色', color: 'bg-green-100 text-green-700', icon: '🌟' },
    'rare': { label: '稀有', color: 'bg-blue-100 text-blue-700', icon: '💎' },
    'legendary': { label: '传说', color: 'bg-yellow-100 text-yellow-700', icon: '👑' }
  };

  // 地图类型配置
  const mapTypeConfig = {
    'regional': { label: '地域美食', icon: '🗺️', color: 'from-blue-400 to-blue-600' },
    'cuisine': { label: '世界菜系', icon: '🌍', color: 'from-green-400 to-green-600' },
    'ingredient': { label: '营养食材', icon: '🥗', color: 'from-purple-400 to-purple-600' },
    'nutrition': { label: '营养主题', icon: '💚', color: 'from-orange-400 to-orange-600' }
  };

  // 处理点位点击
  const handleSpotClick = (spotId: string) => {
    if (activeMap && !isSpotDiscovered(activeMap, spotId)) {
      discoverFood(activeMap, spotId);
    }
  };

  // 模拟发现新美食（用于测试）
  const simulateDiscovery = () => {
    const undiscoveredSpots = availableMaps.flatMap(map => 
      map.spots.filter(spot => !isSpotDiscovered(map.id, spot.id))
        .map(spot => ({ mapId: map.id, spotId: spot.id }))
    );
    
    if (undiscoveredSpots.length > 0) {
      const randomSpot = undiscoveredSpots[Math.floor(Math.random() * undiscoveredSpots.length)];
      discoverFood(randomSpot.mapId, randomSpot.spotId);
    }
  };

  return (
    <div className={clsx('w-full max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* 顶部通知 */}
      {notifications.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-green-800">美食发现动态</h3>
            <button
              onClick={clearNotifications}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              清除
            </button>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="text-sm text-green-700">
                {notification.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {[
          { id: 'overview', label: '护照总览', icon: Book },
          { id: 'maps', label: '美食地图', icon: MapPin },
          { id: 'passport', label: '收藏册', icon: Star },
          { id: 'stats', label: '探索统计', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200',
              activeView === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            )}
            onClick={() => {
              setActiveView(tab.id as any);
              setActiveMap(null);
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 总览视图 */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* 护照封面 */}
          <motion.div
            className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-4 right-4 text-6xl opacity-20">🍽️</div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">🍴 美食护照</h1>
              <p className="text-purple-100 mb-6">探索世界美食，收集珍贵回忆</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalDiscoveries}</div>
                  <div className="text-sm text-purple-100">发现美食</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.completedMaps}</div>
                  <div className="text-sm text-purple-100">完成地图</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.discoveryRate.toFixed(1)}%</div>
                  <div className="text-sm text-purple-100">探索率</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mapTypeConfig[stats.favoriteMapType as keyof typeof mapTypeConfig]?.icon || '🗺️'}</div>
                  <div className="text-sm text-purple-100">偏好类型</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 快速操作 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left group"
              onClick={() => setActiveView('maps')}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">探索地图</h3>
                  <p className="text-sm text-gray-600">发现新的美食宝藏</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {availableMaps.length} 个地图等待探索
              </div>
            </motion.button>

            <motion.button
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-200 text-left group"
              onClick={() => setActiveView('passport')}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Book className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">收藏册</h3>
                  <p className="text-sm text-gray-600">查看已收集的美食</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                已收录 {stats.totalDiscoveries} 道美食
              </div>
            </motion.button>

            <motion.button
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-200 text-left group"
              onClick={simulateDiscovery}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">随机发现</h3>
                  <p className="text-sm text-gray-600">尝试发现新美食</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                点击体验发现乐趣
              </div>
            </motion.button>
          </div>

          {/* 最近发现 */}
          {userDiscoveries.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">最近发现</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userDiscoveries.slice(0, 6).map((discovery) => (
                  <motion.div
                    key={discovery.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{difficultyLevels[discovery.spot?.difficulty as keyof typeof difficultyLevels]?.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{discovery.spot?.name}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(discovery.discoveredAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{discovery.spot?.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 地图视图 */}
      {activeView === 'maps' && (
        <div className="space-y-6">
          {activeMap ? (
            // 显示特定地图
            <div>
              <button
                onClick={() => setActiveMap(null)}
                className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 返回地图列表
              </button>
              
              {(() => {
                const map = availableMaps.find(m => m.id === activeMap);
                const progress = getMapProgress(activeMap);
                
                return map ? (
                  <FoodMapComponent
                    mapData={map}
                    userProgress={progress}
                    onSpotClick={handleSpotClick}
                    showProgress={true}
                  />
                ) : null;
              })()}
            </div>
          ) : (
            // 显示地图列表
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">美食地图</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableMaps.map((map) => {
                  const progress = getMapProgress(map.id);
                  const mapTypeInfo = mapTypeConfig[map.type];
                  
                  return (
                    <motion.div
                      key={map.id}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                      onClick={() => setActiveMap(map.id)}
                      whileHover={{ y: -4 }}
                    >
                      {/* 地图预览 */}
                      <div className={`h-40 bg-gradient-to-br ${mapTypeInfo.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl opacity-70">{mapTypeInfo.icon}</span>
                        </div>
                        
                        {/* 进度条 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-3">
                          <div className="flex justify-between items-center text-white text-sm mb-1">
                            <span>探索进度</span>
                            <span>{progress.discoveredSpots.length}/{map.totalSpots}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-white rounded-full h-2 transition-all duration-300"
                              style={{ width: `${progress.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* 地图信息 */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {map.title}
                          </h3>
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            'bg-gray-100 text-gray-700'
                          )}>
                            {mapTypeInfo.label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {map.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{progress.completionPercentage.toFixed(1)}% 完成</span>
                          {progress.completionPercentage >= 100 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Trophy size={12} />
                              已完成
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 收藏册视图 */}
      {activeView === 'passport' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">我的美食收藏册</h2>
          
          {userDiscoveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">还没有收藏任何美食</h3>
              <p className="text-gray-600 mb-4">开始探索美食地图，发现美味的世界吧！</p>
              <button
                onClick={() => setActiveView('maps')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                开始探索
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDiscoveries.map((discovery) => {
                const difficultyInfo = difficultyLevels[discovery.spot?.difficulty as keyof typeof difficultyLevels];
                
                return (
                  <motion.div
                    key={discovery.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200"
                    whileHover={{ y: -2 }}
                  >
                    {/* 美食图片区域 */}
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">{difficultyInfo?.icon}</span>
                      </div>
                      
                      {/* 难度标签 */}
                      <div className="absolute top-3 right-3">
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          difficultyInfo?.color
                        )}>
                          {difficultyInfo?.label}
                        </span>
                      </div>
                      
                      {/* 发现日期 */}
                      <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {new Date(discovery.discoveredAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* 美食信息 */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{discovery.spot?.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {discovery.spot?.description}
                      </p>
                      
                      {/* 营养亮点 */}
                      {discovery.spot?.nutritionHighlight && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                          <p className="text-xs text-green-700">
                            <span className="font-medium">营养：</span>
                            {discovery.spot.nutritionHighlight}
                          </p>
                        </div>
                      )}
                      
                      {/* 文化信息 */}
                      {discovery.spot?.culturalInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">文化：</span>
                            {discovery.spot.culturalInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 统计视图 */}
      {activeView === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">探索统计</h2>
          
          {/* 总体统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalDiscoveries}</div>
              <div className="text-sm text-gray-600">总发现数</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completedMaps}</div>
              <div className="text-sm text-gray-600">完成地图</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.discoveryRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">探索率</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{availableMaps.length}</div>
              <div className="text-sm text-gray-600">可用地图</div>
            </div>
          </div>
          
          {/* 地图进度详情 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">地图进度详情</h3>
            <div className="space-y-4">
              {availableMaps.map((map) => {
                const progress = getMapProgress(map.id);
                const mapTypeInfo = mapTypeConfig[map.type];
                
                return (
                  <div key={map.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mapTypeInfo.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{map.title}</h4>
                          <p className="text-sm text-gray-600">{mapTypeInfo.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {progress.discoveredSpots.length}/{map.totalSpots}
                        </div>
                        <div className="text-sm text-gray-500">
                          {progress.completionPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${mapTypeInfo.color} rounded-full h-3 transition-all duration-300`}
                        style={{ width: `${progress.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodPassportPanel;
