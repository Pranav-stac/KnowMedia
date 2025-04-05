'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { addPost, getProfiles } from '@/lib/firebase';

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
        hashtags: ['socialmedia', 'marketing', 'digital']
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
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Create Post" />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Author Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="profile">
                    Profile
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <div 
                          className="w-10 h-10 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: profile.color }}
                        ></div>
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
                        </div>
                      </div>
                    ))}
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
        </div>
      </div>
    </div>
  );
};

export default CreatePost; 