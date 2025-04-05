'use client';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const AnalyticsView = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Analytics" />
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AnalyticsView; 