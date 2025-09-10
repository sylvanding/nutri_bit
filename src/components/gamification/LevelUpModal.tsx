import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy, Crown, Zap } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
  rewards?: Array<{
    type: string;
    value: string | number;
    icon?: string;
  }>;
}

// 等级里程碑配置
const levelMilestones = {
  5: { title: '饮食学徒', icon: '🌱', color: 'from-green-400 to-blue-500' },
  10: { title: '健康达人', icon: '💪', color: 'from-blue-400 to-purple-500' },
  15: { title: '营养专家', icon: '⚖️', color: 'from-purple-400 to-pink-500' },
  20: { title: '健康导师', icon: '🎓', color: 'from-pink-400 to-red-500' },
  25: { title: '饮食大师', icon: '👨‍🍳', color: 'from-red-400 to-yellow-500' },
  30: { title: '营养学者', icon: '📚', color: 'from-yellow-400 to-green-500' },
  40: { title: '健康使者', icon: '✨', color: 'from-indigo-400 to-purple-600' },
  50: { title: '营养传奇', icon: '👑', color: 'from-yellow-400 to-orange-500' }
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  oldLevel,
  newLevel,
  onClose,
  rewards = []
}) => {
  const milestone = levelMilestones[newLevel as keyof typeof levelMilestones];
  const isSpecialLevel = !!milestone;

  // 粒子效果组件
  const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{
        background: `hsl(${Math.random() * 360}, 70%, 60%)`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ scale: 0, y: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        y: [0, -100, -200],
        rotate: [0, 180, 360],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut"
      }}
    />
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 粒子背景 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.1} />
            ))}
          </div>

          {/* 主要modal内容 */}
          <motion.div
            className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部装饰性图标 */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {/* 发光圆环 */}
              <motion.div
                className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${
                  milestone?.color || 'from-blue-400 to-purple-500'
                } flex items-center justify-center relative`}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 40px rgba(147, 51, 234, 0.7)',
                    '0 0 20px rgba(59, 130, 246, 0.5)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* 等级图标 */}
                <motion.div
                  className="text-4xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {milestone?.icon || '⭐'}
                </motion.div>

                {/* 旋转光环 */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* 闪烁星星 */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${50 + 35 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                      top: `${50 + 35 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* 标题文字 */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                恭喜升级！
              </h2>
              
              <motion.div
                className="flex items-center justify-center gap-2 text-xl font-semibold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
              >
                <span className="text-gray-600">Lv.{oldLevel}</span>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: 2 }}
                >
                  <Zap className="text-yellow-500" size={20} />
                </motion.div>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                  milestone?.color || 'from-blue-500 to-purple-600'
                }`}>
                  Lv.{newLevel}
                </span>
              </motion.div>

              {/* 特殊称号 */}
              {milestone && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${milestone.color} text-white text-sm font-medium shadow-lg`}>
                    <Crown size={16} className="inline mr-2" />
                    {milestone.title}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* 奖励列表 */}
            {rewards.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  升级奖励
                </h3>
                <div className="space-y-2">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                    >
                      <span className="text-lg">{reward.icon || '🎁'}</span>
                      <span className="text-gray-700">
                        {reward.type}: {reward.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 激励文字 */}
            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              继续保持健康的饮食习惯，向下一个目标前进！
            </motion.p>

            {/* 关闭按钮 */}
            <motion.button
              className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${
                milestone?.color || 'from-blue-500 to-purple-600'
              } text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              onClick={onClose}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              继续加油！
            </motion.button>

            {/* 自动关闭提示 */}
            <motion.p
              className="text-xs text-gray-400 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
            >
              点击任意位置或等待3秒自动关闭
            </motion.p>

            {/* 装饰性闪光 */}
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-400"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles size={24} />
            </motion.div>

            <motion.div
              className="absolute -bottom-2 -left-2 text-purple-400"
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Star size={20} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
