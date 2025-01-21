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
  id: number;
  text: string;
  status: string;
  category: string;
  date: string;
  confidence: number;
  analysis: {
    methodology: string;
    evidence: string[];
    limitations: string[];
    conclusion: string;
  };
  influencer: {
    id: number;
    name: string;
    handle: string;
    platform: string;
    trustScore: number;
  };
  sources: string[];
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