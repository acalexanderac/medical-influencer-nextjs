'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface DashboardStats {
  totalInfluencers: number;
  totalViews: number;
  avgTrustScore: number;
  totalClaims: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInfluencers: 0,
    totalViews: 0,
    avgTrustScore: 0,
    totalClaims: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await rankingService.getGlobalStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor health influencer metrics and claims analysis
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Influencers</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalInfluencers}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Trust Score</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.avgTrustScore}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Claims Analyzed</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClaims}</p>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/leaderboard" 
                className="block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                         rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                View Rankings
              </Link>
              <Link 
                href="/categories" 
                className="block px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 
                         rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Updates</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Latest Analysis</p>
              <p className="mt-1 text-gray-900 dark:text-gray-300">Updated {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 
                               text-green-800 dark:text-green-200 rounded-full">
                  All systems operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 
                               text-blue-800 dark:text-blue-200 rounded-full">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New claim analyzed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.floor(Math.random() * 24)} hours ago
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 