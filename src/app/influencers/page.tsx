'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { Influencer } from '@/app/types/types';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('trustScore');

  useEffect(() => {
    async function loadInfluencers() {
      try {
        const data = await rankingService.getAllInfluencers();
        setInfluencers(data);
        setFilteredInfluencers(data);
      } catch (error) {
        console.error('Error loading influencers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInfluencers();
  }, []);

  useEffect(() => {
    let result = [...influencers];

    // Aplicar búsqueda
    if (searchTerm) {
      result = result.filter(
        inf => 
          inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de plataforma
    if (selectedPlatform !== 'All') {
      result = result.filter(inf => inf.platform === selectedPlatform);
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case 'trustScore':
          return b.trustScore - a.trustScore;
        case 'followers':
          return b.followers - a.followers;
        case 'views':
          return (b.stats?.totalViews || 0) - (a.stats?.totalViews || 0);
        default:
          return 0;
      }
    });

    setFilteredInfluencers(result);
  }, [searchTerm, selectedPlatform, sortBy, influencers]);

  if (loading) return <LoadingSpinner />;

  const platforms = ['All', ...new Set(influencers.map(inf => inf.platform))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Influencers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse and analyze health influencers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="All">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="trustScore">Trust Score</option>
              <option value="followers">Followers</option>
              <option value="claims">Claims</option>
            </select>
          </div>
        </div>

        {/* Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <Link
              key={influencer.name}
              href={`/search?q=${encodeURIComponent(influencer.name)}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {influencer.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{influencer.handle}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 
                                text-blue-800 dark:text-blue-200 rounded-full">
                    {influencer.platform}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Trust Score</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {influencer.trustScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Claims</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {influencer.claims?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Views</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {influencer.stats?.totalViews.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              No influencers found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 