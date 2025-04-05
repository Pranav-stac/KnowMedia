// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, onValue, push, child } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTMSdcLuBNj0ryCmgOqKVb_MrkInl8LuU",
  authDomain: "levelup-1a03e.firebaseapp.com",
  projectId: "levelup-1a03e",
  databaseURL: "https://levelup-1a03e-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "levelup-1a03e.firebasestorage.app",
  messagingSenderId: "565290881853",
  appId: "1:565290881853:web:86a6ee039b9bf27f56eb54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Fallback avatars and images for seeding
const fallbackAvatars = {
  'daniel-linkedin': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-facebook': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMTg3N0YyIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-instagram': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjRTQ0MDVGIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg=='
};

const fallbackImages = {
  'desk-setup': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEyMTIxMiIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSI4MCIgcng9IjQiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSI2MCIgeT0iMTQwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjI0MCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iIzQ0NCIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzU1NSIvPjxyZWN0IHg9IjEyMCIgeT0iNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiM1NTUiLz48L3N2Zz4=',
  'phone-clock': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMwMCIgcng9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyOTAiIHJ4PSIxNSIgZmlsbD0iIzExMSIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iMTUwIiByPSI1MCIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSI3NSIgeTI9IjExMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSIxMDAiIHkyPSIxNTAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHRleHQgeD0iNzUiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0Ij4yOjI0PC90ZXh0Pjwvc3ZnPg=='
};

