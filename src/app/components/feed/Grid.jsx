'use client';

import { useState, useEffect, useRef } from 'react';
import PostItem from './PostItem';
import { getPosts, addPost, updatePost, deletePost } from '@/lib/firebase';
import { analyzeImage, generateImage, generateText } from '@/lib/ai';

// Inline fallback avatars to avoid import issues
const fallbackAvatars = {
  'daniel-linkedin': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-facebook': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMTg3N0YyIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-instagram': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjRTQ0MDVGIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg=='
};

// Inline fallback images
const fallbackImages = {
  'desk-setup': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEyMTIxMiIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSI4MCIgcng9IjQiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSI2MCIgeT0iMTQwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjI0MCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iIzQ0NCIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzU1NSIvPjxyZWN0IHg9IjEyMCIgeT0iNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiM1NTUiLz48L3N2Zz4=',
  'phone-clock': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMwMCIgcng9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyOTAiIHJ4PSIxNSIgZmlsbD0iIzExMSIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iMTUwIiByPSI1MCIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSI3NSIgeTI9IjExMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSIxMDAiIHkyPSIxNTAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHRleHQgeD0iNzUiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0Ij4yOjI0PC90ZXh0Pjwvc3ZnPg=='
};

const Grid = () => {
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [posts, setPosts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    image: '',
    status: 'draft',
    platform: 'linkedin',
    hashtags: []
  });
  
  // Add new states for image generation and analysis
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  
  // Load posts from Firebase
  useEffect(() => {
    const unsubscribe = getPosts((data) => {
      if (data) {
        setPosts(Array.isArray(data) ? data : []);
      } else {
        setPosts([]);
      }
    });
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
  
  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
  };
  
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewPost({
      title: '',
      description: '',
      image: '',
      status: 'draft',
      platform: 'linkedin',
      hashtags: []
    });
  };
  
  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value
    });
  };
  
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    try {
      // Add timestamp, likes, comments
      const completePost = {
        ...newPost,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        author: {
          id: 1, // Default to first profile
          name: 'Daniel Hamilton',
          avatar: fallbackAvatars[`daniel-${newPost.platform}`] || fallbackAvatars['daniel-linkedin'],
          platform: newPost.platform
        },
        hashtags: ['socialmedia', 'marketing', 'digital']
      };
      
      // Save to Firebase
      await addPost(completePost);
      
      // Close modal
      handleCloseCreateModal();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };
  
  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const updatedPost = { ...post, likes: post.likes + 1 };
        await updatePost(postId, updatedPost);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Add image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add image generation handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('Please enter an image prompt');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImage(imagePrompt);
      setNewPost(prev => ({
        ...prev,
        image: imageUrl
      }));
      setImagePrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Add AI analysis handler
  const analyzeImageAndGenerateContent = async () => {
    if (!newPost.image) {
      alert('Please upload or generate an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const content = await analyzeImage(newPost.image);
      setNewPost(prev => ({
        ...prev,
        title: content.title || prev.title,
        description: content.description || prev.description,
        hashtags: content.hashtags || prev.hashtags
      }));
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-lg ${selectedLayout === 'grid' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] hover:bg-[var(--border)]'}`}
            onClick={() => handleLayoutChange('grid')}
          >
            <GridIcon className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-lg ${selectedLayout === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] hover:bg-[var(--border)]'}`}
            onClick={() => handleLayoutChange('list')}
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button 
          className="py-2 px-4 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white flex items-center gap-2"
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>
      
      <div className={`grid gap-4 ${selectedLayout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {posts.map((post) => (
          <PostItem 
            key={post.id} 
            post={post} 
            layout={selectedLayout}
            onLike={() => handleLike(post.id)}
            onDelete={() => handleDelete(post.id)}
          />
        ))}
      </div>
      
      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-[500px] max-w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-xl font-bold mb-4">Create New Post</h3>
            
            <form onSubmit={handleCreatePost}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="platform">
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    value={newPost.platform}
                    onChange={handlePostChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>

                {/* Image Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {newPost.image && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--background)]">
                        <img 
                          src={newPost.image} 
                          alt="Post preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Image Upload & Generation */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
                        >
                          Upload Image
                        </button>
                      </div>
                      
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Enter image prompt..."
                          className="flex-1 px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                        >
                          {isGeneratingImage ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {/* AI Analysis Button */}
                    {newPost.image && (
                      <button
                        type="button"
                        onClick={analyzeImageAndGenerateContent}
                        disabled={isAnalyzing}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <AIIcon className="w-5 h-5" />
                        {isAnalyzing ? 'Analyzing Image...' : 'Analyze Image & Generate Content'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newPost.title}
                    onChange={handlePostChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Enter post title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newPost.description}
                    onChange={handlePostChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
                    placeholder="Enter post description"
                    required
                  />
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {newPost.hashtags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full bg-[var(--background)] text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newPost.status}
                    onChange={handlePostChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded-lg bg-[var(--background)] hover:bg-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Icons
const GridIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const AIIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default Grid; 