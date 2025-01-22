'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Influencer } from '@/app/types/types';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function InfluencerPage() {
  const params = useParams();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInfluencer() {
      if (!params?.name) {
        setError('Invalid influencer name');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const name = decodeURIComponent(params.name as string);
        
        // Incrementar vistas
        const result = await rankingService.incrementViews(name);
        
        if (!result) {
          setError('Could not find this influencer');
          return;
        }

        // Convertir los datos de Supabase al formato de Influencer
        const influencerData: Influencer = {
          name: result[0].name,
          handle: result[0].handle,
          platform: result[0].platform,
          followers: result[0].followers,
          trustScore: result[0].trust_score,
          profileImage: '',
          claims: result[0].claims || [],
          stats: {
            totalViews: result[0].total_views,
            lastViewed: result[0].last_viewed,
            averageTrustScore: result[0].trust_score,
            claimsByCategory: {},
            verificationStats: {
              verified: 0,
              questionable: 0,
              debunked: 0
            }
          }
        };

        setInfluencer(influencerData);
        setError(null);
      } catch (err) {
        console.error('Error loading influencer:', err);
        setError('Failed to load influencer data');
      } finally {
        setLoading(false);
      }
    }

    loadInfluencer();
  }, [params?.name]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          <p>{error}</p>
          <p className="text-sm mt-2">Try searching for another influencer</p>
        </div>
      </div>
    );
  }

  if (!influencer) return null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{influencer.name}</h1>
            <p className="text-gray-600">@{influencer.handle}</p>
            <p className="text-sm">{influencer.followers.toLocaleString()} followers</p>
          </div>
          <div className="ml-auto text-center">
            <div className="text-3xl font-bold">{influencer.trustScore}</div>
            <div className="text-sm text-gray-600">Trust Score</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Views</div>
            <div className="text-xl font-bold">{influencer.stats?.totalViews || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Claims</div>
            <div className="text-xl font-bold">{influencer.claims?.length || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Platform</div>
            <div className="text-xl font-bold">{influencer.platform}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Last Viewed</div>
            <div className="text-sm font-medium">
              {new Date(influencer.stats?.lastViewed || '').toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Claims */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Health Claims</h2>
          <div className="space-y-4">
            {influencer.claims?.map((claim) => (
              <Link 
                key={claim.id} 
                href={`/claims/${claim.id}`}
                className="block border rounded p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="flex-1">{claim.text}</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    claim.status === 'Verified' ? 'bg-green-100 text-green-800' :
                    claim.status === 'Questionable' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{claim.category}</span>
                  <span>Confidence: {claim.confidence}%</span>
                </div>
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
      </div>
    </div>
  );
} 