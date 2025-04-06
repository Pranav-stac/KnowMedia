import { Card, Title, Text, AreaChart } from '@tremor/react';

export default function PostsAnalysis({ posts }) {
  if (!posts || posts.length === 0) return null;

  // Sort posts by timestamp
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Prepare data for the chart
  const chartData = sortedPosts.map(post => ({
    date: new Date(post.timestamp).toLocaleDateString(),
    likes: post.likes,
    comments: post.comments,
    engagement: post.engagement_rate
  }));

  return (
    <div className="space-y-6">
      <div>
        <Title>Posts Performance Over Time</Title>
        <Text>Tracking engagement metrics across your recent posts</Text>
      </div>

      <Card>
        <AreaChart
          data={chartData}
          index="date"
          categories={["likes", "comments", "engagement"]}
          colors={["blue", "green", "purple"]}
          valueFormatter={(value) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toFixed(0);
          }}
          yAxisWidth={48}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedPosts.map((post, index) => (
          <Card key={post.post_id} className="flex space-x-4">
            {post.thumbnail_url && (
              <img
                src={post.thumbnail_url}
                alt={`Post ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <Text className="font-medium">
                Posted on {new Date(post.timestamp).toLocaleDateString()}
              </Text>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <Text className="text-sm text-gray-500">Likes</Text>
                  <Text className="font-medium">{post.likes.toLocaleString()}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Comments</Text>
                  <Text className="font-medium">{post.comments.toLocaleString()}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500">Engagement</Text>
                  <Text className="font-medium">{post.engagement_rate.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 