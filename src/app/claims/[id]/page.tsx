'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { rankingService } from '@/services/rankingService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  BeakerIcon,
  DocumentTextIcon,
  LinkIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Claim } from '@/app/types/types';

export default function ClaimDetailPage() {
  const params = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaimDetail() {
      try {
        const claimId = parseInt(params.id as string, 10);
        if (isNaN(claimId)) {
          console.error('Invalid claim ID');
          setLoading(false);
          return;
        }

        const data = await rankingService.getClaimById(claimId);
        setClaim(data);
      } catch (error) {
        console.error('Error loading claim:', error);
      } finally {
        setLoading(false);
      }
    }

    loadClaimDetail();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!claim) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Claim Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The claim you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/claims"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Claims
        </Link>
      </div>
    </DashboardLayout>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      case 'Questionable':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'Debunked':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/claims"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Claims
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Claim Analysis</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
              {claim.status}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(claim.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Claim Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-lg text-gray-900 dark:text-white">{claim.text}</p>
          <div className="mt-4 flex items-center space-x-4">
            <Link
              href={`/search?q=${encodeURIComponent(claim.influencer.name)}`}
              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <UserIcon className="w-5 h-5" />
              <span>@{claim.influencer.handle}</span>
            </Link>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-600 dark:text-gray-300">{claim.category}</span>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Methodology */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BeakerIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Methodology</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{claim.analysis.methodology}</p>
          </div>

          {/* Evidence */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Evidence</h2>
            </div>
            <ul className="space-y-2">
              {claim.analysis.evidence.map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">• {item}</li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Limitations</h2>
            </div>
            <ul className="space-y-2">
              {claim.analysis.limitations.map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">• {item}</li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <LinkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sources</h2>
            </div>
            <ul className="space-y-2">
              {claim.sources.map((source, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  <a href={source} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-blue-600 dark:hover:text-blue-400">
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Conclusion</h2>
          <p className="text-gray-700 dark:text-gray-300">{claim.analysis.conclusion}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</span>
            <span className="text-lg font-medium text-gray-900 dark:text-white">{claim.confidence}%</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 