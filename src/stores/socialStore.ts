import { create } from 'zustand';
import { 
  Post, 
  Comment, 
  Topic, 
  DirectMessage, 
  Conversation,
  Notification,
  SocialUser,
  PostType,
  PostVisibility,
  FeedFilter,
  FeedType,
  PostMedia,
  FollowMealOrder,
  DeliveryType,
  PortionSize,
  DeliveryTimeSlot
} from '../types/social';

interface SocialState {
  // 数据
  posts: Post[];
  comments: Record<string, Comment[]>;
  topics: Topic[];
  conversations: Conversation[];
  notifications: Notification[];
  currentUser: SocialUser | null;
  followingUsers: SocialUser[];
  followMealOrders: FollowMealOrder[];
  
  // UI状态
  activeFeedType: FeedType;
  feedFilter: FeedFilter;
  selectedPost: Post | null;
  isCreatePostModalOpen: boolean;
  isPostDetailOpen: boolean;
  isFollowMealModalOpen: boolean;
  selectedFollowMealPost: Post | null;
  
  // Actions - 帖子管理
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  getPostById: (postId: string) => Post | undefined;
  
  // Actions - 互动
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  unbookmarkPost: (postId: string) => void;
  sharePost: (postId: string) => void;
  
  // Actions - 评论
  addComment: (postId: string, comment: Comment) => void;
  deleteComment: (postId: string, commentId: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  getCommentsForPost: (postId: string) => Comment[];
  
  // Actions - 关注
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  
  // Actions - 话题
  followTopic: (topicId: string) => void;
  unfollowTopic: (topicId: string) => void;
  
  // Actions - 私信
  sendMessage: (conversationId: string, message: DirectMessage) => void;
  markMessageAsRead: (messageId: string) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  
  // Actions - 通知
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadNotificationCount: () => number;
  
  // Actions - UI
  setActiveFeedType: (type: FeedType) => void;
  setFeedFilter: (filter: FeedFilter) => void;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  
  // Actions - 一键跟吃
  openFollowMealModal: (post: Post) => void;
  closeFollowMealModal: () => void;
  createFollowMealOrder: (order: Omit<FollowMealOrder, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  getFollowMealOrders: () => FollowMealOrder[];
  
  // Actions - 获取过滤后的帖子
  getFilteredPosts: () => Post[];
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // 初始状态
  posts: generateMockPosts(),
  comments: {},
  topics: generateMockTopics(),
  conversations: [],
  notifications: [],
  currentUser: {
    id: 'current-user',
    username: '我',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
    bio: '健康生活，从每一餐开始',
    level: '营养达人',
    followers: 234,
    following: 156,
    posts: 89,
    membershipTier: 'pro',
  },
  followingUsers: [],
  followMealOrders: [],
  
  activeFeedType: 'following',
  feedFilter: {},
  selectedPost: null,
  isCreatePostModalOpen: false,
  isPostDetailOpen: false,
  isFollowMealModalOpen: false,
  selectedFollowMealPost: null,
  
  // 帖子管理
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts]
  })),
  
  updatePost: (postId, updates) => set((state) => ({
    posts: state.posts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    )
  })),
  
  deletePost: (postId) => set((state) => ({
    posts: state.posts.filter(post => post.id !== postId)
  })),
  
  getPostById: (postId) => {
    return get().posts.find(post => post.id === postId);
  },
  
  // 互动功能
  likePost: (postId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: { ...post.stats, likes: post.stats.likes + 1 },
          userInteraction: { ...post.userInteraction, isLiked: true }
        };
      }
      return post;
    })
  })),
  
  unlikePost: (postId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: { ...post.stats, likes: Math.max(0, post.stats.likes - 1) },
          userInteraction: { ...post.userInteraction, isLiked: false }
        };
      }
      return post;
    })
  })),
  
  bookmarkPost: (postId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: { ...post.stats, bookmarks: post.stats.bookmarks + 1 },
          userInteraction: { ...post.userInteraction, isBookmarked: true }
        };
      }
      return post;
    })
  })),
  
  unbookmarkPost: (postId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: { ...post.stats, bookmarks: Math.max(0, post.stats.bookmarks - 1) },
          userInteraction: { ...post.userInteraction, isBookmarked: false }
        };
      }
      return post;
    })
  })),
  
  sharePost: (postId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: { ...post.stats, shares: post.stats.shares + 1 },
          userInteraction: { ...post.userInteraction, isShared: true }
        };
      }
      return post;
    })
  })),
  
  // 评论功能
  addComment: (postId, comment) => set((state) => {
    const existingComments = state.comments[postId] || [];
    return {
      comments: {
        ...state.comments,
        [postId]: [...existingComments, comment]
      },
      posts: state.posts.map(post => 
        post.id === postId 
          ? { ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } }
          : post
      )
    };
  }),
  
  deleteComment: (postId, commentId) => set((state) => ({
    comments: {
      ...state.comments,
      [postId]: (state.comments[postId] || []).filter(c => c.id !== commentId)
    },
    posts: state.posts.map(post => 
      post.id === postId 
        ? { ...post, stats: { ...post.stats, comments: Math.max(0, post.stats.comments - 1) } }
        : post
    )
  })),
  
  likeComment: (postId, commentId) => set((state) => ({
    comments: {
      ...state.comments,
      [postId]: (state.comments[postId] || []).map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1, isLiked: true }
          : comment
      )
    }
  })),
  
  getCommentsForPost: (postId) => {
    return get().comments[postId] || [];
  },
  
  // 关注功能
  followUser: (userId) => set((state) => {
    const user = state.posts.find(p => p.author.id === userId)?.author;
    if (user && !state.followingUsers.find(u => u.id === userId)) {
      return {
        followingUsers: [...state.followingUsers, { ...user, isFollowing: true }],
        posts: state.posts.map(post => 
          post.author.id === userId 
            ? { ...post, author: { ...post.author, isFollowing: true, followers: post.author.followers + 1 } }
            : post
        )
      };
    }
    return state;
  }),
  
  unfollowUser: (userId) => set((state) => ({
    followingUsers: state.followingUsers.filter(u => u.id !== userId),
    posts: state.posts.map(post => 
      post.author.id === userId 
        ? { ...post, author: { ...post.author, isFollowing: false, followers: Math.max(0, post.author.followers - 1) } }
        : post
    )
  })),
  
  isFollowing: (userId) => {
    return get().followingUsers.some(u => u.id === userId);
  },
  
  // 话题功能
  followTopic: (topicId) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId
        ? { ...topic, isFollowing: true, followers: topic.followers + 1 }
        : topic
    )
  })),
  
  unfollowTopic: (topicId) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId
        ? { ...topic, isFollowing: false, followers: Math.max(0, topic.followers - 1) }
        : topic
    )
  })),
  
  // 私信功能
  sendMessage: (conversationId, message) => set((state) => {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (conversation) {
      return {
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: message, updatedAt: message.createdAt }
            : c
        )
      };
    }
    return state;
  }),
  
  markMessageAsRead: (messageId) => set((state) => ({
    conversations: state.conversations.map(conv => ({
      ...conv,
      unreadCount: conv.lastMessage.id === messageId ? 0 : conv.unreadCount
    }))
  })),
  
  getConversation: (conversationId) => {
    return get().conversations.find(c => c.id === conversationId);
  },
  
  // 通知功能
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  markNotificationAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    )
  })),
  
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  getUnreadNotificationCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },
  
  // UI 控制
  setActiveFeedType: (type) => set({ activeFeedType: type }),
  
  setFeedFilter: (filter) => set({ feedFilter: filter }),
  
  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),
  
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),
  
  openPostDetail: (post) => set({ selectedPost: post, isPostDetailOpen: true }),
  
  closePostDetail: () => set({ selectedPost: null, isPostDetailOpen: false }),
  
  // 一键跟吃功能
  openFollowMealModal: (post) => set({ 
    selectedFollowMealPost: post, 
    isFollowMealModalOpen: true 
  }),
  
  closeFollowMealModal: () => set({ 
    selectedFollowMealPost: null, 
    isFollowMealModalOpen: false 
  }),
  
  createFollowMealOrder: (orderData) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const order: FollowMealOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      userId: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      followMealOrders: [order, ...state.followMealOrders],
      // 增加帖子的跟吃计数
      posts: state.posts.map(post => 
        post.id === orderData.postId && post.followMealInfo
          ? {
              ...post,
              followMealInfo: {
                ...post.followMealInfo,
                followCount: post.followMealInfo.followCount + 1
              }
            }
          : post
      )
    }));

    // 模拟支付成功后的通知
    setTimeout(() => {
      set((state) => ({
        followMealOrders: state.followMealOrders.map(o =>
          o.id === order.id ? { ...o, status: 'paid' } : o
        )
      }));
      
      // 添加通知
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'system',
        actor: currentUser,
        content: '订单支付成功！您的美食正在准备中...',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      get().addNotification(notification);
    }, 1000);
  },
  
  getFollowMealOrders: () => get().followMealOrders,
  
  // 获取过滤后的帖子
  getFilteredPosts: () => {
    const { posts, activeFeedType, feedFilter, followingUsers } = get();
    let filtered = [...posts];
    
    // 根据feed类型过滤
    if (activeFeedType === 'following') {
      const followingIds = followingUsers.map(u => u.id);
      filtered = filtered.filter(post => followingIds.includes(post.author.id));
    } else if (activeFeedType === 'trending') {
      filtered = filtered.sort((a, b) => 
        (b.stats.likes + b.stats.comments + b.stats.shares) - 
        (a.stats.likes + a.stats.comments + a.stats.shares)
      );
    }
    
    // 根据帖子类型过滤
    if (feedFilter.postType) {
      filtered = filtered.filter(post => post.type === feedFilter.postType);
    }
    
    // 根据话题过滤
    if (feedFilter.topicId) {
      filtered = filtered.filter(post => 
        post.tags.some(tag => tag.id === feedFilter.topicId)
      );
    }
    
    // 排序
    if (feedFilter.sortBy === 'latest') {
      filtered = filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (feedFilter.sortBy === 'popular') {
      filtered = filtered.sort((a, b) => b.stats.likes - a.stats.likes);
    }
    
    return filtered;
  }
}));

