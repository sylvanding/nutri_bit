import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, MapPin, Hash, TrendingUp } from 'lucide-react';
import { Post } from '../../types/social';
import { useSocialStore } from '../../stores/socialStore';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const { likePost, unlikePost, bookmarkPost, unbookmarkPost, sharePost, followUser, unfollowUser, openPostDetail } = useSocialStore();
  const [showFullContent, setShowFullContent] = useState(false);

  const postTypeConfig = {
    meal: { label: '晒餐', icon: '🍽️', color: 'bg-blue-100 text-blue-700' },
    recipe: { label: '菜谱', icon: '👨‍🍳', color: 'bg-orange-100 text-orange-700' },
    experience: { label: '经验', icon: '💡', color: 'bg-purple-100 text-purple-700' },
    question: { label: '提问', icon: '❓', color: 'bg-green-100 text-green-700' }
  };

  const config = postTypeConfig[post.type];
  const isLongContent = post.content.length > 200;
  const displayContent = showFullContent || !isLongContent 
    ? post.content 
    : post.content.slice(0, 200) + '...';

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.userInteraction?.isLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.userInteraction?.isBookmarked) {
      unbookmarkPost(post.id);
    } else {
      bookmarkPost(post.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    sharePost(post.id);
    alert('分享成功！');
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author.isFollowing) {
      unfollowUser(post.author.id);
    } else {
      followUser(post.author.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      openPostDetail(post);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* 头部 - 用户信息 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{post.author.username}</span>
              {post.author.isVerified && (
                <span className="text-blue-500">✓</span>
              )}
              {post.author.level && (
                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
                  {post.author.level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                {config.icon} {config.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!post.author.isFollowing && post.author.id !== 'current-user' && (
            <button
              onClick={handleFollow}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
            >
              + 关注
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">
          {displayContent}
        </p>
        {isLongContent && !showFullContent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullContent(true);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm mt-1"
          >
            查看更多
          </button>
        )}
      </div>

      {/* 位置 */}
      {post.location && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={16} />
            <span>{post.location}</span>
          </div>
        </div>
      )}

      {/* 图片网格 */}
      {post.media.length > 0 && (
        <div className={`
          grid gap-1
          ${post.media.length === 1 ? 'grid-cols-1' : ''}
          ${post.media.length === 2 ? 'grid-cols-2' : ''}
          ${post.media.length === 3 ? 'grid-cols-3' : ''}
          ${post.media.length === 4 ? 'grid-cols-2' : ''}
          ${post.media.length >= 5 ? 'grid-cols-3' : ''}
        `}>
          {post.media.slice(0, 9).map((media, index) => (
            <div
              key={media.id}
              className={`relative ${post.media.length === 1 ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden`}
            >
              <img
                src={media.url}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {index === 8 && post.media.length > 9 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{post.media.length - 9}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 营养信息 */}
      {post.nutrition && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{post.nutrition.calories}</div>
              <div className="text-xs text-gray-600">热量(kcal)</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{post.nutrition.protein}g</div>
              <div className="text-xs text-gray-600">蛋白质</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{post.nutrition.carbs}g</div>
              <div className="text-xs text-gray-600">碳水</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{post.nutrition.fat}g</div>
              <div className="text-xs text-gray-600">脂肪</div>
            </div>
          </div>
        </div>
      )}

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <div
              key={tag.id}
              className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              <Hash size={12} />
              {tag.name}
            </div>
          ))}
        </div>
      )}

      {/* 互动栏 */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${
              post.userInteraction?.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart
              size={22}
              fill={post.userInteraction?.isLiked ? 'currentColor' : 'none'}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">{post.stats.likes}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openPostDetail(post);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{post.stats.comments}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
          >
            <Share2 size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{post.stats.shares}</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full transition-colors ${
            post.userInteraction?.isBookmarked
              ? 'text-yellow-500 bg-yellow-50'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bookmark
            size={22}
            fill={post.userInteraction?.isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* 浏览量 */}
      <div className="px-4 pb-3 flex items-center gap-1 text-xs text-gray-500">
        <TrendingUp size={14} />
        <span>{post.stats.views} 次浏览</span>
      </div>
    </div>
  );
};

