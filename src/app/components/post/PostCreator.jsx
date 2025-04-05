'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import MediaDesigner from './MediaDesigner';
import Link from 'next/link';
import { postToInstagram } from '@/lib/instagram';
import { generateSocialMediaPost, generateContentIdeas, generateText } from '@/lib/ai';

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
  const fileInputRef = useRef(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [chatError, setChatError] = useState(null);

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
    
    setMessages(prev => [...prev, userMessage, typingMessage]);
    
    try {
      // Generate content based on the user's message
      let generatedContent;
      const userPrompt = newMessage.toLowerCase();
      
      if (userPrompt.includes('post about') || userPrompt.includes('write about')) {
        const topic = userPrompt.replace(/post about|write about|generate post|create post/gi, '').trim();
        generatedContent = await generateSocialMediaPost(topic, selectedProfile.platform);
        
        // Update post content with AI response
        setPostContent(generatedContent);
      } else if (userPrompt.includes('content ideas') || userPrompt.includes('suggest ideas')) {
        const topic = userPrompt.replace(/content ideas|suggest ideas|generate ideas/gi, '').trim() || 'social media';
        const ideas = await generateContentIdeas(topic, 5);
        generatedContent = "Here are some content ideas:\n\n" + ideas.map((idea, i) => `${i+1}. ${idea}`).join('\n\n');
      } else {
        // Default case - just generate a general response
        const prompt = `User is asking: "${newMessage}". Generate a helpful response about social media content creation.`;
        generatedContent = await generateText(prompt);
        
        // If it's asking for a post, update the post content too
        if (userPrompt.includes('post') || userPrompt.includes('content')) {
          setPostContent(generatedContent);
        }
      }
      
      // Remove typing indicator and add the actual response
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: "I've created content based on your request! Check the editor on the left."
      };
      
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiResponse));
    } catch (error) {
      console.error("Error generating AI content:", error);
      setChatError("I couldn't generate content right now. Please try again.");
      
      // Remove typing indicator and add error message
      const errorResponse = {
        id: messages.length + 2,
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

  return (
    <div className="flex-1 p-4">
      {showMediaDesigner ? (
        <div className="absolute inset-0 z-50 bg-[var(--background)] flex">
          <MediaDesigner 
            onClose={handleMediaDesignerClose}
            onMediaGenerated={handleMediaGenerated}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Post Editor */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {initialPost ? 'Edit Post' : 'Create Post'}
              </h2>
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <ProfileAvatar profile={selectedProfile} />
            </div>
            
            <textarea
              className="flex-1 bg-transparent border-none outline-none resize-none mb-4 min-h-40 text-[16px] leading-relaxed"
              value={postContent}
              onChange={handlePostChange}
              placeholder="What do you want to share?"
            />

            {postMedia && (
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <Image
                  src={postMedia.url}
                  alt="Post media"
                  width={400}
                  height={300}
                  className="w-full object-cover rounded-lg"
                />
                <button
                  onClick={() => setPostMedia(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleMediaUpload}
            />

            {/* Status message */}
            {postStatus && (
              <div className={`p-2 rounded-lg mb-2 text-sm ${
                postStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
                postStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' : 
                'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
              }`}>
                {postStatus.message}
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-4 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={handleInsertMedia}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--background)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors text-sm"
                >
                  <DocumentIcon className="w-5 h-5" />
                  <span>Insert Media</span>
                </button>
                
                <button 
                  onClick={handleDesignMedia}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-lg transition-colors text-sm text-white"
                >
                  <WandIcon className="w-5 h-5" />
                  <span>Design Media</span>
                </button>
              </div>
              
              {/* Instagram Post Now button, only show for Instagram profiles */}
              {selectedProfile.platform === 'instagram' && (
                <button 
                  onClick={handlePostNow}
                  disabled={isPosting || !postMedia}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm text-white ${
                    isPosting 
                      ? 'bg-[#E4405F]/50 cursor-not-allowed' 
                      : 'bg-[#E4405F] hover:bg-[#d13752]'
                  }`}
                >
                  {isPosting ? (
                    <>
                      <LoadingIcon className="w-5 h-5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <InstagramIcon className="w-5 h-5" />
                      <span>Post Now to Instagram</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Add Save button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors text-sm text-white"
              >
                <SaveIcon className="w-5 h-5" />
                <span>Save Post</span>
              </button>
            </div>
          </div>
          
          {/* Preview and AI Assistant */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col h-full">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold">Preview</h2>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Post Preview */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <ProfileAvatar profile={selectedProfile} />
                </div>
                
                <p className="text-[var(--foreground)] mb-4 whitespace-pre-wrap">{postContent}</p>
                
                <div className="flex items-center gap-4 text-[var(--muted)]">
                  <div className="flex items-center gap-1">
                    <CommentIcon className="w-5 h-5" />
                    <span>28</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon className="w-5 h-5" />
                    <span>5</span>
                  </div>
                </div>
              </div>
              
              {/* AI Assistant Interface */}
              <div className={`bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 flex flex-col h-full ${showAIChat ? '' : 'hidden'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">AI Assistant</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAIChat(false)}
                      className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-[var(--muted)]"
                    >
                      <MinimizeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-4 py-3 rounded-xl ${
                          message.role === 'assistant' 
                            ? 'bg-[var(--background)] text-[var(--foreground)]' 
                            : 'bg-[var(--primary)] text-white'
                        } ${message.isTyping ? 'animate-pulse' : ''}`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {chatError && (
                    <div className="flex justify-center">
                      <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
                        {chatError}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask AI to write a post for you..."
                    className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
                    disabled={isGeneratingText}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                    disabled={!newMessage.trim() || isGeneratingText}
                  >
                    {isGeneratingText ? (
                      <LoadingIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
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

// Icons
const WandIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CommentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

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

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const GridIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

const LoadingIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const MinimizeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-4.553a2.5 2.5 0 00-3.535-3.535L9 10" />
  </svg>
);

export default PostCreator; 