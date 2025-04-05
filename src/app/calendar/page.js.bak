'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { getScheduledPosts, getProfiles, addScheduledPost, updateScheduledPost } from '@/lib/firebase';

const CalendarView = () => {
  const router = useRouter();
  const dragRef = useRef(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [draggedPost, setDraggedPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    time: '12:00',
    profile: null
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch scheduled posts from Firebase
  useEffect(() => {
    const postsUnsubscribe = getScheduledPosts((data) => {
      if (data) {
        setScheduledPosts(data);
      }
    });
    
    const profilesUnsubscribe = getProfiles((data) => {
      if (data && data.length > 0) {
        setProfiles(data);
        setSelectedProfile(data[0]);
        setPostForm(prev => ({ ...prev, profile: data[0] }));
      }
    });
    
    return () => {
      postsUnsubscribe();
      profilesUnsubscribe();
    };
  }, []);
  
  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add cells for days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    
    return days;
  };
  
  // Get posts for a specific day
  const getPostsForDay = (day) => {
    if (!day) return [];
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    
    return scheduledPosts.filter(post => {
      if (!post.day) return false;
      
      // Only show posts for the selected profile if one is selected
      if (selectedProfile && post.profile && post.profile.id !== selectedProfile.id) {
        return false;
      }
      
      // Check if the post day matches the calendar day
      const postDate = new Date(post.day);
      return postDate.getDate() === day && 
             postDate.getMonth() === month && 
             postDate.getFullYear() === year;
    });
  };
  
  const handleDayClick = (day) => {
    if (!day) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    setSelectedDay(new Date(year, month, day));
    resetPostForm();
    setIsCreateModalOpen(true);
  };
  
  const resetPostForm = () => {
    setPostForm({
      title: '',
      description: '',
      time: '12:00',
      profile: selectedProfile
    });
    setGeneratedContent('');
    setGeneratedImage('');
    setPromptInput('');
  };
  
  const handleMediaModalOpen = () => {
    setIsMediaModalOpen(true);
  };
  
  const handleMediaModalClose = () => {
    setIsMediaModalOpen(false);
  };
  
  const handleSchedulePost = async () => {
    if (!selectedDay || !postForm.title || !postForm.profile) return;
    
    const newPost = {
      title: postForm.title,
      description: postForm.description || '',
      time: postForm.time,
      day: selectedDay.toISOString(),
      profile: {
        id: postForm.profile.id,
        name: postForm.profile.name,
        platform: postForm.profile.platform,
        avatar: postForm.profile.avatar
      },
      image: generatedImage || null
    };
    
    try {
      await addScheduledPost(newPost);
      setIsCreateModalOpen(false);
      resetPostForm();
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post. Please try again.');
    }
  };
  
  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setPostForm(prev => ({ ...prev, profile }));
  };
  
  const handleDragStart = (event, post) => {
    setDraggedPost(post);
    if (dragRef.current) {
      dragRef.current.style.display = 'block';
      dragRef.current.innerHTML = `<div class="p-2 bg-[var(--primary)] text-white rounded">
        ${post.time}: ${post.title}
      </div>`;
      
      // Position the drag preview
      dragRef.current.style.left = `${event.clientX + 10}px`;
      dragRef.current.style.top = `${event.clientY + 10}px`;
    }
  };
  
  const handleDragOver = (event, day) => {
    event.preventDefault();
    if (dragRef.current) {
      dragRef.current.style.left = `${event.clientX + 10}px`;
      dragRef.current.style.top = `${event.clientY + 10}px`;
    }
  };
  
  const handleDrop = async (event, day) => {
    event.preventDefault();
    
    if (!draggedPost || !day) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newDate = new Date(year, month, day);
    
    try {
      // Update the post with the new date
      const updatedPost = {
        ...draggedPost,
        day: newDate.toISOString()
      };
      
      await updateScheduledPost(draggedPost.id, updatedPost);
      
      // Reset drag state
      setDraggedPost(null);
      if (dragRef.current) {
        dragRef.current.style.display = 'none';
      }
    } catch (error) {
      console.error('Error updating post date:', error);
      alert('Failed to reschedule post. Please try again.');
    }
  };
  
  const handleDragEnd = () => {
    setDraggedPost(null);
    if (dragRef.current) {
      dragRef.current.style.display = 'none';
    }
  };
  
  const calendarDays = generateCalendarDays();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Calendar" />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                onClick={goToPreviousMonth}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">{formatMonth(currentMonth)}</h2>
              <button
                className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                onClick={goToNextMonth}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              onClick={() => {
                setSelectedDay(new Date());
                resetPostForm();
                setIsCreateModalOpen(true);
              }}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Schedule Post</span>
            </button>
          </div>
          
          {/* Profile Filter */}
          <div className="mb-6 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-sm font-medium mb-3">Filter by Channel</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${!selectedProfile ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
                onClick={() => setSelectedProfile(null)}
              >
                <span>All Channels</span>
              </button>
              
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 ${selectedProfile?.id === profile.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundColor: profile.color }}></div>
                    {profile.avatar && (
                      <Image 
                        src={profile.avatar} 
                        alt={profile.name} 
                        width={20}
                        height={20}
                        className="object-cover"
                        unoptimized={profile.avatar.startsWith('data:')}
                      />
                    )}
                  </div>
                  <span className="capitalize">{profile.platform}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            {/* Calendar header */}
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={index} className="py-3 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((dayObj, index) => {
                const postsForDay = dayObj.day ? getPostsForDay(dayObj.day) : [];
                
                return (
                  <div 
                    key={index} 
                    className={`
                      min-h-[120px] border-b border-r border-[var(--border)] p-2 
                      ${!dayObj.isCurrentMonth ? 'bg-[var(--background)]/50 text-[var(--muted)]' : 'cursor-pointer hover:bg-[var(--background)]/30'}
                      ${dayObj.day === new Date().getDate() && 
                         currentMonth.getMonth() === new Date().getMonth() && 
                         currentMonth.getFullYear() === new Date().getFullYear() ? 
                         'bg-[var(--primary)]/5' : ''}
                    `}
                    onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.day)}
                    onDragOver={(e) => dayObj.isCurrentMonth && handleDragOver(e, dayObj.day)}
                    onDrop={(e) => dayObj.isCurrentMonth && handleDrop(e, dayObj.day)}
                  >
                    {dayObj.day && (
                      <>
                        <div className="font-medium mb-2">{dayObj.day}</div>
                        <div className="space-y-1">
                          {postsForDay.map((post, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs p-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] truncate cursor-move"
                              title={post.title}
                              draggable
                              onDragStart={(e) => handleDragStart(e, post)}
                              onDragEnd={handleDragEnd}
                            >
                              {post.time}: {post.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Drag Preview Element */}
          <div 
            ref={dragRef} 
            className="fixed pointer-events-none z-50 opacity-80 hidden"
            style={{ top: 0, left: 0 }} 
          ></div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Schedule Post for {selectedDay?.toLocaleDateString()}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                {/* Profile Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Channel</label>
                  <div className="flex flex-wrap gap-2">
                    {profiles.map(profile => (
                      <button
                        key={profile.id}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${postForm.profile?.id === profile.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
                        onClick={() => setPostForm(prev => ({ ...prev, profile }))}
                      >
                        <div className="relative w-5 h-5 rounded-full overflow-hidden">
                          <div className="absolute inset-0" style={{ backgroundColor: profile.color }}></div>
                          {profile.avatar && (
                            <Image 
                              src={profile.avatar} 
                              alt={profile.name} 
                              width={20}
                              height={20}
                              className="object-cover"
                              unoptimized={profile.avatar.startsWith('data:')}
                            />
                          )}
                        </div>
                        <span className="capitalize">{profile.platform}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Time Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="time">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={postForm.time}
                    onChange={(e) => setPostForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title"
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="description">
                    Content
                  </label>
                  <textarea
                    id="description"
                    value={postForm.description}
                    onChange={(e) => setPostForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter post content"
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[150px]"
                  ></textarea>
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
                      className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                      disabled={!promptInput.trim() || isGenerating}
                      onClick={() => {
                        // Simulate AI content generation
                        setIsGenerating(true);
                        setTimeout(() => {
                          const generatedTitle = `${postForm.profile?.platform.charAt(0).toUpperCase() + postForm.profile?.platform.slice(1)} Post about ${promptInput.split(' ').slice(0, 3).join(' ')}`;
                          const generatedDesc = `Here's an engaging post about ${promptInput} tailored for ${postForm.profile?.platform}. We're excited to share our thoughts on this topic and would love to hear your feedback in the comments! #${promptInput.split(' ')[0]} #${postForm.profile?.platform} #trending`;
                          
                          setGeneratedContent(generatedDesc);
                          setPostForm(prev => ({
                            ...prev,
                            title: generatedTitle,
                            description: generatedDesc
                          }));
                          setIsGenerating(false);
                        }, 1500);
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
              </div>
              
              {/* Preview Section */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3">Preview</h3>
                <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                  {/* Platform-specific header */}
                  <div 
                    className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-slate-700"
                    style={{ 
                      backgroundColor: postForm.profile?.color ? `${postForm.profile.color}22` : 'transparent',
                      borderTopColor: postForm.profile?.color || 'transparent',
                      borderTopWidth: '3px'
                    }}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={postForm.profile?.avatar || ''} 
                        alt={postForm.profile?.name || 'Profile'} 
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized={postForm.profile?.avatar?.startsWith('data:')}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white">{postForm.profile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{postForm.profile?.platform || 'platform'}</p>
                    </div>
                  </div>
                  
                  {/* Post content */}
                  <div className="p-4">
                    <h3 className="font-bold mb-2 text-black dark:text-white">{postForm.title || 'Post Title'}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {postForm.description || 'Post description will appear here...'}
                    </p>
                    
                    {generatedImage && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                        <Image 
                          src={generatedImage} 
                          alt="Post image" 
                          fill 
                          className="object-cover"
                          unoptimized={generatedImage.startsWith('data:')}
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {postForm.description?.match(/#[a-zA-Z0-9_]+/g)?.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Engagement stats */}
                  <div className="border-t border-gray-200 dark:border-slate-700 p-3 flex gap-4">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <HeartIcon className="w-4 h-4" />
                      <span className="text-xs">0 likes</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <CommentIcon className="w-4 h-4" />
                      <span className="text-xs">0 comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedulePost}
                disabled={!postForm.title || !postForm.profile}
                className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media Modal - Placeholder for now */}
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
                    placeholder="Describe the image you want to create..."
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors"
                    onClick={() => {
                      // Simulate image generation
                      const randomImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzNiODJmNiIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
                      
                      setGeneratedImage(randomImage);
                      handleMediaModalClose();
                    }}
                  >
                    Generate Image
                  </button>
                </div>
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
const ChevronLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

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

const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default CalendarView; 