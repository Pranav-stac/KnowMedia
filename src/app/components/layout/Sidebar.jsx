'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProfiles, addProfile } from '@/lib/firebase';

// Inline fallback avatars to avoid import issues
const fallbackAvatars = {
  'daniel-linkedin': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-facebook': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMTg3N0YyIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-instagram': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjRTQ0MDVGIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg=='
};

const Sidebar = () => {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: 'Daniel Hamilton',
      platform: 'linkedin',
      avatar: fallbackAvatars['daniel-linkedin'],
      color: '#0077B5'
    },
    {
      id: 2,
      name: 'Daniel Hamilton',
      platform: 'facebook',
      avatar: fallbackAvatars['daniel-facebook'],
      color: '#1877F2'
    },
    {
      id: 3,
      name: 'HamiltonDan',
      platform: 'instagram',
      avatar: fallbackAvatars['daniel-instagram'],
      color: '#E4405F'
    }
  ]);
  
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    platform: 'linkedin',
    avatar: '',
    color: '#0077B5'
  });
  
  // Load profiles from Firebase
  useEffect(() => {
    const unsubscribe = getProfiles((data) => {
      if (data && data.length > 0) {
        setProfiles(data);
      }
    });
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
  
  const handleAddChannel = () => {
    setIsAddChannelOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddChannelOpen(false);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // If platform is changing, update avatar and color accordingly
    if (name === 'platform') {
      let color = '#0077B5'; // default to LinkedIn color
      
      switch (value) {
        case 'linkedin':
          color = '#0077B5';
          break;
        case 'facebook':
          color = '#1877F2';
          break;
        case 'instagram':
          color = '#E4405F';
          break;
        case 'twitter':
          color = '#1DA1F2';
          break;
      }
      
      setNewProfile({
        ...newProfile,
        platform: value,
        avatar: fallbackAvatars[`daniel-${value}`] || fallbackAvatars['daniel-linkedin'],
        color
      });
    } else {
      setNewProfile({
        ...newProfile,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a complete profile object
      const profileToAdd = {
        ...newProfile,
        // Select default avatar based on platform if none provided
        avatar: newProfile.avatar || fallbackAvatars[`daniel-${newProfile.platform}`] || fallbackAvatars['daniel-linkedin']
      };
      
      // Save to Firebase using the addProfile function
      await addProfile(profileToAdd);
      
      // Close modal and reset form
      setIsAddChannelOpen(false);
      setNewProfile({
        name: '',
        platform: 'linkedin',
        avatar: '',
        color: '#0077B5'
      });
    } catch (error) {
      console.error("Error adding profile:", error);
      alert("Failed to add new channel. Please try again.");
    }
  };

  return (
    <div className="w-64 border-r border-[var(--border)] h-full flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Channel</h2>
        
        <div className="space-y-3">
          {profiles.map((profile) => (
            <ProfileItem key={profile.id} profile={profile} />
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-4 space-y-3">
        <button 
          className="w-full py-3 px-4 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 text-white font-medium"
          onClick={handleAddChannel}
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Channel</span>
        </button>
        
        <Link href="/post/create">
          <button className="w-full py-3 px-4 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] transition-colors flex items-center justify-center gap-2 text-white font-medium">
            <WandIcon className="w-5 h-5" />
            <span>Generate Posts</span>
          </button>
        </Link>
      </div>
      
      {/* Add Channel Modal */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-96 max-w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add New Channel</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newProfile.name}
                    onChange={handleProfileChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="e.g. John Smith"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="platform">
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    value={newProfile.platform}
                    onChange={handleProfileChange}
                    className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg bg-[var(--background)] hover:bg-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors"
                >
                  Add Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileItem = ({ profile }) => {
  return (
    <Link href={`/profile/${profile.id}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card)] transition-colors cursor-pointer">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: profile.color }}></div>
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
          
          {/* Platform icon in bottom right */}
          <div className="absolute bottom-0 right-0 rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: profile.color }}>
            <PlatformIcon platform={profile.platform} className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-truncate">{profile.name}</p>
          <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
        </div>
      </div>
    </Link>
  );
};

// Icons
const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const WandIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default Sidebar; 