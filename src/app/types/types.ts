export interface Influencer {
  name: string;
  handle: string;
  platform: string;
  followers: number;
  trustScore: number;
  claims: Claim[];
  profileImage?: string;
  isFavorite?: boolean;
  lastAnalyzed?: string;
  stats?: InfluencerStats;
}

export interface Claim {
  id: string;
  text: string;
  category: 'Nutrition' | 'Medicine' | 'Mental Health' | 'Fitness';
  status: 'Verified' | 'Questionable' | 'Debunked';
  confidence: number;
  source?: string;
  date: string;
}

export interface DetailedAnalysis {
  analysis: string;
  evidenceLevel: 'Strong' | 'Moderate' | 'Weak' | 'None';
  sources: string[];
  recommendations: string[];
}

export interface InfluencerStats {
  totalViews: number;
  lastViewed: string;
  averageTrustScore: number;
  claimsByCategory: Record<string, number>;
  verificationStats: {
    verified: number;
    questionable: number;
    debunked: number;
  };
}

export interface CacheStore {
  influencers: Record<string, Influencer>;
  favorites: string[];
  lastUpdated: Record<string, string>;
  stats: Record<string, InfluencerStats>;
  mostViewed: string[];
} 