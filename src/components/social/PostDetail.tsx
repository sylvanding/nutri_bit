import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal, ThumbsUp, Reply } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { Comment } from '../../types/social';

export const PostDetail: React.FC = () => {
  const {
    selectedPost,
    closePostDetail,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    sharePost,
    addComment,
    getCommentsForPost,
    likeComment,
    currentUser
  } = useSocialStore();

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  if (!selectedPost) return null;

  const comments = getCommentsForPost(selectedPost.id);

  const handleLike = () => {
    if (selectedPost.userInteraction?.isLiked) {
      unlikePost(selectedPost.id);
    } else {
      likePost(selectedPost.id);
    }
  };

  const handleBookmark = () => {
    if (selectedPost.userInteraction?.isBookmarked) {
      unbookmarkPost(selectedPost.id);
    } else {
      bookmarkPost(selectedPost.id);
    }
  };

  const handleShare = () => {
    sharePost(selectedPost.id);
    alert('分享成功！');
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !currentUser) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId: selectedPost.id,
      author: currentUser,
      content: replyTo
        ? `@${replyTo.author.username} ${commentText}`
        : commentText,
      likes: 0,
      isLiked: false,
      replies: [],
      parentId: replyTo?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addComment(selectedPost.id, newComment);
    setCommentText('');
    setReplyTo(null);

    // 滚动到评论区底部
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
    <div className="flex gap-3 py-4 border-b border-gray-100">
      <img
        src={comment.author.avatar}
        alt={comment.author.username}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-800 text-sm">
            {comment.author.username}
          </span>
          {comment.author.level && (
            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
              {comment.author.level}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => likeComment(selectedPost.id, comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <ThumbsUp
              size={14}
              fill={comment.isLiked ? 'currentColor' : 'none'}
            />
            <span>{comment.likes > 0 ? comment.likes : '赞'}</span>
          </button>
          <button
            onClick={() => setReplyTo(comment)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Reply size={14} />
            <span>回复</span>
          </button>
        </div>

        {/* 嵌套回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* 左侧 - 图片展示 */}
        {selectedPost.media.length > 0 && (
          <div className="w-1/2 bg-black flex items-center justify-center relative">
            <img
              src={selectedPost.media[imageIndex].url}
              alt=""
              className="max-w-full max-h-full object-contain"
            />

            {/* 图片导航 */}
            {selectedPost.media.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex(Math.max(0, imageIndex - 1))}
                  disabled={imageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full disabled:opacity-50"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImageIndex(Math.min(selectedPost.media.length - 1, imageIndex + 1))}
                  disabled={imageIndex === selectedPost.media.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full disabled:opacity-50"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {selectedPost.media.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === imageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 右侧 - 内容和评论 */}
        <div className={`${selectedPost.media.length > 0 ? 'w-1/2' : 'w-full'} flex flex-col`}>
          {/* 头部 */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPost.author.avatar}
                alt={selectedPost.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {selectedPost.author.username}
                  </span>
                  {selectedPost.author.isVerified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(selectedPost.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
              <button
                onClick={closePostDetail}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto">
            {/* 帖子内容 */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap mb-4">
                {selectedPost.content}
              </p>

              {/* 营养信息 */}
              {selectedPost.nutrition && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    营养信息
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {selectedPost.nutrition.calories}
                      </div>
                      <div className="text-xs text-gray-600">热量(kcal)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {selectedPost.nutrition.protein}g
                      </div>
                      <div className="text-xs text-gray-600">蛋白质</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {selectedPost.nutrition.carbs}g
                      </div>
                      <div className="text-xs text-gray-600">碳水</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {selectedPost.nutrition.fat}g
                      </div>
                      <div className="text-xs text-gray-600">脂肪</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 互动统计 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors ${
                      selectedPost.userInteraction?.isLiked
                        ? 'text-red-500'
                        : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      size={24}
                      fill={selectedPost.userInteraction?.isLiked ? 'currentColor' : 'none'}
                    />
                    <span className="font-medium">{selectedPost.stats.likes}</span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-600">
                    <MessageCircle size={24} />
                    <span className="font-medium">{selectedPost.stats.comments}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Share2 size={24} />
                    <span className="font-medium">{selectedPost.stats.shares}</span>
                  </button>
                </div>

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    selectedPost.userInteraction?.isBookmarked
                      ? 'text-yellow-500 bg-yellow-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark
                    size={24}
                    fill={selectedPost.userInteraction?.isBookmarked ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                评论 ({comments.length})
              </h3>
              
              {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                  <p>还没有评论，快来抢沙发吧！</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* 评论输入框 */}
          <div className="p-4 border-t border-gray-200">
            {replyTo && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-600">
                  回复 @{replyTo.author.username}
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              {currentUser && (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder={replyTo ? `回复 @${replyTo.author.username}` : '写下你的评论...'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

