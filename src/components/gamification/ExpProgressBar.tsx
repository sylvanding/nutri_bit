import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ExpProgressBarProps {
  currentExp: number;
  nextLevelExp: number;
  level: number;
  showAnimation?: boolean;
  className?: string;
}

// 计算下一级需要的经验值
const getExpForLevel = (level: number): number => {
  return level * level * 100;
};

export const ExpProgressBar: React.FC<ExpProgressBarProps> = ({
  currentExp,
  nextLevelExp,
  level,
  showAnimation = true,
  className = ''
}) => {
  const progress = Math.min((currentExp / nextLevelExp) * 100, 100);
  const expToNext = nextLevelExp - currentExp;
  
  return (
    <div className={`w-full ${className}`}>
      {/* 等级和经验值信息 */}
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Zap size={12} />
            Lv.{level}
          </div>
          <span className="text-gray-600">
            {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()} XP
          </span>
        </div>
        <span className="text-gray-500 text-xs">
          还需 {expToNext.toLocaleString()} XP
        </span>
      </div>
      
      {/* 进度条容器 */}
      <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        {/* 进度条背景渐变 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0, opacity: 0.8 }}
          animate={{ 
            width: `${progress}%`,
            opacity: 1
          }}
          transition={{ 
            duration: showAnimation ? 1.5 : 0, 
            ease: "easeOut"
          }}
        >
          {/* 闪光效果 */}
          {showAnimation && progress > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
              }}
            />
          )}
          
          {/* 进度条发光效果 */}
          {progress > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-sm opacity-50"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
        
        {/* 等级标识 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-xs font-bold text-white drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {progress.toFixed(0)}%
          </motion.span>
        </div>
        
        {/* 进度点装饰 */}
        {progress > 20 && (
          <motion.div
            className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              boxShadow: ['0 0 0px rgba(253, 224, 71, 0.5)', '0 0 10px rgba(253, 224, 71, 0.8)', '0 0 5px rgba(253, 224, 71, 0.6)']
            }}
            transition={{ delay: 1, duration: 0.6 }}
          />
        )}
        
        {progress > 50 && (
          <motion.div
            className="absolute left-2/4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-300 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              boxShadow: ['0 0 0px rgba(134, 239, 172, 0.5)', '0 0 10px rgba(134, 239, 172, 0.8)', '0 0 5px rgba(134, 239, 172, 0.6)']
            }}
            transition={{ delay: 1.3, duration: 0.6 }}
          />
        )}
        
        {progress > 80 && (
          <motion.div
            className="absolute left-3/4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-300 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              boxShadow: ['0 0 0px rgba(253, 186, 116, 0.5)', '0 0 10px rgba(253, 186, 116, 0.8)', '0 0 5px rgba(253, 186, 116, 0.6)']
            }}
            transition={{ delay: 1.6, duration: 0.6 }}
          />
        )}
      </div>
      
      {/* 下一级预览 */}
      {progress >= 90 && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <span className="text-xs text-gray-500">
            即将升级到 Lv.{level + 1} 🎉
          </span>
        </motion.div>
      )}
    </div>
  );
};

// 简化版经验值条，用于小组件
export const MiniExpBar: React.FC<{
  currentExp: number;
  nextLevelExp: number;
  level: number;
}> = ({ currentExp, nextLevelExp, level }) => {
  const progress = Math.min((currentExp / nextLevelExp) * 100, 100);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-blue-600">Lv.{level}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {progress.toFixed(0)}%
      </span>
    </div>
  );
};
