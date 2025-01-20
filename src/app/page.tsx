'use client';

import { useState } from 'react';
import { Influencer } from '@/app/types/types';
import { analyzeInfluencer, getDetailedAnalysis } from '@/services/googleAI';

interface DetailedAnalysis {
  analysis: string;
  evidenceLevel: string;
  sources: string[];
  recommendations: string[];
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await analyzeInfluencer(searchTerm);
      if (data) {
        setInfluencer(data);
        setError(null);
      } else {
        setError("Couldn't analyze this influencer. Try another name or check the spelling.");
        setInfluencer(null);
      }
    } catch (error) {
      console.error('Error analyzing influencer:', error);
      setError("Something went wrong. Please try again with a different influencer.");
      setInfluencer(null);
    }
    setLoading(false);
  };

  const handleClaimClick = async (claim: string) => {
    setSelectedClaim(claim);
    try {
      const analysis = await getDetailedAnalysis(claim);
      if (analysis) {
        setDetailedAnalysis(analysis);
      } else {
        setError("Couldn't analyze this claim. Try another one.");
      }
    } catch (error) {
      console.error('Error analyzing claim:', error);
      setError("Failed to analyze the claim. Please try again.");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Health Influencer Analyzer</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter influencer name (e.g., Dr. Mike)"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p>{error}</p>
            <p className="text-sm mt-2">
              Try these popular influencers:
              <span className="font-medium"> Dr Mike Varshavski, Dr Mark Hyman, Dr Andrew Huberman</span>
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3">Analyzing influencer...</span>
          </div>
        )}

        {influencer && !loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">{influencer.name}</h2>
                <p className="text-gray-600">@{influencer.handle}</p>
                <p className="text-sm">{influencer.followers.toLocaleString()} followers</p>
              </div>
              <div className="ml-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">{influencer.trustScore}</div>
                  <div className="text-sm text-gray-600">Trust Score</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recent Claims</h3>
              {influencer.claims.map((claim) => (
                <div 
                  key={claim.id} 
                  className="border rounded p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleClaimClick(claim.text)}
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

                  {selectedClaim === claim.text && detailedAnalysis && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold mb-2">Detailed Analysis</h4>
                      <p className="mb-2">{detailedAnalysis.analysis}</p>
                      <div className="text-sm">
                        <p className="font-semibold">Evidence Level: 
                          <span className={`ml-2 px-2 py-1 rounded ${
                            detailedAnalysis.evidenceLevel === 'Strong' ? 'bg-green-100' :
                            detailedAnalysis.evidenceLevel === 'Moderate' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            {detailedAnalysis.evidenceLevel}
                          </span>
                        </p>
                        <div className="mt-2">
                          <p className="font-semibold">Key Recommendations:</p>
                          <ul className="list-disc list-inside">
                            {detailedAnalysis.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 