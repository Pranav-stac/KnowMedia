'use client';

import { Card, Title, Text, DonutChart, BarChart, Grid } from '@tremor/react';
import { UserGroupIcon, GlobeAltIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function DemographicsReport({ platform }) {
  // Sample data - replace with actual data from your API
  const ageData = [
    { name: '18-24', value: 35 },
    { name: '25-34', value: 45 },
    { name: '35-44', value: 15 },
    { name: '45-54', value: 3 },
    { name: '55+', value: 2 }
  ];

  const genderData = [
    { name: 'Male', value: 48 },
    { name: 'Female', value: 51 },
    { name: 'Other', value: 1 }
  ];

  const locationData = [
    { name: 'United States', value: 45, followers: 220 },
    { name: 'United Kingdom', value: 25, followers: 122 },
    { name: 'Canada', value: 15, followers: 73 },
    { name: 'Australia', value: 15, followers: 73 }
  ];

  const interestData = [
    { name: 'Technology', value: 68 },
    { name: 'Business', value: 54 },
    { name: 'Marketing', value: 47 },
    { name: 'Design', value: 42 },
    { name: 'Startups', value: 38 }
  ];

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} className="gap-6">
        {/* Age Distribution */}
        <Card className="p-4">
          <Title>Age Distribution</Title>
          <div className="mt-4 h-[300px] w-full">
            <DonutChart
              data={ageData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value}%`}
              colors={["blue", "cyan", "indigo", "violet", "purple"]}
              height="100%"
            />
          </div>
        </Card>

        {/* Gender Distribution */}
        <Card className="p-4">
          <Title>Gender Distribution</Title>
          <div className="mt-4 h-[300px] w-full">
            <DonutChart
              data={genderData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value}%`}
              colors={["blue", "pink", "purple"]}
              height="100%"
            />
          </div>
        </Card>
      </Grid>

      {/* Top Locations */}
      <Card className="p-4">
        <Title>Top Locations</Title>
        <div className="mt-4 h-[250px] w-full">
          <BarChart
            data={locationData}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={(value) => `${value}%`}
            yAxisWidth={48}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {locationData.map((location) => (
            <div key={location.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <Text className="text-sm">{location.name}</Text>
              <Text className="text-sm text-gray-400 ml-auto">{location.followers} followers</Text>
            </div>
          ))}
        </div>
      </Card>

      {/* Audience Interests */}
      <Card className="p-4">
        <Title>Audience Interests</Title>
        <div className="mt-4 flex flex-wrap gap-2">
          {interestData.map((interest) => (
            <div
              key={interest.name}
              className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <Text className="text-sm text-blue-500">
                {interest.name} ({interest.value}%)
              </Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 