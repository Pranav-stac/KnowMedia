'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      {/* App Container */}
      <div className="w-full max-w-7xl mx-auto h-full overflow-hidden flex flex-col flex-1 relative">
        {/* Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout; 