import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Image, Smile, MoreHorizontal, Phone, Video, Info } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { Conversation, DirectMessage as DM, SocialUser } from '../../types/social';

export const DirectMessage: React.FC = () => {
  const { currentUser, conversations, sendMessage } = useSocialStore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<DM[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟对话列表
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      participants: [
        currentUser!,
        {
          id: 'user-1',
          username: '健身达人小李',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          level: '营养专家',
          followers: 12560,
          following: 234,
          posts: 456,
          isVerified: true
        }
      ],
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        sender: currentUser!,
        receiver: {
          id: 'user-1',
          username: '健身达人小李',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          level: '营养专家',
          followers: 12560,
          following: 234,
          posts: 456
        },
        content: '好的，谢谢分享！',
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'conv-2',
      participants: [
        currentUser!,
        {
          id: 'user-2',
          username: '营养师Anna',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
          level: '专业营养师',
          followers: 25680,
          following: 123,
          posts: 678,
          isVerified: true
        }
      ],
      lastMessage: {
        id: 'msg-2',
        conversationId: 'conv-2',
        sender: {
          id: 'user-2',
          username: '营养师Anna',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
          level: '专业营养师',
          followers: 25680,
          following: 123,
          posts: 678
        },
        receiver: currentUser!,
        content: '你的饮食计划制定得很好，继续保持！💪',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      unreadCount: 2,
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  // 模拟消息历史
  const mockMessages: DM[] = [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      sender: {
        id: 'user-1',
        username: '健身达人小李',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        level: '营养专家',
        followers: 12560,
        following: 234,
        posts: 456
      },
      receiver: currentUser!,
      content: '你好！看到你最近的减脂餐分享，做得很不错👍',
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      sender: currentUser!,
      receiver: {
        id: 'user-1',
        username: '健身达人小李',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        level: '营养专家',
        followers: 12560,
        following: 234,
        posts: 456
      },
      content: '谢谢！我一直在学习你的菜谱 😊',
      isRead: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      sender: {
        id: 'user-1',
        username: '健身达人小李',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        level: '营养专家',
        followers: 12560,
        following: 234,
        posts: 456
      },
      receiver: currentUser!,
      content: '加油！有问题随时可以问我',
      isRead: true,
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      sender: currentUser!,
      receiver: {
        id: 'user-1',
        username: '健身达人小李',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        level: '营养专家',
        followers: 12560,
        following: 234,
        posts: 456
      },
      content: '好的，谢谢分享！',
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    if (selectedConversation) {
      // 加载选中对话的消息
      const conversationMessages = mockMessages.filter(
        msg => msg.conversationId === selectedConversation.id
      );
      setMessages(conversationMessages);
      
      // 滚动到底部
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !currentUser) return;

    const otherParticipant = selectedConversation.participants.find(
      p => p.id !== currentUser.id
    )!;

    const newMessage: DM = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      sender: currentUser,
      receiver: otherParticipant,
      content: messageText,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    sendMessage(selectedConversation.id, newMessage);
    setMessageText('');

    // 滚动到底部
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (diffInSeconds < 604800) return date.toLocaleDateString('zh-CN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = mockConversations.filter(conv =>
    conv.participants.some(p =>
      p.id !== currentUser?.id &&
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getOtherParticipant = (conv: Conversation): SocialUser => {
    return conv.participants.find(p => p.id !== currentUser?.id)!;
  };

  return (
    <div className="h-screen bg-white flex">
      {/* 对话列表 */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">私信</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索对话..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => {
            const otherUser = getOtherParticipant(conv);
            const isActive = selectedConversation?.id === conv.id;
            
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-gray-800 truncate ${
                          conv.unreadCount > 0 ? 'font-bold' : ''
                        }`}>
                          {otherUser.username}
                        </span>
                        {otherUser.isVerified && (
                          <span className="text-blue-500 flex-shrink-0">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 truncate ${
                      conv.unreadCount > 0 ? 'font-semibold' : ''
                    }`}>
                      {conv.lastMessage.sender.id === currentUser?.id && '我: '}
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* 对话头部 */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getOtherParticipant(selectedConversation).avatar}
                  alt={getOtherParticipant(selectedConversation).username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {getOtherParticipant(selectedConversation).username}
                    </span>
                    {getOtherParticipant(selectedConversation).isVerified && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">在线</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Info size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map(message => {
                const isOwnMessage = message.sender.id === currentUser?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 px-2">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 消息输入框 */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3 items-end">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Image size={24} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Smile size={24} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入消息..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">选择一个对话开始聊天</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