// 生成模拟帖子数据
function generateMockPosts(): Post[] {
  const mockUsers: SocialUser[] = [
    {
      id: 'user-1',
      username: '健身达人小李',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      bio: '健身5年，营养师认证',
      level: '营养专家',
      followers: 12560,
      following: 234,
      posts: 456,
      isVerified: true,
      membershipTier: 'pro'
    },
    {
      id: 'user-2',
      username: '减脂小能手',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      bio: '成功减重30斤',
      level: '减脂达人',
      followers: 8420,
      following: 567,
      posts: 234,
      membershipTier: 'plus'
    },
    {
      id: 'user-3',
      username: '营养师Anna',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
      bio: '注册营养师，健康科普',
      level: '专业营养师',
      followers: 25680,
      following: 123,
      posts: 678,
      isVerified: true,
      membershipTier: 'pro'
    }
  ];
  
  const posts: Post[] = [
    {
      id: 'post-1',
      type: 'meal',
      author: mockUsers[0],
      content: '今天的减脂午餐！蒜蓉西兰花炒虾仁 + 糙米饭，高蛋白低脂肪，营养满分💪 #健康饮食 #减脂餐',
      media: [
        {
          id: 'media-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-1', name: '健康饮食', color: '#10b981' },
        { id: 'tag-2', name: '减脂餐', color: '#3b82f6' }
      ],
      nutrition: {
        calories: 420,
        protein: 45,
        carbs: 38,
        fat: 12,
        sodium: 580,
        fiber: 8,
        mealType: 'lunch'
      },
      followMealInfo: {
        canFollow: true,
        followCount: 45,
        difficulty: 'easy',
        cookingTime: 15,
        options: [
          {
            type: 'fresh-pack',
            name: '净菜包',
            description: '预处理食材 + 调料包 + 菜谱，享受烹饪乐趣',
            icon: '🥬',
            basePrice: 28.80,
            preparationTime: '15分钟',
            features: ['新鲜食材预处理', '调料包配齐', '详细烹饪步骤', '适合享受烹饪']
          },
          {
            type: 'semi-prepared',
            name: '半成品',
            description: '部分预制，简单加热即可享用',
            icon: '🍱',
            basePrice: 35.80,
            preparationTime: '5分钟',
            features: ['部分预制好', '简单加工', '快速上桌', '省时便捷']
          },
          {
            type: 'ready-to-eat',
            name: '成品外卖',
            description: '即食热食，直接享用美味',
            icon: '🚚',
            basePrice: 42.80,
            preparationTime: '即食',
            features: ['专业大厨制作', '即食热食', '无需烹饪', '送货上门']
          }
        ]
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 256,
        comments: 34,
        shares: 12,
        bookmarks: 45,
        views: 1230
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-2',
      type: 'recipe',
      author: mockUsers[2],
      content: '【营养师推荐】超简单的低卡鸡胸肉做法！👩‍🍳 保证嫩滑多汁，绝不柴！做法在评论区～',
      media: [
        {
          id: 'media-2',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1588347818036-4b2a3e0f7d0e?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1588347818036-4b2a3e0f7d0e?w=400&q=80'
        },
        {
          id: 'media-3',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-3', name: '菜谱', color: '#f59e0b' },
        { id: 'tag-4', name: '高蛋白', color: '#ef4444' }
      ],
      relatedRecipeId: 'recipe-001',
      relatedRecipeName: '香煎鸡胸肉',
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 489,
        comments: 67,
        shares: 89,
        bookmarks: 156,
        views: 3450
      },
      userInteraction: {
        isLiked: true,
        isBookmarked: true,
        isShared: false
      },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-3',
      type: 'experience',
      author: mockUsers[1],
      content: '减脂3个月成功瘦了15斤！分享一下我的心路历程和经验💪✨\n\n1. 控制热量但不节食\n2. 高蛋白饮食\n3. 适量运动\n4. 充足睡眠\n\n坚持就是胜利！',
      media: [
        {
          id: 'media-4',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-5', name: '减脂经验', color: '#8b5cf6' },
        { id: 'tag-6', name: '健康生活', color: '#10b981' }
      ],
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 678,
        comments: 123,
        shares: 45,
        bookmarks: 234,
        views: 4560
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-4',
      type: 'meal',
      author: mockUsers[2],
      content: '早餐仪式感拉满！🌅 牛油果吐司配水波蛋，再来一杯鲜榨橙汁，元气满满的一天开始啦～ 早餐真的很重要，千万不要跳过哦！',
      media: [
        {
          id: 'media-5',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-7', name: '早餐', color: '#fbbf24' },
        { id: 'tag-1', name: '健康饮食', color: '#10b981' }
      ],
      nutrition: {
        calories: 385,
        protein: 18,
        carbs: 42,
        fat: 16,
        sodium: 420,
        fiber: 9,
        mealType: 'breakfast'
      },
      followMealInfo: {
        canFollow: true,
        followCount: 67,
        difficulty: 'easy',
        cookingTime: 10,
        options: [
          {
            type: 'fresh-pack',
            name: '净菜包',
            description: '新鲜牛油果 + 全麦吐司 + 鸡蛋 + 橙子',
            icon: '🥬',
            basePrice: 22.80,
            preparationTime: '10分钟',
            features: ['新鲜食材', '营养早餐', '快手制作', '元气满满']
          },
          {
            type: 'ready-to-eat',
            name: '成品外卖',
            description: '现做现送，保证新鲜美味',
            icon: '🚚',
            basePrice: 32.80,
            preparationTime: '即食',
            features: ['专业制作', '现做现送', '热乎美味', '无需烹饪']
          }
        ]
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 412,
        comments: 28,
        shares: 15,
        bookmarks: 67,
        views: 2150
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-5',
      type: 'question',
      author: {
        id: 'user-4',
        username: '新手小白',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
        bio: '刚开始健康饮食之旅',
        level: '初学者',
        followers: 45,
        following: 234,
        posts: 12,
        membershipTier: 'free'
      },
      content: '求助！晚上总是忍不住想吃宵夜怎么办？😭 每次到了晚上9点就特别想吃东西，有什么好的办法可以控制吗？大家都是怎么做的呀？',
      media: [],
      tags: [
        { id: 'tag-8', name: '求助', color: '#f97316' },
        { id: 'tag-9', name: '饮食习惯', color: '#06b6d4' }
      ],
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 89,
        comments: 56,
        shares: 3,
        bookmarks: 12,
        views: 890
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-6',
      type: 'recipe',
      author: {
        id: 'user-5',
        username: '厨房小仙女',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
        bio: '爱做菜的营养学学生',
        level: '美食博主',
        followers: 5420,
        following: 678,
        posts: 189,
        membershipTier: 'plus'
      },
      content: '【零失败】超好吃的藜麦沙拉！🥗 做法超级简单，适合上班族，可以提前做好带去公司当午餐～\n\n📝材料：\n- 藜麦 100g\n- 圣女果 10颗\n- 黄瓜 半根\n- 紫甘蓝 适量\n- 鸡胸肉 100g\n- 橄榄油、柠檬汁、黑胡椒\n\n详细做法看图片！',
      media: [
        {
          id: 'media-6',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-3', name: '菜谱', color: '#f59e0b' },
        { id: 'tag-10', name: '沙拉', color: '#84cc16' },
        { id: 'tag-11', name: '轻食', color: '#22c55e' }
      ],
      relatedRecipeId: 'recipe-002',
      relatedRecipeName: '藜麦蔬菜沙拉',
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 567,
        comments: 89,
        shares: 123,
        bookmarks: 234,
        views: 4230
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: true,
        isShared: false
      },
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-7',
      type: 'meal',
      author: mockUsers[0],
      content: '健身后的增肌餐！💪 牛排配红薯和芦笋，蛋白质碳水一次到位。训练日就要吃得好才能长得好！',
      media: [
        {
          id: 'media-7',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-12', name: '增肌', color: '#dc2626' },
        { id: 'tag-4', name: '高蛋白', color: '#ef4444' },
        { id: 'tag-13', name: '健身餐', color: '#f59e0b' }
      ],
      nutrition: {
        calories: 580,
        protein: 52,
        carbs: 45,
        fat: 18,
        sodium: 720,
        fiber: 7,
        mealType: 'dinner'
      },
      followMealInfo: {
        canFollow: true,
        followCount: 156,
        difficulty: 'medium',
        cookingTime: 25,
        options: [
          {
            type: 'fresh-pack',
            name: '净菜包',
            description: '优质牛排 + 红薯 + 芦笋 + 调料',
            icon: '🥬',
            basePrice: 58.80,
            preparationTime: '25分钟',
            features: ['优质牛排', '新鲜蔬菜', '健身专用', '高蛋白配比']
          },
          {
            type: 'semi-prepared',
            name: '半成品',
            description: '牛排已腌制，蔬菜预处理',
            icon: '🍱',
            basePrice: 68.80,
            preparationTime: '10分钟',
            features: ['牛排已腌制', '蔬菜预处理', '简单烹饪', '省时美味']
          },
          {
            type: 'ready-to-eat',
            name: '成品外卖',
            description: '专业大厨制作，五星级品质',
            icon: '🚚',
            basePrice: 78.80,
            preparationTime: '即食',
            features: ['专业制作', '五星品质', '即食美味', '营养均衡']
          }
        ]
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 823,
        comments: 67,
        shares: 34,
        bookmarks: 156,
        views: 5670
      },
      userInteraction: {
        isLiked: true,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-8',
      type: 'experience',
      author: {
        id: 'user-6',
        username: '养生青年',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
        bio: '90后养生达人',
        level: '健康生活家',
        followers: 3420,
        following: 890,
        posts: 234,
        membershipTier: 'plus'
      },
      content: '分享一个我坚持了半年的健康习惯！🌟\n\n每天早上起床后先喝一杯温水，然后吃早餐。晚上8点后不吃任何食物，只喝水。\n\n这个习惯让我：\n✅ 改善了消化\n✅ 睡眠质量提高\n✅ 皮肤状态变好\n✅ 体重稳定下降\n\n最重要的是，身体变得更轻盈了！推荐大家试试～',
      media: [],
      tags: [
        { id: 'tag-6', name: '健康生活', color: '#10b981' },
        { id: 'tag-14', name: '好习惯', color: '#3b82f6' }
      ],
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 1234,
        comments: 189,
        shares: 234,
        bookmarks: 456,
        views: 8900
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: true,
        isShared: false
      },
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-9',
      type: 'meal',
      author: {
        id: 'user-7',
        username: '素食主义者',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
        bio: '素食5年，健康满分',
        level: '素食达人',
        followers: 2340,
        following: 456,
        posts: 178,
        membershipTier: 'plus'
      },
      content: '今日素食分享！🌱 香菇炒青菜配糙米饭，简单但营养均衡。素食也能吃得很健康很美味！\n\n很多人担心素食营养不够，其实只要搭配得当，完全没问题。豆制品、坚果、全谷物都是很好的蛋白质来源～',
      media: [
        {
          id: 'media-8',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-15', name: '素食', color: '#22c55e' },
        { id: 'tag-1', name: '健康饮食', color: '#10b981' }
      ],
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 58,
        fat: 6,
        sodium: 380,
        fiber: 12,
        mealType: 'lunch'
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 345,
        comments: 45,
        shares: 23,
        bookmarks: 78,
        views: 1890
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-10',
      type: 'recipe',
      author: mockUsers[2],
      content: '【营养师独家配方】低糖低脂的香蕉燕麦杯！🍌\n\n适合减脂期当早餐或加餐，饱腹感超强！而且可以提前做好，早上拿出来就能吃，超级方便～\n\n配方和步骤都在图片里啦，做法超简单，新手也能零失败！',
      media: [
        {
          id: 'media-9',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-3', name: '菜谱', color: '#f59e0b' },
        { id: 'tag-16', name: '低糖', color: '#8b5cf6' },
        { id: 'tag-2', name: '减脂餐', color: '#3b82f6' }
      ],
      relatedRecipeId: 'recipe-003',
      relatedRecipeName: '香蕉燕麦杯',
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 892,
        comments: 134,
        shares: 267,
        bookmarks: 445,
        views: 6780
      },
      userInteraction: {
        isLiked: true,
        isBookmarked: true,
        isShared: false
      },
      createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-11',
      type: 'question',
      author: {
        id: 'user-8',
        username: '迷茫的减脂者',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
        bio: '努力减脂中',
        level: '新手',
        followers: 23,
        following: 145,
        posts: 8,
        membershipTier: 'free'
      },
      content: '碳水化合物到底该不该吃？🤔 看到有人说减脂要低碳，但也有人说不能完全不吃碳水。到底应该怎么做呢？求各位大神指点！',
      media: [],
      tags: [
        { id: 'tag-8', name: '求助', color: '#f97316' },
        { id: 'tag-17', name: '营养咨询', color: '#ec4899' }
      ],
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 67,
        comments: 89,
        shares: 12,
        bookmarks: 34,
        views: 1234
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-12',
      type: 'meal',
      author: mockUsers[1],
      content: '办公室便当分享！🍱 自己做的三色糙米饭配照烧鸡腿、西兰花和煎蛋，比外卖健康多了，还省钱！\n\n强烈建议大家自己带饭，不仅能控制油盐，还能保证营养均衡。周末花2小时做好一周的，超方便～',
      media: [
        {
          id: 'media-10',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-18', name: '便当', color: '#f59e0b' },
        { id: 'tag-1', name: '健康饮食', color: '#10b981' },
        { id: 'tag-19', name: '上班族', color: '#06b6d4' }
      ],
      nutrition: {
        calories: 485,
        protein: 38,
        carbs: 52,
        fat: 14,
        sodium: 620,
        fiber: 8,
        mealType: 'lunch'
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 456,
        comments: 56,
        shares: 45,
        bookmarks: 123,
        views: 2890
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-13',
      type: 'experience',
      author: {
        id: 'user-9',
        username: '跑步爱好者',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9',
        bio: '马拉松完赛者',
        level: '运动达人',
        followers: 4560,
        following: 678,
        posts: 267,
        membershipTier: 'pro'
      },
      content: '跑马拉松这么吃，才能跑得更远！🏃‍♂️\n\n作为一个跑了5年马拉松的人，分享一下我的饮食经验：\n\n赛前：\n- 提前3天开始碳水补充\n- 赛前1天多吃复合碳水（全麦面包、意面）\n- 比赛当天早餐：香蕉+能量棒\n\n赛后：\n- 及时补充蛋白质和碳水\n- 多喝水，注意电解质平衡\n\n坚持科学饮食，PB指日可待！💪',
      media: [
        {
          id: 'media-11',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-20', name: '运动营养', color: '#ef4444' },
        { id: 'tag-21', name: '马拉松', color: '#f59e0b' },
        { id: 'tag-6', name: '健康生活', color: '#10b981' }
      ],
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 1567,
        comments: 234,
        shares: 189,
        bookmarks: 567,
        views: 12340
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: true,
        isShared: false
      },
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-14',
      type: 'recipe',
      author: {
        id: 'user-10',
        username: '烘焙小能手',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10',
        bio: '健康烘焙爱好者',
        level: '美食创作者',
        followers: 6780,
        following: 890,
        posts: 345,
        membershipTier: 'pro'
      },
      content: '无糖无油的香蕉松饼来啦！🥞\n\n减脂期也能吃的松饼！只需要3种材料就能做，而且超级好吃！\n\n材料：\n🍌 香蕉 2根\n🥚 鸡蛋 2个  \n🌾 燕麦粉 50g\n\n做法：\n1. 香蕉压成泥\n2. 加入鸡蛋和燕麦粉搅拌均匀\n3. 不粘锅小火煎至两面金黄\n4. 可以搭配酸奶和水果\n\n每一口都是幸福！❤️',
      media: [
        {
          id: 'media-12',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-3', name: '菜谱', color: '#f59e0b' },
        { id: 'tag-22', name: '烘焙', color: '#ec4899' },
        { id: 'tag-16', name: '低糖', color: '#8b5cf6' }
      ],
      relatedRecipeId: 'recipe-004',
      relatedRecipeName: '香蕉燕麦松饼',
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 2134,
        comments: 345,
        shares: 456,
        bookmarks: 890,
        views: 15670
      },
      userInteraction: {
        isLiked: true,
        isBookmarked: true,
        isShared: true
      },
      createdAt: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-15',
      type: 'meal',
      author: {
        id: 'user-11',
        username: '健康妈妈',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user11',
        bio: '两个孩子的妈妈',
        level: '营养专家',
        followers: 8920,
        following: 456,
        posts: 567,
        isVerified: true,
        membershipTier: 'pro'
      },
      content: '给孩子做的营养晚餐！🍽️ 三文鱼配土豆泥和时蔬，营养全面又好吃，孩子光盘了！\n\nDHA对孩子大脑发育很重要，所以我每周都会给孩子做2-3次深海鱼。搭配多种颜色的蔬菜，保证营养均衡～\n\n#儿童营养 #健康育儿',
      media: [
        {
          id: 'media-13',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80'
        }
      ],
      tags: [
        { id: 'tag-23', name: '儿童营养', color: '#f472b6' },
        { id: 'tag-24', name: '家庭餐', color: '#fb923c' },
        { id: 'tag-1', name: '健康饮食', color: '#10b981' }
      ],
      nutrition: {
        calories: 450,
        protein: 32,
        carbs: 42,
        fat: 16,
        sodium: 520,
        fiber: 6,
        mealType: 'dinner'
      },
      visibility: 'public',
      status: 'published',
      stats: {
        likes: 1890,
        comments: 267,
        shares: 178,
        bookmarks: 445,
        views: 11230
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return posts;
}

// 生成模拟话题数据
function generateMockTopics(): Topic[] {
  return [
    {
      id: 'topic-1',
      name: '健康饮食',
      description: '分享健康饮食经验和食谱',
      icon: '🥗',
      posts: 12560,
      followers: 8920,
      trending: true
    },
    {
      id: 'topic-2',
      name: '减脂增肌',
      description: '减脂增肌的饮食和训练分享',
      icon: '💪',
      posts: 8430,
      followers: 6780,
      trending: true
    },
    {
      id: 'topic-3',
      name: '营养科普',
      description: '科学的营养知识分享',
      icon: '📚',
      posts: 5670,
      followers: 4590
    },
    {
      id: 'topic-4',
      name: '美食探店',
      description: '发现健康美食好去处',
      icon: '🍽️',
      posts: 9870,
      followers: 7650,
      trending: true
    }
  ];
}

