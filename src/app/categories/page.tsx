'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

const categories = [
  {
    name: 'Nutrition',
    description: 'Diet, supplements, and nutritional advice',
    icon: '🥗',
    color: 'bg-green-100 text-green-800'
  },
  {
    name: 'Fitness',
    description: 'Exercise, workouts, and physical health',
    icon: '💪',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'Mental Health',
    description: 'Psychology, well-being, and mental wellness',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    name: 'Medicine',
    description: 'Medical advice and healthcare information',
    icon: '⚕️',
    color: 'bg-red-100 text-red-800'
  }
];

interface CategoryStats {
  claims: number;
  topInfluencer: {
    name: string;
    trustScore: number;
  };
}

export default function Categories() {
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [topInfluencers, setTopInfluencers] = useState<Record<string, { name: string; trustScore: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await rankingService.getCategoryStats();
        const influencersPromises = categories.map(async (category) => {
          const topInfluencer = await rankingService.getTopInfluencerByCategory(category.name);
          return [category.name, topInfluencer];
        });

        const influencersResults = await Promise.all(influencersPromises);
        const influencersMap = Object.fromEntries(influencersResults);

        setCategoryStats(stats);
        setTopInfluencers(influencersMap);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse health claims by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name.toLowerCase()}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow transition-transform hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                    {categoryStats[category.name] || 0} claims
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{category.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Top Influencer</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {topInfluencers[category.name]?.name || 'No data'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Trust Score</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {topInfluencers[category.name]?.trustScore || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 