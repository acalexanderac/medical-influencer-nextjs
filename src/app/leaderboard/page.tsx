'use client';
import { useEffect, useState } from 'react';
import { Influencer } from '@/app/types/types';
import { rankingService } from '@/services/rankingService';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { 
  TrophyIcon, 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/solid';

type SortField = 'trustScore' | 'followers' | 'claims' | 'views';
type SortOrder = 'asc' | 'desc';

export default function LeaderboardPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('trustScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await rankingService.getAllInfluencers();
        setInfluencers(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedInfluencers = [...influencers].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'trustScore':
        comparison = b.trustScore - a.trustScore;
        break;
      case 'followers':
        comparison = b.followers - a.followers;
        break;
      case 'claims':
        comparison = (b.claims?.length || 0) - (a.claims?.length || 0);
        break;
      case 'views':
        comparison = (b.stats?.totalViews || 0) - (a.stats?.totalViews || 0);
        break;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4" />
    ) : (
      <ArrowDownIcon className="w-4 h-4" />
    );
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 1:
        return 'bg-gray-50 text-gray-800 border-gray-200';
      case 2:
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />;
      case 2:
        return <TrophyIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-gray-500">{index + 1}</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ranking of health influencers by various metrics
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Influencer
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('trustScore')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Trust Score</span>
                      <SortIcon field="trustScore" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('followers')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Followers</span>
                      <SortIcon field="followers" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('claims')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Claims</span>
                      <SortIcon field="claims" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('views')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Views</span>
                      <SortIcon field="views" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedInfluencers.map((influencer, index) => (
                  <tr 
                    key={influencer.name}
                    className={`${
                      index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                      index === 1 ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200' :
                      index === 2 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200' :
                      'dark:hover:bg-gray-700/50 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/search?q=${encodeURIComponent(influencer.name)}`}
                        className="flex items-center"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {influencer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{influencer.handle}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {influencer.trustScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {influencer.followers.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {influencer.claims?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {influencer.stats?.totalViews.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 