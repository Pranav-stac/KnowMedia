'use client';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Grid from '../components/feed/Grid';

const FeedView = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Feed" />
        <Grid />
      </div>
    </div>
  );
};

export default FeedView; 