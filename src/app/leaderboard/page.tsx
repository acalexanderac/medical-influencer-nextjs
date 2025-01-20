'use client';
import { useEffect, useState } from 'react';
import { Influencer, InfluencerStats } from '@/app/types/types';
import { rankingService } from '@/services/rankingService';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface InfluencerWithStats extends Influencer {
  stats?: InfluencerStats;
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
}

export default function Leaderboard() {
  const [mostViewed, setMostViewed] = useState<InfluencerWithStats[]>([]);
  const [topTrusted, setTopTrusted] = useState<Influencer[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalInfluencers: 0,
    totalViews: 0,
    avgTrustScore: 0,
    totalClaims: 0
  });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [viewed, trusted, stats] = await Promise.all([
        rankingService.getMostViewed(),
        rankingService.getTopTrusted(),
        rankingService.getGlobalStats()
      ]);

      setMostViewed(viewed);
      setTopTrusted(trusted);
      setGlobalStats(stats);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Health Influencer Rankings</h1>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Refresh Rankings'}
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Most Viewed Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Most Viewed</h2>
          <div className="space-y-4">
            {mostViewed.map((influencer) => (
              <Link 
                key={`viewed-${influencer.name}-${influencer.handle}`}
                href={`/influencer/${encodeURIComponent(influencer.name)}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{influencer.name}</h3>
                    <p className="text-sm text-gray-600">
                      Views: {influencer.stats?.totalViews || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Trust Score</div>
                    <div className="font-bold">{influencer.trustScore}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Trusted Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Most Trusted</h2>
          <div className="space-y-4">
            {topTrusted.map((influencer) => (
              <Link 
                key={`trusted-${influencer.name}-${influencer.handle}`}
                href={`/influencer/${encodeURIComponent(influencer.name)}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{influencer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {influencer.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Trust Score</div>
                    <div className="font-bold text-green-600">
                      {influencer.trustScore}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Global Stats Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Global Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            key="total-influencers"
            title="Total Influencers" 
            value={globalStats.totalInfluencers} 
          />
          <StatCard 
            key="claims-analyzed"
            title="Claims Analyzed" 
            value={globalStats.totalClaims} 
          />
          <StatCard 
            key="avg-trust-score"
            title="Avg Trust Score" 
            value={globalStats.avgTrustScore} 
            suffix="%" 
          />
          <StatCard 
            key="total-views"
            title="Total Views" 
            value={globalStats.totalViews} 
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix = '' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}{suffix}</div>
    </div>
  );
} 