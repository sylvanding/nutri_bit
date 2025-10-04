# 社交功能使用说明

## 概述

福宝（NutriBit）的社交功能为用户提供了完整的社区互动体验，包括内容发布、社交互动、用户关注、私信沟通等功能。

## 功能特性

### 1. 内容发布

用户可以发布多种类型的内容：

#### 支持的内容类型
- **晒餐 (Meal)**: 分享餐食照片和营养数据
- **菜谱 (Recipe)**: 分享菜品制作方法和步骤
- **经验 (Experience)**: 分享健康管理经验和心得
- **提问 (Question)**: 提问寻求社区帮助

#### 发布功能
- 📸 图片上传（最多9张）
- ✏️ 文字描述（最多500字）
- 🏷️ 添加标签（最多5个）
- 📍 位置标注
- 🥗 营养数据展示（晒餐和菜谱类型）
- 👁️ 可见范围设置（公开/好友/私密）

### 2. 内容流展示

#### Feed类型
- **关注动态**: 查看关注用户的最新动态
- **推荐内容**: 基于兴趣的智能推荐
- **热门内容**: 高互动量的热门帖子

#### 筛选功能
- 按内容类型筛选（晒餐/菜谱/经验/提问）
- 按话题筛选
- 排序方式（最新/最热/相关）
- 搜索功能（内容/用户/标签）

### 3. 社交互动

#### 互动操作
- ❤️ **点赞**: 为喜欢的内容点赞
- 💬 **评论**: 发表评论和回复（支持嵌套回复）
- 🔖 **收藏**: 收藏优质内容供后续查看
- 📤 **转发**: 分享内容到个人动态
- 👤 **关注**: 关注感兴趣的用户

#### 评论功能
- 发表评论
- 回复评论
- 点赞评论
- 嵌套回复显示

### 4. 用户主页

#### 主页功能
- 个人信息展示
- 统计数据（帖子数/粉丝数/关注数）
- 内容标签页
  - 发布的帖子
  - 喜欢的内容
  - 收藏的内容
- 关注/取消关注
- 发送私信

### 5. 私信功能

#### 私信特性
- 📨 一对一私信
- 💬 实时消息显示
- 🔔 未读消息提醒
- 📷 图片和表情支持
- 📞 语音和视频通话入口

## 技术实现

### 目录结构

```
src/
├── types/
│   └── social.ts                 # 社交功能类型定义
├── stores/
│   └── socialStore.ts            # 社交状态管理
└── components/
    └── social/
        ├── index.ts              # 组件导出
        ├── SocialFeed.tsx        # 内容流主组件
        ├── PostCard.tsx          # 帖子卡片组件
        ├── PostCreateModal.tsx   # 发布内容模态框
        ├── PostDetail.tsx        # 帖子详情和评论
        ├── UserProfile.tsx       # 用户主页
        └── DirectMessage.tsx     # 私信功能
```

### 核心组件

#### SocialFeed
主要的社交内容流组件，包含：
- Feed类型切换（关注/推荐/热门）
- 搜索和筛选面板
- 帖子列表展示
- 侧边栏（热门话题/推荐用户）

#### PostCard
单个帖子的卡片展示，支持：
- 用户信息展示
- 内容和图片展示
- 营养数据展示
- 互动按钮（点赞/评论/分享/收藏）

#### PostCreateModal
内容发布模态框，功能：
- 内容类型选择
- 文字和图片编辑
- 标签和位置添加
- 营养信息录入
- 可见范围设置

#### PostDetail
帖子详情页，包含：
- 完整内容展示
- 图片轮播
- 评论列表
- 评论输入和回复

#### UserProfile
用户主页组件，展示：
- 用户信息和头像
- 统计数据
- 内容标签页
- 关注和私信按钮

#### DirectMessage
私信功能组件，提供：
- 对话列表
- 消息显示
- 消息输入
- 多媒体支持

### 状态管理

使用 Zustand 进行状态管理，主要状态包括：

