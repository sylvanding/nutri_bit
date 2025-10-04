import React, { useState } from 'react';
import { X, Image, Video, Tag, MapPin, Hash, Send, Smile, FileText } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { PostType, PostVisibility, PostMedia, PostTag, PostNutrition } from '../../types/social';

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({ isOpen, onClose }) => {
  const { addPost, currentUser } = useSocialStore();
  
  const [postType, setPostType] = useState<PostType>('meal');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [nutrition, setNutrition] = useState<PostNutrition>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  if (!isOpen) return null;

  const postTypeOptions = [
    { value: 'meal', label: '晒餐', icon: '🍽️', description: '分享您的餐食' },
    { value: 'recipe', label: '菜谱', icon: '👨‍🍳', description: '分享烹饪方法' },
    { value: 'experience', label: '经验', icon: '💡', description: '分享健康经验' },
    { value: 'question', label: '提问', icon: '❓', description: '寻求建议帮助' }
  ];

  const visibilityOptions = [
    { value: 'public', label: '公开', icon: '🌍', description: '所有人可见' },
    { value: 'friends', label: '好友', icon: '👥', description: '仅好友可见' },
    { value: 'private', label: '私密', icon: '🔒', description: '仅自己可见' }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 9) {
      alert('最多只能上传9张图片');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    
    // 生成预览
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      const newTag: PostTag = {
        id: `tag-${Date.now()}`,
        name: tagInput.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter(t => t.id !== tagId));
  };

  const handlePublish = () => {
    if (!content.trim() && imagePreviews.length === 0) {
      alert('请添加内容或图片');
      return;
    }

    if (!currentUser) {
      alert('请先登录');
      return;
    }

    const media: PostMedia[] = imagePreviews.map((preview, index) => ({
      id: `media-${Date.now()}-${index}`,
      type: 'image',
      url: preview,
      thumbnail: preview
    }));

    const newPost = {
      id: `post-${Date.now()}`,
      type: postType,
      author: currentUser,
      content: content.trim(),
      media,
      tags,
      nutrition: showNutrition ? nutrition : undefined,
      visibility,
      status: 'published' as const,
      location: location || undefined,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        views: 0
      },
      userInteraction: {
        isLiked: false,
        isBookmarked: false,
        isShared: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addPost(newPost);
    
    // 重置表单
    setContent('');
    setSelectedImages([]);
    setImagePreviews([]);
    setTags([]);
    setLocation('');
    setShowNutrition(false);
    setNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">发布动态</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 发布类型选择 */}
          <div className="grid grid-cols-4 gap-3">
            {postTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setPostType(option.value as PostType)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  postType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="font-semibold text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              </button>
            ))}
          </div>

          {/* 内容输入 */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`分享您的${postTypeOptions.find(o => o.value === postType)?.label}...`}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length} / 500
            </div>
          </div>

          {/* 图片预览 */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  <Hash size={14} />
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 添加标签 */}
          {tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="添加标签 (最多5个)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Tag size={20} />
              </button>
            </div>
          )}

          {/* 位置 */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
              <MapPin size={20} className="text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="添加位置"
                className="flex-1 focus:outline-none"
              />
            </div>
          </div>

          {/* 营养信息 */}
          {(postType === 'meal' || postType === 'recipe') && (
            <div>
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText size={20} />
                {showNutrition ? '隐藏营养信息' : '添加营养信息'}
              </button>

              {showNutrition && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      热量 (kcal)
                    </label>
                    <input
                      type="number"
                      value={nutrition.calories}
                      onChange={(e) => setNutrition({ ...nutrition, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      蛋白质 (g)
                    </label>
                    <input
                      type="number"
                      value={nutrition.protein}
                      onChange={(e) => setNutrition({ ...nutrition, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      碳水化合物 (g)
                    </label>
                    <input
                      type="number"
                      value={nutrition.carbs}
                      onChange={(e) => setNutrition({ ...nutrition, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      脂肪 (g)
                    </label>
                    <input
                      type="number"
                      value={nutrition.fat}
                      onChange={(e) => setNutrition({ ...nutrition, fat: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 可见范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              可见范围
            </label>
            <div className="grid grid-cols-3 gap-3">
              {visibilityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setVisibility(option.value as PostVisibility)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    visibility === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                <Image size={24} className="text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Smile size={24} className="text-gray-600" />
              </button>
            </div>

            <button
              onClick={handlePublish}
              disabled={!content.trim() && imagePreviews.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              发布
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

