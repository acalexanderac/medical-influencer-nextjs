'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getDetailedAnalysis } from '@/services/googleAI';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BeakerIcon, DocumentTextIcon, AcademicCapIcon, LinkIcon } from '@heroicons/react/24/outline';

interface Analysis {
  analysis: string;
  evidenceLevel: string;
  sources: string[];
  recommendations: string[];
}

export default function ResearchPage() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await getDetailedAnalysis(claim);
      if (result) {
        setAnalysis(result);
      } else {
        setError('Could not analyze the claim. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research Analysis</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyze health claims with AI-powered research tools
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Enter a health claim to analyze</span>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Example: Drinking lemon water every morning boosts metabolism..."
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:border-blue-500 dark:focus:border-blue-400 
                         focus:ring-blue-500 dark:focus:ring-blue-400
                         placeholder-gray-400 dark:placeholder-gray-500"
                rows={3}
              />
            </label>

            <button
              onClick={handleAnalyze}
              disabled={loading || !claim.trim()}
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white 
                       rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
            >
              {loading ? 'Analyzing...' : 'Analyze Claim'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-500">Analyzing claim...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BeakerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analysis</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis.analysis}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Evidence Level</h2>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.evidenceLevel === 'Strong' 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                    : analysis.evidenceLevel === 'Moderate'
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                }`}>
                  {analysis.evidenceLevel}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <LinkIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sources</h2>
                  </div>
                  <ul className="space-y-2">
                    {analysis.sources.map((source, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <DocumentTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recommendations</h2>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 