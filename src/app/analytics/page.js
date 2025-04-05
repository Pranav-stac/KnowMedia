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