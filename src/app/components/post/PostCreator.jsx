'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import MediaDesigner from './MediaDesigner';
import Link from 'next/link';
import { postToInstagram } from '@/lib/instagram';
import { generateSocialMediaPost, generateContentIdeas, generateText, generateImage, analyzeImage } from '@/lib/ai';
import { 
  ImageIcon, 
  XIcon, 
  Wand2Icon, 
  LoaderIcon, 
  ImagePlusIcon, 
  RefreshIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChartIcon, 
  GridIcon, 
  EditIcon, 
  PlusIcon, 
  TrendingUpIcon,
  MessageSquareIcon,
  ShareIcon,
  SendIcon,
  SaveIcon,
  MinimizeIcon,
  FileTextIcon
} from 'lucide-react';
import { Card, Title, Text, Button } from '@tremor/react';

const PostCreator = ({ initialPost, onSave, onCancel }) => {
  const [postContent, setPostContent] = useState(initialPost?.description || "Success comes from mastering your time. Reflect daily on your accomplishments and balance work with rest for maximum productivity! ⏰✨");
  const [selectedProfile, setSelectedProfile] = useState({
    id: 1,
    name: 'Daniel Hamilton',
    platform: initialPost?.profile?.platform || 'linkedin',
    avatar: initialPost?.profile?.avatar || '/avatars/daniel-linkedin.jpg',
    color: '#0077B5'
  });
  const [showAIChat, setShowAIChat] = useState(true);
  
  // Use a fallback URL if initialPost?.media is not available
  const [postMedia, setPostMedia] = useState(() => {
    if (initialPost?.media) return initialPost.media;
    return null;
  });
  
  const [showMediaDesigner, setShowMediaDesigner] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      content: "Hi! I'm AI Assistant. I can write any post for you. What do you want to tell your audience about?" 
    },
    {
      id: 2,
      role: 'user',
      content: "Hi! Can you help me generate some post about time management?"
    },
    {
      id: 3,
      role: 'assistant',
      content: "Of course!"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [chatError, setChatError] = useState(null);

  const [postForm, setPostForm] = useState({
    profile: null,
    time: '12:00',
    title: '',
    description: '',
    hashtags: [],
    image: null
  });
  
  const [loading, setLoading] = useState({
    image: false,
    content: false,
    analyzing: false
  });
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [contentPrompt, setContentPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  const profiles = [
    { id: 'instagram', name: 'Aniruddh', platform: 'instagram', color: '#E1306C', username: 'pr4n4virl' },
    { id: 'twitter', name: 'Pranav Narkhede', platform: 'twitter', color: '#1DA1F2', username: 'pr4n4virl' },
    { id: 'linkedin', name: 'Daniel Hamilton', platform: 'linkedin', color: '#0077B5', username: 'pr4n4virl' }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handlePostChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isGeneratingText) return;
    
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage
    };
    
    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsGeneratingText(true);
    setChatError(null);
    
    // Add typing indicator message
    const typingMessage = {
      id: 'typing',
      role: 'assistant',
      content: "Thinking...",
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    try {
      // Generate content based on the user's message
      let generatedContent = '';
      const userPrompt = newMessage.toLowerCase();
      let contentType = 'response';
      
      if (userPrompt.includes('post about') || userPrompt.includes('write about')) {
        const topic = userPrompt.replace(/post about|write about|generate post|create post/gi, '').trim();
        generatedContent = await generateSocialMediaPost(topic, selectedProfile.platform);
        contentType = 'post';
        
        // Update post content with AI response
        if (generatedContent && generatedContent.trim() !== '') {
          setPostContent(generatedContent);
        } else {
          throw new Error('Failed to generate post content');
        }
      } else if (userPrompt.includes('content ideas') || userPrompt.includes('suggest ideas')) {
        const topic = userPrompt.replace(/content ideas|suggest ideas|generate ideas/gi, '').trim() || 'social media';
        const ideas = await generateContentIdeas(topic, 5);
        
        if (ideas && ideas.length > 0) {
          generatedContent = "Here are some content ideas:\n\n" + ideas.map((idea, i) => `${i+1}. ${idea}`).join('\n\n');
          contentType = 'ideas';
        } else {
          throw new Error('Failed to generate content ideas');
        }
      } else {
        // Default case - just generate a general response
        const prompt = `User is asking: "${newMessage}". Generate a helpful response about social media content creation.`;
        generatedContent = await generateText(prompt);
        
        // If it looks like a content request, update the post content too
        if (generatedContent && (userPrompt.includes('post') || userPrompt.includes('content'))) {
          setPostContent(generatedContent);
          contentType = 'post';
        }
      }
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      // If we got a valid response, add it
      if (generatedContent && generatedContent.trim() !== '') {
        let responseMessage = '';
        
        switch (contentType) {
          case 'post':
            responseMessage = "I've created content based on your request! Check the editor on the left.";
            break;
          case 'ideas':
            responseMessage = generatedContent;
            break;
          default:
            responseMessage = generatedContent;
        }
        
      const aiResponse = {
          id: Date.now(),
          role: 'assistant',
          content: responseMessage
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('No content was generated');
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      setChatError(`I couldn't generate content: ${error.message || 'Unknown error'}`);
      
      // Remove typing indicator and add error message
      const errorResponse = {
        id: Date.now(),
        role: 'assistant',
        content: "I'm sorry, I couldn't generate content right now. Please try again."
      };
      
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorResponse));
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostMedia({
          type: 'image',
          url: e.target.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertMedia = () => {
    fileInputRef.current?.click();
  };

  const handleDesignMedia = () => {
    setShowMediaDesigner(true);
  };

  const handleMediaDesignerClose = () => {
    setShowMediaDesigner(false);
  };

  const handleMediaGenerated = (media) => {
    if (!media || !media.url) {
      console.error('Media generation did not return a valid URL');
      return;
    }
    
    setPostMedia(media);
    setShowMediaDesigner(false);
  };

  const handlePostNow = async () => {
    if (!postMedia || selectedProfile.platform !== 'instagram') {
      alert('You need an image and Instagram profile selected to post now');
      return;
    }

    try {
      setIsPosting(true);
      setPostStatus({ type: 'info', message: 'Posting to Instagram...' });
      
      const result = await postToInstagram(postMedia.url, postContent);
      
      setPostStatus({ 
        type: 'success', 
        message: 'Posted successfully to Instagram!' 
      });
      
      // Reset status after a few seconds
      setTimeout(() => setPostStatus(null), 3000);
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      setPostStatus({ 
        type: 'error', 
        message: `Failed to post: ${error.message}` 
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSave = () => {
    const postData = {
      id: initialPost?.id || Date.now(),
      description: postContent,
      profile: selectedProfile,
      date: initialPost?.date || new Date().toISOString(),
      media: postMedia // ensure media is passed
    };
    
    onSave(postData);
  };

  // Generate content based on prompt
  const handleGenerateContent = async () => {
    if (!contentPrompt.trim()) return;
    
    setLoading(true);
    try {
      // Generate content first
      const contentResponse = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: contentPrompt,
          platform: postForm.profile?.platform || 'linkedin',
          tone: 'professional'
        })
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const contentData = await contentResponse.json();
      
      // Update form with generated content
      setPostForm(prev => ({
        ...prev,
        title: contentData.title || '',
        description: contentData.description || '',
        hashtags: contentData.hashtags || []
      }));

      // Generate images based on the content
      const imageResponse = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: contentPrompt,
          platform: postForm.profile?.platform || 'linkedin'
        })
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate images');
      }

      const imageData = await imageResponse.json();
      
      // Update images
      if (imageData.images) {
        setGeneratedImages(Array.isArray(imageData.images) ? imageData.images : [imageData.images]);
        setPostMedia(Array.isArray(imageData.images) ? imageData.images[0] : imageData.images);
      }

    } catch (error) {
      console.error('Error generating content:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  // Generate image based on prompt
  const handleGenerateImage = async () => {
    try {
      setLoading(prev => ({ ...prev, image: true }));
      const images = await generateImage(imagePrompt, selectedProfile.platform);
      setGeneratedImages(images);
      setPostMedia(images[0]);
      setShowMediaModal(true);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  // Analyze uploaded image and generate content
  const handleImageAnalysis = async (imageUrl) => {
    try {
      setLoading(prev => ({ ...prev, analyzing: true }));
      const analysis = await analyzeImage(imageUrl, selectedProfile.platform);
      
      setPostForm(prev => ({
        ...prev,
        title: analysis.title,
        description: analysis.description,
        hashtags: analysis.hashtags
      }));
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(prev => ({ ...prev, analyzing: false }));
    }
  };

  // Auto-generate initial content when profile changes
  useEffect(() => {
    if (postForm.profile) {
      handleGenerateContent();
    }
  }, [postForm.profile]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Title>Create New Post</Title>
        
        {/* Channel Selection */}
        <div className="mt-4">
          <Text className="mb-2">Select Channel</Text>
          <div className="flex gap-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setPostForm(prev => ({ ...prev, profile }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  postForm.profile?.id === profile.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full" 
                  style={{ backgroundColor: profile.color }}
                />
                <span>{profile.name}</span>
              </button>
            ))}
          </div>
          </div>
          
        {/* Time Selection */}
        <div className="mt-4">
          <Text className="mb-2">Schedule Time</Text>
          <input
            type="time"
            value={postForm.time}
            onChange={(e) => setPostForm(prev => ({ ...prev, time: e.target.value }))}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          />
          </div>

        {/* AI Content Generator */}
        <div className="mt-4">
          <Text className="mb-2">AI Content Assistant</Text>
          <div className="flex gap-2">
            <input
              type="text"
              value={contentPrompt}
              onChange={(e) => setContentPrompt(e.target.value)}
              placeholder="What would you like to post about?"
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg"
            />
            <Button
              onClick={handleGenerateContent}
              loading={loading}
              disabled={!contentPrompt.trim() || loading}
              className="bg-blue-500 text-white px-6"
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
        
        {/* Preview */}
        {postForm.description && (
          <div className="mt-6">
            <Text className="mb-2">Preview</Text>
            <Card className="bg-gray-800 p-4">
              {postMedia && (
                <div className="mb-4">
                  <img
                    src={postMedia}
                    alt="Generated content"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <Text className="text-white font-medium">{postForm.title}</Text>
              <Text className="text-gray-400 mt-2">{postForm.description}</Text>
              <div className="flex flex-wrap gap-2 mt-4">
                {postForm.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
            </div>
        )}

        {/* Image Selection */}
        {generatedImages.length > 0 && (
          <div className="mt-4">
            <Text className="mb-2">Select Image</Text>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
              <button 
                  key={index}
                  onClick={() => setPostMedia(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    postMedia === image ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`Generated option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                    </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              setContentPrompt('');
              setPostForm(prev => ({
                ...prev,
                title: '',
                description: '',
                hashtags: []
              }));
              setGeneratedImages([]);
              setPostMedia(null);
            }}
          >
            Clear
          </Button>
          <Button
            disabled={!postForm.description || !postMedia}
            onClick={handleSave}
          >
            Schedule Post
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ProfileAvatar = ({ profile }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'linkedin': return '#0077B5';
      case 'instagram': return '#E4405F';
      default: return '#6366f1';
    }
  };

  return (
    <div className="flex items-center gap-3 relative">
      <div 
        className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
      >
        <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(profile.platform) }}></div>
        
        {profile.avatar && (
          <Image 
            src={profile.avatar} 
            alt={profile.name} 
            width={40} 
            height={40}
            className="object-cover"
            onError={(e) => {
              // Fallback avatar with first letter of name
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-lg">${profile.name.charAt(0)}</div>`;
            }}
          />
        )}
        
        {/* Platform icon in bottom right */}
        <div 
          className="absolute bottom-0 right-0 rounded-full w-4 h-4 flex items-center justify-center" 
          style={{ backgroundColor: getPlatformColor(profile.platform) }}
        >
          <PlatformIcon platform={profile.platform} className="w-3 h-3 text-white" />
        </div>
      </div>
      
      <div>
        <p className="font-medium text-sm">{profile.name}</p>
        <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
      </div>

      {/* Enhanced Profile Menu */}
      {showProfileMenu && (
        <div 
          ref={menuRef}
          className="absolute top-full left-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-10 w-64 overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(profile.platform) }}></div>
                {profile.avatar && (
                  <Image 
                    src={profile.avatar} 
                    alt={profile.name} 
                    width={48} 
                    height={48} 
                    className="object-cover"
                    unoptimized={profile.avatar?.startsWith('data:')}
                  />
                )}
              </div>
              <div>
                <h3 className="font-bold">{profile.name}</h3>
                <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[var(--background)] rounded-lg p-2">
                <p className="font-bold text-sm">12</p>
                <p className="text-xs text-[var(--muted)]">Posts</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-2">
                <p className="font-bold text-sm">4</p>
                <p className="text-xs text-[var(--muted)]">Scheduled</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-2">
                <p className="font-bold text-sm">2.4K</p>
                <p className="text-xs text-[var(--muted)]">Followers</p>
              </div>
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="p-3 border-b border-[var(--border)]">
            <h4 className="text-xs font-medium mb-2 text-[var(--muted)]">UPCOMING POSTS</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <div className="bg-[var(--background)] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium truncate w-36">Time Management Tips</p>
                  <p className="text-xs text-[var(--muted)]">Today, 2:30 PM</p>
                </div>
                <button className="p-1 hover:bg-[var(--border)] rounded-full">
                  <EditIcon className="w-3 h-3 text-[var(--muted)]" />
                </button>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium truncate w-36">Product Launch Announcement</p>
                  <p className="text-xs text-[var(--muted)]">Tomorrow, 10:00 AM</p>
                </div>
                <button className="p-1 hover:bg-[var(--border)] rounded-full">
                  <EditIcon className="w-3 h-3 text-[var(--muted)]" />
                </button>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium truncate w-36">Weekly Industry Update</p>
                  <p className="text-xs text-[var(--muted)]">Fri, 4:00 PM</p>
                </div>
                <button className="p-1 hover:bg-[var(--border)] rounded-full">
                  <EditIcon className="w-3 h-3 text-[var(--muted)]" />
                </button>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="p-3 border-b border-[var(--border)]">
            <h4 className="text-xs font-medium mb-2 text-[var(--muted)]">PERFORMANCE INSIGHTS</h4>
            <div className="bg-[var(--background)] rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Engagement Rate</span>
                <span className="text-xs font-bold text-green-500 flex items-center">
                  <TrendingUpIcon className="w-3 h-3 mr-0.5" />
                  8.4%
                </span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>Last 30 days</span>
                <span className="font-medium text-green-500">+12.5%</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="bg-[var(--background)] rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Comments</span>
                  <span className="text-xs text-green-500">+18%</span>
                </div>
                <p className="text-sm font-bold">156</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Shares</span>
                  <span className="text-xs text-green-500">+7%</span>
                </div>
                <p className="text-sm font-bold">42</p>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="p-2">
            <Link href={`/profile/${profile.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
              <UserIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">View Profile</span>
            </Link>
            <Link href="/feed" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
              <CalendarIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">Content Calendar</span>
            </Link>
            <Link href="/calendar" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
              <ClockIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">Scheduled Posts</span>
            </Link>
            <Link href="/analytics" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
              <ChartIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">View Analytics</span>
            </Link>
            <Link href="/manage-feed" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
              <GridIcon className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">Manage Feed</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-[var(--border)]">
            <button className="w-full py-2 px-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors text-sm flex items-center justify-center gap-2">
              <PlusIcon className="w-3 h-3" />
              <span>Create New Post</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Keep only the PlatformIcon and InstagramIcon since they're custom
const PlatformIcon = ({ platform, className }) => {
  switch (platform) {
    case 'linkedin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      );
    default:
      return null;
  }
};

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

export default PostCreator; 