```typescript
interface SocialState {
  // 数据
  posts: Post[];
  comments: Record<string, Comment[]>;
  topics: Topic[];
  conversations: Conversation[];
  notifications: Notification[];
  currentUser: SocialUser | null;
  followingUsers: SocialUser[];
  
  // UI状态
  activeFeedType: FeedType;
  feedFilter: FeedFilter;
  selectedPost: Post | null;
  isCreatePostModalOpen: boolean;
  isPostDetailOpen: boolean;
  
  // Actions（各种操作方法）
  // ...
}
```

## 使用示例

### 在组件中使用社交功能

```typescript
import { useSocialStore } from '../stores/socialStore';
import { SocialFeed } from '../components/social';

function CommunityPage() {
  return <SocialFeed />;
}
```

### 打开发布模态框

```typescript
const { openCreatePostModal } = useSocialStore();

<button onClick={openCreatePostModal}>
  发布动态
</button>
```

### 查看帖子详情

```typescript
const { openPostDetail } = useSocialStore();

<PostCard 
  post={post} 
  onClick={() => openPostDetail(post)} 
/>
```

### 互动操作

```typescript
const { likePost, addComment, followUser } = useSocialStore();

// 点赞
likePost(postId);

// 评论
addComment(postId, comment);

// 关注
followUser(userId);
```

## 数据模型

### Post (帖子)
```typescript
interface Post {
  id: string;
  type: 'meal' | 'recipe' | 'experience' | 'question';
  author: SocialUser;
  content: string;
  media: PostMedia[];
  tags: PostTag[];
  nutrition?: PostNutrition;
  visibility: 'public' | 'friends' | 'private';
  status: 'draft' | 'pending' | 'published' | 'rejected';
  stats: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  userInteraction?: {
    isLiked: boolean;
    isBookmarked: boolean;
    isShared: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Comment (评论)
```typescript
interface Comment {
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
```

### SocialUser (社交用户)
```typescript
interface SocialUser {
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
```

## 后续优化方向

### 功能增强
1. 实时推送通知
2. 图片编辑功能
3. 视频上传支持
4. 话题页面
5. 用户搜索
6. 高级筛选
7. 内容举报和审核
8. 数据统计和分析

### 性能优化
1. 虚拟滚动
2. 图片懒加载
3. 缓存策略
4. 分页加载
5. 骨架屏加载

### 用户体验
1. 表情选择器
2. @提及功能
3. 草稿箱
4. 定时发布
5. 内容推荐算法优化

## API 集成

当前使用模拟数据，后续需要对接后端API：

```typescript
// 示例API调用
const api = {
  // 帖子相关
  getPosts: (filter: FeedFilter) => Promise<Post[]>,
  createPost: (post: Partial<Post>) => Promise<Post>,
  updatePost: (id: string, updates: Partial<Post>) => Promise<Post>,
  deletePost: (id: string) => Promise<void>,
  
  // 互动相关
  likePost: (postId: string) => Promise<void>,
  commentPost: (postId: string, content: string) => Promise<Comment>,
  sharePost: (postId: string) => Promise<void>,
  bookmarkPost: (postId: string) => Promise<void>,
  
  // 用户关系
  followUser: (userId: string) => Promise<void>,
  unfollowUser: (userId: string) => Promise<void>,
  
  // 私信
  getConversations: () => Promise<Conversation[]>,
  getMessages: (conversationId: string) => Promise<DirectMessage[]>,
  sendMessage: (conversationId: string, content: string) => Promise<DirectMessage>
};
```

## 注意事项

1. **性能考虑**: 大量图片和内容需要做好性能优化
2. **安全性**: 内容审核和敏感信息过滤
3. **隐私保护**: 用户隐私设置和数据保护
4. **可访问性**: 支持键盘操作和屏幕阅读器
5. **响应式设计**: 适配不同屏幕尺寸

## 问题反馈

如有问题或建议，请联系开发团队。

