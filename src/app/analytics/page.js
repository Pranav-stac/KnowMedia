'use client';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AIInsights from '../components/analytics/AIInsights';
import { useState } from 'react';
import PlatformButton from '../components/analytics/PlatformButton';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import InstagramIcon from '../components/icons/InstagramIcon';
import TabButton from '../components/analytics/TabButton';
import EngagementReport from '../components/analytics/EngagementReport';
import DemographicsReport from '../components/analytics/DemographicsReport';

const samplePosts = [
  {
    id: 1,
    description: "Time Management Tips for Professionals",
    profile: { platform: 'linkedin' },
    stats: { likes: 423, comments: 56, shares: 44 },
    date: '2024-02-14'
  },
  {
    id: 2,
    description: "Behind the Scenes: Product Development",
    profile: { platform: 'instagram' },
    stats: { likes: 312, comments: 78, shares: 22 },
    date: '2024-02-13'
  },
  {
    id: 3,
    description: "Industry Trends Report",
    profile: { platform: 'linkedin' },
    stats: { likes: 287, comments: 45, shares: 55 },
    date: '2024-02-12'
  },
  {
    id: 4,
    description: "Team Building Activities",
    profile: { platform: 'linkedin' },
    stats: { likes: 245, comments: 34, shares: 21 },
    date: '2024-02-11'
  },
  {
    id: 5,
    description: "Customer Spotlight: ABC Corp",
    profile: { platform: 'linkedin' },
    stats: { likes: 198, comments: 23, shares: 15 },
    date: '2024-02-10'
  },
  {
    id: 6,
    description: "Behind the Scenes",
    profile: { platform: 'instagram' },
    stats: { likes: 543, comments: 89, shares: 32 },
    date: '2024-02-09'
  },
  {
    id: 7,
    description: "Product Launch Announcement",
    profile: { platform: 'facebook' },
    stats: { likes: 321, comments: 67, shares: 41 },
    date: '2024-02-08'
  }
];

const AnalyticsView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Analytics" />
        <div className="container mx-auto p-6 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
          
          {/* Platform Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            <PlatformButton 
              platform="all" 
              isActive={selectedPlatform === 'all'} 
              onClick={() => setSelectedPlatform('all')}
            >
              All Platforms
            </PlatformButton>
            
            <PlatformButton 
              platform="linkedin" 
              isActive={selectedPlatform === 'linkedin'} 
              onClick={() => setSelectedPlatform('linkedin')}
            >
              <LinkedInIcon className="w-5 h-5" />
              LinkedIn
            </PlatformButton>
            
            <PlatformButton 
              platform="instagram" 
              isActive={selectedPlatform === 'instagram'} 
              onClick={() => setSelectedPlatform('instagram')}
            >
              <InstagramIcon className="w-5 h-5" />
              Instagram
            </PlatformButton>
          </div>
          
          {/* AI Insights */}
          <AIInsights posts={samplePosts} platform={selectedPlatform} />
          
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* ... existing analytics cards ... */}
          </div>
          
          {/* Tabs */}
          <div className="border-b border-[var(--border)] mb-6">
            <div className="flex">
              <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                Overview
              </TabButton>
              
              <TabButton isActive={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')}>
                Engagement
              </TabButton>
              
              <TabButton isActive={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')}>
                Demographics
              </TabButton>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <AnalyticsDashboard platform={selectedPlatform} />
            </div>
          )}
          
          {activeTab === 'engagement' && (
            <div>
              <EngagementReport platform={selectedPlatform} />
            </div>
          )}
          
          {activeTab === 'demographics' && (
            <div>
              <DemographicsReport platform={selectedPlatform} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView; 