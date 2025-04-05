const EngagementReport = ({ platform = 'all' }) => {
  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Total Engagement</p>
            <p className="text-2xl font-bold">2,847</p>
            <p className="text-xs text-green-500">↑ 12.5% from last month</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold">4.2%</p>
            <p className="text-xs text-green-500">↑ 0.8% from last month</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Avg. Interactions</p>
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-red-500">↓ 3.2% from last month</p>
          </div>
        </div>
      </div>

      {/* Engagement by Type */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Engagement by Type</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Likes</p>
            <p className="text-xl font-bold">1,523</p>
            <div className="h-1 bg-[var(--border)] rounded-full mt-2">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Comments</p>
            <p className="text-xl font-bold">847</p>
            <div className="h-1 bg-[var(--border)] rounded-full mt-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Shares</p>
            <p className="text-xl font-bold">312</p>
            <div className="h-1 bg-[var(--border)] rounded-full mt-2">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Saves</p>
            <p className="text-xl font-bold">165</p>
            <div className="h-1 bg-[var(--border)] rounded-full mt-2">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          <div className="bg-[var(--background)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--border)] rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-medium mb-1">Time Management Tips for Professionals</p>
              <p className="text-sm text-[var(--muted)]">Posted 3 days ago • 523 engagements</p>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--border)] rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-medium mb-1">Behind the Scenes: Product Development</p>
              <p className="text-sm text-[var(--muted)]">Posted 5 days ago • 412 engagements</p>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--border)] rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-medium mb-1">Industry Trends for 2024</p>
              <p className="text-sm text-[var(--muted)]">Posted 1 week ago • 387 engagements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementReport; 