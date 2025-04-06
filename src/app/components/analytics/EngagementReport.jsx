'use client';

import { Card, Title, Text, AreaChart, Grid } from '@tremor/react';
import { ArrowTrendingUpIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function EngagementReport({ platform }) {
  return (
    <div className="space-y-6">
      {/* Overall Engagement Card */}
      <Card className="p-4">
        <Title>Overall Engagement</Title>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mt-4">
          <Card className="bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Text className="text-gray-400">Engagement Rate</Text>
                <div className="flex items-baseline gap-1">
                  <Text className="text-2xl font-bold text-white">33.39%</Text>
                  <Text className="text-green-500 text-sm">+5.2%</Text>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <Text className="text-gray-400">Average Likes</Text>
                <div className="flex items-baseline gap-1">
                  <Text className="text-2xl font-bold text-white">142</Text>
                  <Text className="text-green-500 text-sm">+12.5%</Text>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ChatBubbleLeftIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Text className="text-gray-400">Average Comments</Text>
                <div className="flex items-baseline gap-1">
                  <Text className="text-2xl font-bold text-white">21</Text>
                  <Text className="text-green-500 text-sm">+8.3%</Text>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShareIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <Text className="text-gray-400">Total Engagement</Text>
                <div className="flex items-baseline gap-1">
                  <Text className="text-2xl font-bold text-white">1,309</Text>
                  <Text className="text-green-500 text-sm">+15.7%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Grid>
      </Card>

      {/* Engagement Over Time Chart */}
      <Card className="p-4">
        <Title>Engagement Over Time</Title>
        <div className="mt-4 h-80">
          <AreaChart
            data={[
              { date: '2024-03-01', engagement: 33.39, likes: 142, comments: 21 },
              { date: '2024-02-01', engagement: 31.52, likes: 136, comments: 19 },
              { date: '2024-01-01', engagement: 29.79, likes: 128, comments: 18 },
              { date: '2023-12-01', engagement: 32.65, likes: 134, comments: 22 },
              { date: '2023-11-01', engagement: 33.67, likes: 147, comments: 23 },
              { date: '2023-10-01', engagement: 30.81, likes: 127, comments: 20 }
            ]}
            index="date"
            categories={["engagement", "likes", "comments"]}
            colors={["blue", "red", "green"]}
            valueFormatter={(value) => `${value}${typeof value === 'number' && value > 100 ? '' : '%'}`}
            yAxisWidth={48}
          />
        </div>
      </Card>
    </div>
  );
} 