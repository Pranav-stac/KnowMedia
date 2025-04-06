'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { addPost, getProfiles } from '@/lib/firebase';
import { generateSocialMediaPost, generateImage } from '@/lib/ai';

const CreatePost = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'linkedin',
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  
  // Fetch profiles for author selection
  useEffect(() => {
    const unsubscribe = getProfiles((data) => {
      if (data && data.length > 0) {
        setProfiles(data);
        setSelectedProfile(data[0]);
        setFormData(prev => ({
          ...prev,
          platform: data[0].platform
        }));
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If platform changes, update selected profile
    if (name === 'platform') {
      const matchingProfile = profiles.find(p => p.platform === value);
      if (matchingProfile) {
        setSelectedProfile(matchingProfile);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProfile) {
      alert('Please select a profile first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const post = {
        ...formData,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        author: {
          id: selectedProfile.id,
          name: selectedProfile.name,
          avatar: selectedProfile.avatar,
          platform: selectedProfile.platform
        },
        hashtags: formData.description?.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [],
        image: generatedImage || null
      };
      
      const newPost = await addPost(post);
      router.push('/feed');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaModalOpen = () => {
    setIsMediaModalOpen(true);
  };

  const handleMediaModalClose = () => {
    setIsMediaModalOpen(false);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Create Post" />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
                <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Author Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="profile">
                        Profile
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profiles.map((profile) => (
                          <div
                            key={profile.id}
                            className={`
                              p-4 border rounded-lg cursor-pointer flex items-center gap-3
                              ${selectedProfile?.id === profile.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                                : 'border-[var(--border)] hover:border-[var(--primary)]/50'}
                            `}
                            onClick={() => {
                              setSelectedProfile(profile);
                              setFormData(prev => ({
                                ...prev,
                                platform: profile.platform
                              }));
                            }}
                          >
                            <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                              <div className="absolute inset-0" style={{ backgroundColor: profile.color }}></div>
                              {profile.avatar && (
                                <Image 
                                  src={profile.avatar} 
                                  alt={profile.name} 
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                  unoptimized={profile.avatar.startsWith('data:')}
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{profile.name}</p>
                              <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Content Generator */}
                    <div className="border border-[var(--border)] rounded-lg p-3">
                      <h3 className="font-medium mb-2">AI Content Assistant</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          placeholder="Describe the post you want to create..."
                          className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        <button
                          type="button"
                          className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                          disabled={!promptInput.trim() || isGenerating}
                          onClick={async () => {
                            if (!promptInput.trim() || isGenerating) return;
                            
                            setIsGenerating(true);
                            try {
                              const result = await generateSocialMediaPost(
                                promptInput,
                                selectedProfile?.platform || 'linkedin',
                                'professional'
                              );

                              setFormData(prev => ({
                                ...prev,
                                title: result.title,
                                description: result.description
                              }));

                              if (result.image) {
                                setGeneratedImage(result.image);
                              }
                            } catch (error) {
                              console.error('Error generating content:', error);
                              alert('Failed to generate content. Please try again.');
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                        >
                          {isGenerating ? 
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Writing...</span>
                            </span> 
                            : 'Generate Content'
                          }
                        </button>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="title">
                        Title
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="Enter post title"
                        required
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[200px]"
                        placeholder="Enter post description"
                        required
                      ></textarea>
                    </div>

                    {/* Media Button */}
                    <div>
                      <button
                        type="button"
                        onClick={handleMediaModalOpen}
                        className="w-full py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg flex items-center justify-center gap-2"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Add Media</span>
                      </button>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="status">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    
                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => router.push('/feed')}
                        className="px-6 py-3 rounded-lg bg-[var(--background)] hover:bg-[var(--border)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors disabled:opacity-70"
                      >
                        {isLoading ? 'Creating...' : 'Create Post'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
                <h3 className="font-medium text-sm mb-3">Preview</h3>
                <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                  {/* Platform-specific header */}
                  <div 
                    className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-slate-700"
                    style={{ 
                      backgroundColor: selectedProfile?.color ? `${selectedProfile.color}22` : 'transparent',
                      borderTopColor: selectedProfile?.color || 'transparent',
                      borderTopWidth: '3px'
                    }}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      {selectedProfile?.avatar && (
                        <Image 
                          src={selectedProfile.avatar} 
                          alt={selectedProfile.name} 
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized={selectedProfile.avatar.startsWith('data:')}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white">{selectedProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{selectedProfile?.platform || 'platform'}</p>
                    </div>
                  </div>
                  
                  {/* Post content */}
                  <div className="p-4">
                    <h3 className="font-bold mb-2 text-black dark:text-white">{formData.title || 'Post Title'}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {formData.description || 'Post description will appear here...'}
                    </p>
                    
                    {generatedImage && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                        {typeof generatedImage === 'string' ? (
                          <img 
                            src={generatedImage} 
                            alt="Post image" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.description?.match(/#[a-zA-Z0-9_]+/g)?.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Media</h2>
              <button 
                onClick={handleMediaModalClose}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* AI Image Generation */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <h3 className="font-medium mb-3">AI Image Generator</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    onClick={async () => {
                      if (!imagePrompt.trim() || isGeneratingImage) return;
                      
                      setIsGeneratingImage(true);
                      try {
                        const images = await generateImage(imagePrompt);
                        
                        if (Array.isArray(images) && images.length > 0) {
                          setGeneratedImages(images);
                          setGeneratedImage(images[0]);
                        } else if (typeof images === 'string') {
                          setGeneratedImages([images]);
                          setGeneratedImage(images);
                        }
                        
                        handleMediaModalClose();
                      } catch (error) {
                        console.error('Error generating image:', error);
                        alert('Failed to generate image. Please try again.');
                      } finally {
                        setIsGeneratingImage(false);
                      }
                    }}
                  >
                    {isGeneratingImage ? 
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </span> 
                      : 'Generate Image'
                    }
                  </button>
                </div>

                {/* Show generated images grid if available */}
                {generatedImages?.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {generatedImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setGeneratedImage(img);
                          handleMediaModalClose();
                        }}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 ${
                          generatedImage === img ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        {typeof img === 'string' ? (
                          <img 
                            src={img} 
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Upload Section */}
              <div className="border border-dashed border-[var(--border)] rounded-lg p-8 flex flex-col items-center justify-center gap-3">
                <UploadIcon className="w-8 h-8 text-[var(--muted)]" />
                <p className="text-center">Drag and drop an image here, or click to select a file</p>
                <button className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg mt-2">
                  Select File
                </button>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleMediaModalClose}
                  className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Icons
const ImageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default CreatePost; 