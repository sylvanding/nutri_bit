import React, { useState } from 'react';
import { Camera, Home, BookOpen, Users, User, MessageCircle, TrendingUp, Target, Award, ShoppingCart, Heart, Star, Clock, Zap, Check } from 'lucide-react';

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMeal, setSelectedMeal] = useState<MealRecord | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showNutritionReport, setShowNutritionReport] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedKOLPost, setSelectedKOLPost] = useState<KOLPost | null>(null);

  const todayNutrition = {
    target: { calories: 2000, protein: 120, carbs: 250, fat: 65 },
    current: { calories: 1456, protein: 89, carbs: 180, fat: 48 }
  };

  const todayMeals: MealRecord[] = [
    {
      id: '1',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '牛油果吐司配煎蛋',
      time: '8:30',
      nutrition: { calories: 420, protein: 18, carbs: 35, fat: 25, sodium: 380, fiber: 8 },
      score: 92
    },
    {
      id: '2', 
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '鸡胸肉沙拉',
      time: '12:45',
      nutrition: { calories: 380, protein: 35, carbs: 20, fat: 15, sodium: 420, fiber: 6 },
      score: 88
    },
    {
      id: '3',
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
      name: '三文鱼藜麦饭',
      time: '19:20',
      nutrition: { calories: 656, protein: 36, carbs: 125, fat: 8, sodium: 340, fiber: 12 },
      score: 95
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
              setShowCamera(false);
              setShowNutritionReport(true);
            }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg"
          >
            <Camera size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  const NutritionReportModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">营养分析报告</h2>
          <button 
            onClick={() => setShowNutritionReport(false)}
            className="text-gray-500 p-2"
          >
            ✕
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl font-bold text-green-600">92</div>
          </div>
          <h3 className="text-lg font-semibold mb-1">牛油果吐司配煎蛋</h3>
          <p className="text-gray-600 text-sm">营养搭配优秀！蛋白质和健康脂肪含量理想</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">420</div>
            <div className="text-sm text-gray-600">千卡</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">18g</div>
            <div className="text-sm text-gray-600">蛋白质</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">35g</div>
            <div className="text-sm text-gray-600">碳水化合物</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">25g</div>
            <div className="text-sm text-gray-600">脂肪</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-600" />
            AI营养师建议
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>优质脂肪来源，有助于维生素吸收</span>
            </div>
            <div className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>纤维含量丰富，增强饱腹感</span>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 mt-0.5 flex-shrink-0"></div>
              <span>建议搭配水果补充维生素C</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowNutritionReport(false)}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold"
        >
          确认记录
        </button>
      </div>
    </div>
  );

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
        
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{todayNutrition.current.calories}</div>
          <div className="text-green-100 text-sm">今日摄入热量 / {todayNutrition.target.calories} 千卡</div>
          <div className="w-full bg-green-300 rounded-full h-2 mt-3">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(todayNutrition.current.calories / todayNutrition.target.calories) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setShowCamera(true)}
            className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <Camera size={24} />
            <span className="font-semibold">拍照记录</span>
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className="bg-blue-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <BookOpen size={24} />
            <span className="font-semibold">AI推荐</span>
          </button>
        </div>

        {/* Nutrition Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">今日营养概览</h2>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Today's Meals */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">今日饮食</h2>
            <button 
              onClick={() => setShowNutritionReport(true)}
              className="text-green-500 text-sm font-medium"
            >
              查看详报
            </button>
          </div>
          
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div 
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <img src={meal.image} alt={meal.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">{meal.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{meal.time}</div>
                  <div className="text-sm text-gray-500">{meal.nutrition.calories} 千卡</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{meal.score}</div>
                  <div className="text-xs text-gray-500">营养分</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">健康洞察</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            您本周的蛋白质摄入非常稳定，维持在推荐范围内。建议继续保持，并适当增加深色蔬菜的摄入。
          </p>
          <button className="text-blue-600 text-sm font-medium">
            查看详细分析 →
          </button>
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="蒜蓉西兰花炒虾仁" 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">蒜蓉西兰花炒虾仁</h3>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">高蛋白低脂，富含膳食纤维</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>15分钟</span>
              </div>
              <div>450千卡 | 35g蛋白质</div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold">
                查看菜谱
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="鸡胸肉时蔬沙拉" 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">鸡胸肉时蔬沙拉</h3>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">4.6</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">减脂必备，营养均衡</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>10分钟</span>
              </div>
              <div>320千卡 | 28g蛋白质</div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold">
                查看菜谱
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
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
          U
        </div>
        <h1 className="text-xl font-bold mb-2">健康达人</h1>
        <p className="text-gray-600 text-sm">已坚持记录 42 天</p>
      </div>

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
              <Target className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium">健康目标</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">健康报告</span>
            </div>
            <span className="text-sm text-gray-500">→</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-purple-600 mr-3" />
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

      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">升级至专业版</h3>
          <p className="text-gray-600 text-sm mb-4">解锁全部AI功能和无限次识别</p>
          <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold">
            立即升级 ¥19.9/月
          </button>
        </div>
      </div>
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
      {showNutritionReport && <NutritionReportModal />}
      {aiChatOpen && <AIChat />}
      {selectedKOLPost && <KOLPostModal post={selectedKOLPost} />}
    </div>
  );
};

export default App;