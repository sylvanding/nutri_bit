import React, { useState } from 'react';
import { MapPin, Calendar, Users, Heart, BookOpen, Settings, Share2, MessageCircle as MessageIcon } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { SocialUser } from '../../types/social';
import { PostCard } from './PostCard';

interface UserProfileProps {
  userId: string;
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onClose }) => {
  const { posts, currentUser, followUser, unfollowUser } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'bookmarked'>('posts');

  // 模拟用户数据（实际应该从store或API获取）
  const user: SocialUser = posts.find(p => p.author.id === userId)?.author || currentUser!;
  const userPosts = posts.filter(p => p.author.id === userId);
  const likedPosts = posts.filter(p => p.userInteraction?.isLiked && p.author.id === userId);
  const bookmarkedPosts = posts.filter(p => p.userInteraction?.isBookmarked);

  const isOwnProfile = userId === currentUser?.id;

  const handleFollow = () => {
    if (user.isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const tabs = [
    { id: 'posts', label: '帖子', count: userPosts.length, icon: BookOpen },
    { id: 'liked', label: '喜欢', count: likedPosts.length, icon: Heart },
    { id: 'bookmarked', label: '收藏', count: bookmarkedPosts.length, icon: BookOpen }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return userPosts;
      case 'liked':
        return likedPosts;
      case 'bookmarked':
        return bookmarkedPosts;
      default:
        return [];
    }
  };

  const displayPosts = getTabContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 个人信息卡片 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          {/* 背景横幅 */}
          <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-b-2xl -mx-4"></div>

          {/* 个人信息 */}
          <div className="relative px-4 pb-6">
            {/* 头像 */}
            <div className="flex justify-between items-start -mt-20 mb-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                {user.isVerified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-4">
                {isOwnProfile ? (
                  <button className="px-6 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Settings size={18} />
                    编辑资料
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                        user.isFollowing
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {user.isFollowing ? '已关注' : '+ 关注'}
                    </button>
                    <button className="px-6 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <MessageIcon size={18} />
                      私信
                    </button>
                  </>
                )}
                <button className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {user.username}
                  </h1>
                  {user.level && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-semibold">
                      {user.level}
                    </span>
                  )}
                  {user.membershipTier && user.membershipTier !== 'free' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full text-sm font-semibold">
                      {user.membershipTier === 'pro' ? 'PRO' : 'PLUS'}
                    </span>
                  )}
                </div>
                {user.bio && (
                  <p className="text-gray-600">{user.bio}</p>
                )}
              </div>

              {/* 统计信息 */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">加入于 2024年1月</span>
                </div>
                {user.bio && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-600">北京</span>
                  </div>
                )}
              </div>

              {/* 关注数据 */}
              <div className="flex items-center gap-8">
                <div className="cursor-pointer hover:text-blue-600 transition-colors">
                  <span className="font-bold text-gray-800">{user.posts}</span>
                  <span className="text-gray-600 ml-1">帖子</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600 transition-colors">
                  <span className="font-bold text-gray-800">{user.followers.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1">粉丝</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600 transition-colors">
                  <span className="font-bold text-gray-800">{user.following}</span>
                  <span className="text-gray-600 ml-1">关注</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容标签页 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-semibold">{tab.label}</span>
                <span className={`text-sm ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {displayPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              暂无内容
            </h3>
            <p className="text-gray-600">
              {activeTab === 'posts' && isOwnProfile && '发布你的第一条动态吧！'}
              {activeTab === 'posts' && !isOwnProfile && '该用户还没有发布内容'}
              {activeTab === 'liked' && '还没有喜欢的内容'}
              {activeTab === 'bookmarked' && '还没有收藏的内容'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

