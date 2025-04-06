import { Card, Text, Metric, Flex, ProgressBar } from '@tremor/react';
import { UserIcon, UsersIcon, PhotoIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function AccountSummary({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <img 
          src={data.profile_pic_url} 
          alt={data.username}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <Text className="text-xl font-bold">{data.username}</Text>
          <div className="flex items-center space-x-1">
            <Text>{data.full_name}</Text>
            {data.is_verified && (
              <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
            )}
          </div>
        </div>
      </div>

      <Text className="mt-2">{data.bio}</Text>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <UsersIcon className="w-8 h-8 text-blue-500" />
            <div>
              <Text>Followers</Text>
              <Metric>{data.followers.toLocaleString()}</Metric>
            </div>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="green">
          <Flex justifyContent="start" className="space-x-4">
            <UserIcon className="w-8 h-8 text-green-500" />
            <div>
              <Text>Following</Text>
              <Metric>{data.following.toLocaleString()}</Metric>
            </div>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <Flex justifyContent="start" className="space-x-4">
            <PhotoIcon className="w-8 h-8 text-purple-500" />
            <div>
              <Text>Posts</Text>
              <Metric>{data.posts_count.toLocaleString()}</Metric>
            </div>
          </Flex>
        </Card>
      </div>
    </div>
  );
} 