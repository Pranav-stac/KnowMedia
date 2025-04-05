const DemographicsReport = ({ platform = 'all' }) => {
  return (
    <div className="space-y-6">
      {/* Age Distribution */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[var(--muted)]">18-24</span>
              <span className="text-sm font-medium">28%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[var(--muted)]">25-34</span>
              <span className="text-sm font-medium">42%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[var(--muted)]">35-44</span>
              <span className="text-sm font-medium">18%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[var(--muted)]">45-54</span>
              <span className="text-sm font-medium">8%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[var(--muted)]">55+</span>
              <span className="text-sm font-medium">4%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '4%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold mb-1">48%</p>
            <p className="text-sm text-[var(--muted)]">Male</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold mb-1">51%</p>
            <p className="text-sm text-[var(--muted)]">Female</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold mb-1">1%</p>
            <p className="text-sm text-[var(--muted)]">Other</p>
          </div>
        </div>
      </div>

      {/* Location Distribution */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center text-sm">🇺🇸</div>
              <div>
                <p className="font-medium">United States</p>
                <p className="text-sm text-[var(--muted)]">42% of audience</p>
              </div>
            </div>
            <div className="text-sm font-medium">156,847 followers</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center text-sm">🇬🇧</div>
              <div>
                <p className="font-medium">United Kingdom</p>
                <p className="text-sm text-[var(--muted)]">18% of audience</p>
              </div>
            </div>
            <div className="text-sm font-medium">67,234 followers</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center text-sm">🇨🇦</div>
              <div>
                <p className="font-medium">Canada</p>
                <p className="text-sm text-[var(--muted)]">12% of audience</p>
              </div>
            </div>
            <div className="text-sm font-medium">44,823 followers</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center text-sm">🇦🇺</div>
              <div>
                <p className="font-medium">Australia</p>
                <p className="text-sm text-[var(--muted)]">8% of audience</p>
              </div>
            </div>
            <div className="text-sm font-medium">29,882 followers</div>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Audience Interests</h3>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Technology (68%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Business (54%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Marketing (47%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Entrepreneurship (42%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Innovation (38%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Leadership (35%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Design (32%)
          </div>
          <div className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
            Finance (28%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsReport; 