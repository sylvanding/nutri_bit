import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Lock, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { FoodMap, FoodMapSpot, MapProgress } from '../../types/gamification';
import clsx from 'clsx';

interface FoodMapComponentProps {
  mapData: FoodMap;
  userProgress?: MapProgress;
  onSpotClick: (spotId: string) => void;
  className?: string;
  showProgress?: boolean;
}

// 难度配置
const difficultyConfig = {
  common: {
    color: 'bg-gray-400',
    hoverColor: 'hover:bg-gray-500',
    shadowColor: 'shadow-gray-300',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    icon: '🍽️',
    label: '常见'
  },
  uncommon: {
    color: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    shadowColor: 'shadow-green-300',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    icon: '🌟',
    label: '不常见'
  },
  rare: {
    color: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
    shadowColor: 'shadow-blue-300',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    icon: '💎',
    label: '稀有'
  },
  legendary: {
    color: 'bg-yellow-400',
    hoverColor: 'hover:bg-yellow-500',
    shadowColor: 'shadow-yellow-300',
    glowColor: 'rgba(251, 191, 36, 0.8)',
    icon: '👑',
    label: '传说'
  }
};

const FoodMapSpotComponent: React.FC<{
  spot: FoodMapSpot;
  isDiscovered: boolean;
  onSpotClick: (spotId: string) => void;
  mapScale: number;
}> = ({ spot, isDiscovered, onSpotClick, mapScale }) => {
  const [isHovered, setIsHovered] = useState(false);
  const difficulty = difficultyConfig[spot.difficulty];

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
      style={{
        left: `${spot.coordinates.x}%`,
        top: `${spot.coordinates.y}%`,
        scale: mapScale
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: mapScale, 
        opacity: 1,
        transition: { 
          delay: Math.random() * 0.5,
          type: "spring",
          stiffness: 200
        }
      }}
      whileHover={{ scale: mapScale * 1.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 主要点位 */}
      <motion.button
        className={clsx(
          'relative w-8 h-8 rounded-full cursor-pointer transition-all duration-300',
          'flex items-center justify-center text-sm font-bold',
          'border-2 border-white shadow-lg',
          isDiscovered 
            ? `${difficulty.color} ${difficulty.shadowColor} text-white`
            : 'bg-gray-300 border-gray-400 text-gray-500',
          !isDiscovered && 'opacity-60'
        )}
        onClick={() => onSpotClick(spot.id)}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: isDiscovered 
            ? [`0 0 0px ${difficulty.glowColor}`, `0 0 20px ${difficulty.glowColor}`, `0 0 0px ${difficulty.glowColor}`]
            : '0 4px 8px rgba(0,0,0,0.2)'
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: isDiscovered ? Infinity : 0,
            ease: "easeInOut"
          }
        }}
      >
        {isDiscovered ? (
          <span className="text-lg">{difficulty.icon}</span>
        ) : (
          <Lock size={16} className="text-gray-400" />
        )}

        {/* 传说级别的特殊效果 */}
        {isDiscovered && spot.difficulty === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)'
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* 新发现的闪光效果 */}
        {isDiscovered && spot.discoveredAt && 
         new Date().getTime() - new Date(spot.discoveredAt).getTime() < 5000 && (
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-yellow-400"
            animate={{
              scale: [1, 1.5],
              opacity: [1, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.button>

      {/* 悬浮信息卡片 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px] max-w-[280px]">
              {/* 箭头 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
              
              <div className="space-y-2">
                {/* 名称和状态 */}
                <div className="flex items-center justify-between">
                  <h3 className={clsx(
                    'font-bold text-sm',
                    isDiscovered ? 'text-gray-800' : 'text-gray-500'
                  )}>
                    {isDiscovered ? spot.name : '未发现'}
                  </h3>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    `${difficulty.color} text-white`
                  )}>
                    {difficulty.label}
                  </span>
                </div>

                {/* 描述 */}
                {isDiscovered && (
                  <p className="text-xs text-gray-600 leading-tight">
                    {spot.description}
                  </p>
                )}

                {/* 营养亮点 */}
                {isDiscovered && spot.nutritionHighlight && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-xs text-green-700">
                      <span className="font-medium">营养亮点：</span>
                      {spot.nutritionHighlight}
                    </p>
                  </div>
                )}

                {/* 文化信息 */}
                {isDiscovered && spot.culturalInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">文化背景：</span>
                      {spot.culturalInfo}
                    </p>
                  </div>
                )}

                {/* 发现时间 */}
                {isDiscovered && spot.discoveredAt && (
                  <p className="text-xs text-gray-400">
                    发现于：{new Date(spot.discoveredAt).toLocaleDateString()}
                  </p>
                )}

                {/* 未发现提示 */}
                {!isDiscovered && (
                  <div className="text-center py-2">
                    <Lock size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      记录相关菜品来解锁
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 连接线 - 连接到相关的其他点位 */}
      {isDiscovered && spot.category && (
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: -1 }}
        >
          {/* 这里可以添加连接线的SVG路径 */}
        </svg>
      )}
    </motion.div>
  );
};

const FoodMapComponent: React.FC<FoodMapComponentProps> = ({
  mapData,
  userProgress,
  onSpotClick,
  className = '',
  showProgress = true
}) => {
  const [mapScale, setMapScale] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const discoveredSpots = userProgress?.discoveredSpots || [];
  const completionPercentage = userProgress?.completionPercentage || 0;

  return (
    <div className={clsx('relative w-full', className)}>
      {/* 地图头部信息 */}
      {showProgress && (
        <motion.div
          className="mb-4 bg-white rounded-lg shadow-md p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">{mapData.title}</h2>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {discoveredSpots.length}/{mapData.totalSpots}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{mapData.description}</p>
          
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">探索进度</span>
              <span className="font-medium text-gray-800">
                {completionPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* 进度条闪光效果 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 地图主体 */}
      <motion.div
        ref={mapRef}
        className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 地图背景图片 */}
        {mapData.backgroundImage && (
          <img
            src={mapData.backgroundImage}
            alt={mapData.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => {
              // 如果图片加载失败，隐藏图片元素
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* 地图装饰纹理 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
        
        {/* 美食点位 */}
        {mapData.spots?.map((spot) => {
          const isDiscovered = discoveredSpots.includes(spot.id);
          
          return (
            <FoodMapSpotComponent
              key={spot.id}
              spot={spot}
              isDiscovered={isDiscovered}
              onSpotClick={onSpotClick}
              mapScale={mapScale}
            />
          );
        })}

        {/* 地图控制器 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <motion.button
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            onClick={() => setMapScale(Math.min(mapScale + 0.1, 1.5))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg font-bold text-gray-600">+</span>
          </motion.button>
          <motion.button
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            onClick={() => setMapScale(Math.max(mapScale - 0.1, 0.8))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg font-bold text-gray-600">-</span>
          </motion.button>
        </div>

        {/* 地图说明 */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">探索指南</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>常见美食</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>特色美食</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>稀有美食</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>传说美食</span>
            </div>
          </div>
        </div>

        {/* 完成庆祝效果 */}
        {completionPercentage >= 100 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                地图完成！
              </h3>
              <p className="text-gray-600">
                恭喜你探索完成了{mapData.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FoodMapComponent;