// Seed initial data if the database is empty
export const seedInitialData = async () => {
  try {
    const snapshot = await get(ref(database, 'profiles'));
    if (!snapshot.exists()) {
      console.log('No data found, seeding initial data...');
      // Seed profiles
      await set(ref(database, 'profiles'), [
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

      // Seed posts
      await set(ref(database, 'posts'), [
        {
          id: 1,
          title: 'Work Desk Setup',
          description: 'My productivity corner. Where inspiration meets focus.',
          image: fallbackImages['desk-setup'],
          likes: 128,
          comments: 32,
          timestamp: new Date().toISOString(),
          author: {
            id: 1, // Add profile ID reference
            name: 'Daniel Hamilton',
            avatar: fallbackAvatars['daniel-linkedin'],
            platform: 'linkedin'
          },
          hashtags: ['WorkFromHome', 'ProductivityTips', 'DeskSetup'],
          status: 'Published'
        },
        {
          id: 2,
          title: 'Morning Routine',
          description: 'Starting the day right with mindfulness and planning.',
          image: fallbackImages['phone-clock'],
          likes: 85,
          comments: 14,
          timestamp: new Date().toISOString(),
          author: {
            id: 2, // Add profile ID reference
            name: 'Daniel Hamilton',
            avatar: fallbackAvatars['daniel-facebook'],
            platform: 'facebook'
          },
          hashtags: ['MorningRoutine', 'Productivity', 'Mindfulness'],
          status: 'Published'
        },
        {
          id: 3,
          title: 'Tech Stack 2024',
          description: 'Exploring the latest tools and technologies for optimal workflow.',
          image: fallbackImages['desk-setup'],
          likes: 210,
          comments: 45,
          timestamp: new Date().toISOString(),
          author: {
            id: 3, // Add profile ID reference
            name: 'HamiltonDan',
            avatar: fallbackAvatars['daniel-instagram'],
            platform: 'instagram'
          },
          hashtags: ['TechStack', 'DeveloperLife', 'Coding'],
          status: 'Draft'
        }
      ]);

      // Seed scheduled posts
      await set(ref(database, 'scheduledPosts'), [
        { 
          id: 1, 
          day: new Date().toISOString(), // Use actual date format
          time: '1:10 PM', 
          title: 'LinkedIn Strategy 2024',
          profile: { 
            id: 1, // Add profile ID reference
            name: 'Daniel Hamilton', 
            platform: 'linkedin',
            avatar: fallbackAvatars['daniel-linkedin']
          } 
        },
        { 
          id: 2, 
          day: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          time: '1:40 PM', 
          title: 'Content Planning Tips',
          profile: { 
            id: 1,
            name: 'Daniel Hamilton', 
            platform: 'linkedin',
            avatar: fallbackAvatars['daniel-linkedin']
          } 
        },
        { 
          id: 3, 
          day: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          time: '1:15 PM', 
          title: 'Engaging Your Audience',
          profile: { 
            id: 2,
            name: 'Daniel Hamilton', 
            platform: 'facebook',
            avatar: fallbackAvatars['daniel-facebook']
          } 
        }
      ]);

      console.log('Initial data seeded successfully');
    } else {
      console.log('Database already contains data, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
};

// Call seedInitialData immediately when this module is imported
(() => {
  seedInitialData().catch(error => {
    console.error("Error during initial data seeding:", error);
  });
})();

// Database functions
export const getProfiles = (callback) => {
  const profilesRef = ref(database, 'profiles');
  return onValue(profilesRef, (snapshot) => {
    const data = snapshot.val() || [];
    callback(data);
  });
};

export const getPosts = (callback) => {
  const postsRef = ref(database, 'posts');
  return onValue(postsRef, (snapshot) => {
    const data = snapshot.val() || [];
    callback(data);
  });
};

export const getScheduledPosts = (callback) => {
  const scheduledPostsRef = ref(database, 'scheduledPosts');
  return onValue(scheduledPostsRef, (snapshot) => {
    const data = snapshot.val() || [];
    callback(data);
  });
};

export const addPost = async (post) => {
  try {
    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);
    const posts = snapshot.val() || [];
    
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const newPost = { ...post, id: newId };
    
    posts.push(newPost);
    await set(postsRef, posts);
    return newPost;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
};

export const updatePost = async (postId, updatedData) => {
  try {
    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);
    const posts = snapshot.val() || [];
    
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updatedData };
      await set(postsRef, posts);
      return posts[index];
    }
    throw new Error('Post not found');
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);
    const posts = snapshot.val() || [];
    
    const newPosts = posts.filter(p => p.id !== postId);
    await set(postsRef, newPosts);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const addScheduledPost = async (scheduledPost) => {
  try {
    const scheduledPostsRef = ref(database, 'scheduledPosts');
    const snapshot = await get(scheduledPostsRef);
    const scheduledPosts = snapshot.val() || [];
    
    const newId = scheduledPosts.length > 0 ? Math.max(...scheduledPosts.map(p => p.id)) + 1 : 1;
    const newScheduledPost = { ...scheduledPost, id: newId };
    
    scheduledPosts.push(newScheduledPost);
    await set(scheduledPostsRef, scheduledPosts);
    return newScheduledPost;
  } catch (error) {
    console.error("Error adding scheduled post:", error);
    throw error;
  }
};

export const updateScheduledPost = async (postId, updatedData) => {
  try {
    const scheduledPostsRef = ref(database, 'scheduledPosts');
    const snapshot = await get(scheduledPostsRef);
    const scheduledPosts = snapshot.val() || [];
    
    const index = scheduledPosts.findIndex(p => p.id === postId);
    if (index !== -1) {
      scheduledPosts[index] = { ...scheduledPosts[index], ...updatedData };
      await set(scheduledPostsRef, scheduledPosts);
      return scheduledPosts[index];
    }
    throw new Error('Scheduled post not found');
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    throw error;
  }
};

export const deleteScheduledPost = async (postId) => {
  try {
    const scheduledPostsRef = ref(database, 'scheduledPosts');
    const snapshot = await get(scheduledPostsRef);
    const scheduledPosts = snapshot.val() || [];
    
    const newScheduledPosts = scheduledPosts.filter(p => p.id !== postId);
    await set(scheduledPostsRef, newScheduledPosts);
    return true;
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    throw error;
  }
};

export const addProfile = async (profile) => {
  try {
    const profilesRef = ref(database, 'profiles');
    const snapshot = await get(profilesRef);
    const profiles = snapshot.val() || [];
    
    const newId = profiles.length > 0 ? Math.max(...profiles.map(p => p.id)) + 1 : 1;
    const newProfile = { ...profile, id: newId };
    
    profiles.push(newProfile);
    await set(profilesRef, profiles);
    return newProfile;
  } catch (error) {
    console.error("Error adding profile:", error);
    throw error;
  }
};

// Individual profile retrieval
export const getProfile = (profileId, callback) => {
  const profilesRef = ref(database, 'profiles');
  
  return onValue(profilesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Find the profile with the matching ID in the array
      const profile = data.find(p => p.id.toString() === profileId.toString());
      
      if (profile) {
        callback(profile);
      } else {
        console.log(`Profile with ID ${profileId} not found`);
        callback(null);
      }
    } else {
      console.log('No profiles data available');
      callback(null);
    }
  }, (error) => {
    console.error('Error fetching profile:', error);
    callback(null);
  });
};

// Get posts by a specific profile
export const getPostsByProfile = (profileId, callback) => {
  const postsRef = ref(database, 'posts');
  
  return onValue(postsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Filter the posts array to find posts by this author
      const filteredPosts = data.filter(post => 
        post.author && post.author.id && 
        post.author.id.toString() === profileId.toString()
      );
      
      callback(filteredPosts);
    } else {
      console.log('No posts data available');
      callback([]);
    }
  }, (error) => {
    console.error('Error fetching posts by profile:', error);
    callback([]);
  });
};

// Individual post retrieval
export const getPost = (postId, callback) => {
  const postsRef = ref(database, 'posts');
  
  return onValue(postsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Find the post with the matching ID in the array
      const post = data.find(p => p.id.toString() === postId.toString());
      
      if (post) {
        callback(post);
      } else {
        console.log(`Post with ID ${postId} not found`);
        callback(null);
      }
    } else {
      console.log('No posts data available');
      callback(null);
    }
  }, (error) => {
    console.error('Error fetching post:', error);
    callback(null);
  });
};

export default { 
  seedInitialData, 
  getProfiles, 
  getPosts, 
  getScheduledPosts,
  addPost,
  updatePost,
  deletePost,
  addScheduledPost,
  updateScheduledPost,
  deleteScheduledPost,
  addProfile,
  getProfile,
  getPostsByProfile,
  getPost
}; 