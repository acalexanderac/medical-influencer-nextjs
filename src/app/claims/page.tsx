'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Claim } from '@/app/types/types';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    async function loadClaims() {
      try {
        const data = await rankingService.getAllClaims();
        setClaims(data);
        setFilteredClaims(data);
      } catch (error) {
        console.error('Error loading claims:', error);
      } finally {
        setLoading(false);
      }
    }

    loadClaims();
  }, []);

  useEffect(() => {
    let result = [...claims];

    if (searchTerm) {
      result = result.filter(
        claim => 
          claim.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(claim => claim.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(claim => claim.status === selectedStatus);
    }

    // Ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'confidence-asc':
          return a.confidence - b.confidence;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    setFilteredClaims(result);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, claims]);

  if (loading) return <LoadingSpinner />;

  const categories = ['All', 'Nutrition', 'Fitness', 'Mental Health', 'Medicine'];
  const statuses = ['All', 'Verified', 'Questionable', 'Debunked'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Questionable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Debunked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse and analyze health claims
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search claims..."
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="All">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="date">Most Recent</option>
              <option value="confidence">Most Convincing</option>
              <option value="confidence-asc">Least Convincing</option>
            </select>
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id.toString()}`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          claim.status === 'Verified' 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                            : claim.status === 'Questionable'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                        }`}>
                          {claim.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{claim.category}</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{claim.text}</p>
                      <Link
                        href={`/search?q=${encodeURIComponent(claim.influencer.name)}`}
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 
                                hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <span>@{claim.influencer.handle}</span>
                        <span>·</span>
                        <span>{claim.influencer.platform}</span>
                        <span>·</span>
                        <span>Trust Score: {claim.influencer.trustScore}%</span>
                      </Link>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(claim.date).toLocaleDateString()}
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        Confidence: {claim.confidence}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No claims found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 