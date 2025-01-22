'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { rankingService } from '@/services/rankingService';
import DashboardLayout from '@/components/DashboardLayout';
import { Influencer } from '@/app/types/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') ?? '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Influencer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const influencer = await rankingService.findOrCreateInfluencer(searchTerm);
      if (influencer) {
        setResult(influencer);
      } else {
        setError('Could not find or create influencer profile');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing results for "{initialQuery}"
          </p>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{result.name}</h2>
                  <p className="text-gray-600">@{result.handle}</p>
                </div>
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {result.platform}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Trust Score</div>
                  <div className="text-2xl font-bold text-gray-900">{result.trustScore}%</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">Followers</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.followers.toLocaleString()}
                  </div>
                </div>
              </div>

              {result.claims && result.claims.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Claims</h3>
                  <div className="space-y-3">
                    {result.claims.slice(0, 3).map((claim, index) => (
                      <Link 
                        key={index} 
                        href={`/claims/${claim.id}`}
                        className="block bg-gray-50 p-4 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {claim.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            claim.status === 'Verified' 
                              ? 'bg-green-100 text-green-800'
                              : claim.status === 'Questionable'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-gray-700">{claim.text}</p>
                        
                        {/* Preview of analysis with null check */}
                        {claim.analysis?.summary && (
                          <div className="mt-2 text-sm text-gray-600">
                            {claim.analysis.summary}
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm text-blue-600 flex items-center">
                          <span>View full analysis</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No results found for "{initialQuery}"</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 