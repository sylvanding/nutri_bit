import React, { useState } from 'react';
import { Plus, TrendingUp, Users, Compass, Filter, Search } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { PostCard } from './PostCard';
import { PostCreateModal } from './PostCreateModal';
import { PostDetail } from './PostDetail';
import { FollowMealModal } from './FollowMealModal';
import { FeedType, PostType } from '../../types/social';

export const SocialFeed: React.FC = () => {
  const {
    activeFeedType,
    setActiveFeedType,
    feedFilter,
    setFeedFilter,
    getFilteredPosts,
    isCreatePostModalOpen,
    openCreatePostModal,
    closeCreatePostModal,
    isPostDetailOpen,
    closePostDetail,
    isFollowMealModalOpen,
    selectedFollowMealPost,
    closeFollowMealModal,
    createFollowMealOrder,
    topics
  } = useSocialStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const posts = getFilteredPosts();
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const feedTabs = [
    { type: 'following' as FeedType, label: '关注', icon: Users, description: '关注用户的动态' },
    { type: 'recommended' as FeedType, label: '推荐', icon: Compass, description: '为你推荐' },
    { type: 'trending' as FeedType, label: '热门', icon: TrendingUp, description: '热门内容' }
  ];

  const postTypeFilters = [
    { value: 'all', label: '全部', icon: '📱' },
    { value: 'meal', label: '晒餐', icon: '🍽️' },
    { value: 'recipe', label: '菜谱', icon: '👨‍🍳' },
    { value: 'experience', label: '经验', icon: '💡' },
    { value: 'question', label: '提问', icon: '❓' }
  ];

  const handlePostTypeFilter = (type: string) => {
    setFeedFilter({
      ...feedFilter,
      postType: type === 'all' ? undefined : type as PostType
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          {/* Feed类型切换 */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-1">
              {feedTabs.map(tab => (
                <button
                  key={tab.type}
                  onClick={() => setActiveFeedType(tab.type)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    activeFeedType === tab.type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={openCreatePostModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              发布动态
            </button>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex gap-3 pb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索内容、用户或标签..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                showFilterPanel
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Filter size={20} />
              筛选
            </button>
          </div>

          {/* 过滤面板 */}
          {showFilterPanel && (
            <div className="pb-4 border-t border-gray-200 pt-4 space-y-4">
              {/* 帖子类型过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容类型
                </label>
                <div className="flex gap-2">
                  {postTypeFilters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => handlePostTypeFilter(filter.value)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        (!feedFilter.postType && filter.value === 'all') ||
                        feedFilter.postType === filter.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="mr-2">{filter.icon}</span>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 话题过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  热门话题
                </label>
                <div className="flex gap-2 flex-wrap">
                  {topics.slice(0, 8).map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setFeedFilter({
                        ...feedFilter,
                        topicId: feedFilter.topicId === topic.id ? undefined : topic.id
                      })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        feedFilter.topicId === topic.id
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="mr-2">{topic.icon}</span>
                      {topic.name}
                      {topic.trending && <span className="ml-1 text-xs">🔥</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 排序 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  排序方式
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'latest', label: '最新' },
                    { value: 'popular', label: '最热' },
                    { value: 'relevant', label: '相关' }
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => setFeedFilter({
                        ...feedFilter,
                        sortBy: sort.value as any
                      })}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        feedFilter.sortBy === sort.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容流 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  暂无内容
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? '没有找到匹配的内容，试试其他关键词吧'
                    : activeFeedType === 'following'
                    ? '关注更多用户，发现精彩内容'
                    : '暂时没有内容，稍后再来看看'}
                </p>
                {activeFeedType === 'following' && (
                  <button
                    onClick={() => setActiveFeedType('recommended')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    浏览推荐内容
                  </button>
                )}
              </div>
            ) : (
              filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}

            {/* 加载更多 */}
            {filteredPosts.length > 0 && (
              <div className="text-center py-8">
                <button className="px-6 py-3 bg-white text-gray-600 rounded-full hover:bg-gray-50 transition-colors border border-gray-200">
                  加载更多
                </button>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="hidden lg:block space-y-4">
            {/* 热门话题 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-red-500" />
                热门话题
              </h3>
              <div className="space-y-3">
                {topics.slice(0, 5).map((topic, index) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setFeedFilter({ ...feedFilter, topicId: topic.id })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{topic.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {topic.name}
                          {topic.trending && <span className="text-xs">🔥</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.posts.toLocaleString()} 帖子
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-400">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 推荐用户 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                推荐关注
              </h3>
              <div className="space-y-4">
                {/* 这里可以添加推荐用户列表 */}
                <div className="text-center text-gray-500 text-sm py-4">
                  暂无推荐
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 发布模态框 */}
      <PostCreateModal
        isOpen={isCreatePostModalOpen}
        onClose={closeCreatePostModal}
      />

      {/* 帖子详情模态框 */}
      {isPostDetailOpen && <PostDetail />}

      {/* 一键跟吃模态框 */}
      {isFollowMealModalOpen && selectedFollowMealPost && (
        <FollowMealModal
          isOpen={isFollowMealModalOpen}
          post={selectedFollowMealPost}
          onClose={closeFollowMealModal}
          onConfirm={(orderData) => {
            createFollowMealOrder(orderData);
            alert('下单成功！营养数据将自动同步到您的记录中 🎉');
          }}
        />
      )}
    </div>
  );
};

