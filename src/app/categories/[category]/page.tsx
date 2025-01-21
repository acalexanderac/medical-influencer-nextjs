'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Influencer } from '@/app/types/types';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  
  // Decodificar y normalizar el nombre de la categoría
  const category = decodeURIComponent(params.category as string)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  useEffect(() => {
    async function loadInfluencers() {
      try {
        const data = await rankingService.getInfluencersByCategory(category);
        setInfluencers(data);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInfluencers();
  }, [category]);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/categories"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to categories</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{category}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing {influencers.length} influencers in this category
          </p>
        </div>

        {influencers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {influencers.map((influencer) => (
              <Link
                key={influencer.name}
                href={`/search?q=${encodeURIComponent(influencer.name)}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {influencer.name}
                      </h2>
                      <p className="text-sm text-gray-600">@{influencer.handle}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {influencer.platform}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Trust Score</span>
                      <span className="text-sm font-medium text-gray-900">
                        {influencer.trustScore}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Claims</span>
                      <span className="text-sm font-medium text-gray-900">
                        {influencer.claims?.length || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Followers</span>
                      <span className="text-sm font-medium text-gray-900">
                        {influencer.followers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No influencers found in this category.</p>
            <Link
              href="/categories"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to categories
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 