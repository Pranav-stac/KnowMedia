import { Card, Title, BarChart, Text } from '@tremor/react';

export default function EngagementChart({ data }) {
  if (!data) return null;

  const chartData = [
    {
      name: 'Average Likes',
      value: data.average_likes,
    },
    {
      name: 'Average Comments',
      value: data.average_comments,
    },
    {
      name: 'Best Engagement Rate',
      value: data.best_engagement_rate,
    },
    {
      name: 'Average Engagement Rate',
      value: data.average_engagement_rate,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Title>Engagement Overview</Title>
        <Text>Based on {data.posts_analyzed} recent posts</Text>
      </div>

      <Card>
        <BarChart
          data={chartData}
          index="name"
          categories={["value"]}
          colors={["blue"]}
          valueFormatter={(value) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toFixed(1);
          }}
          yAxisWidth={48}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card decoration="top" decorationColor="indigo">
          <Title>Total Engagement</Title>
          <Text className="mt-2">
            {data.total_engagement.toLocaleString()} interactions
          </Text>
        </Card>
        
        <Card decoration="top" decorationColor="cyan">
          <Title>Best Engagement Rate</Title>
          <Text className="mt-2">
            {data.best_engagement_rate.toFixed(2)}%
          </Text>
        </Card>
      </div>
    </div>
  );
} 