// 社交功能类型定义

// 营养数据接口
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fiber?: number;
}

// 用户基本信息
export interface SocialUser {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  level?: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing?: boolean;
  isVerified?: boolean;
  membershipTier?: 'free' | 'plus' | 'pro';
}

// 帖子类型
export type PostType = 'meal' | 'recipe' | 'experience' | 'question';

// 帖子可见范围
export type PostVisibility = 'public' | 'friends' | 'private';

// 帖子状态
export type PostStatus = 'draft' | 'pending' | 'published' | 'rejected';

// 帖子标签
export interface PostTag {
  id: string;
  name: string;
  color?: string;
}

// 营养数据关联
export interface PostNutrition extends NutritionData {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize?: string;
}

// 帖子媒体
export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

// 帖子内容
export interface Post {
  id: string;
  type: PostType;
  author: SocialUser;
  content: string;
  media: PostMedia[];
  tags: PostTag[];
  nutrition?: PostNutrition;
  visibility: PostVisibility;
  status: PostStatus;
  location?: string;
  relatedRecipeId?: string;
  relatedRecipeName?: string;
  
  // 互动数据
  stats: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  
  // 当前用户互动状态
  userInteraction?: {
    isLiked: boolean;
    isBookmarked: boolean;
    isShared: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

// 评论
export interface Comment {
  id: string;
  postId: string;
  author: SocialUser;
  content: string;
  media?: PostMedia[];
  likes: number;
  isLiked?: boolean;
  replies: Comment[];
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// 话题
export interface Topic {
  id: string;
  name: string;
  description: string;
  icon?: string;
  cover?: string;
  posts: number;
  followers: number;
  isFollowing?: boolean;
  trending?: boolean;
}

// 内容流类型
export type FeedType = 'following' | 'recommended' | 'trending' | 'topic';

// 内容流过滤器
export interface FeedFilter {
  type?: FeedType;
  postType?: PostType;
  topicId?: string;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'latest' | 'popular' | 'relevant';
}

// 私信
export interface DirectMessage {
  id: string;
  conversationId: string;
  sender: SocialUser;
  receiver: SocialUser;
  content: string;
  media?: PostMedia[];
  isRead: boolean;
  createdAt: string;
}

// 会话
export interface Conversation {
  id: string;
  participants: SocialUser[];
  lastMessage: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

// 通知类型
export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'mention' 
  | 'share'
  | 'system';

// 通知
export interface Notification {
  id: string;
  type: NotificationType;
  actor: SocialUser;
  target?: Post | Comment;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// 用户统计
export interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  postsThisWeek: number;
  likesThisWeek: number;
}

// 关注关系
export interface FollowRelationship {
  followerId: string;
  followingId: string;
  createdAt: string;
}

