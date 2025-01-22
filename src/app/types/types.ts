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

interface Evidence {
  source: string;
  link: string;
  description: string;
}

interface ExpertOpinion {
  expert: string;
  opinion: string;
}

interface Reference {
  title: string;
  authors: string;
  publication: string;
  year: string;
  link: string;
}

interface Analysis {
  summary: string;
  methodology: string;
  evidence: Evidence[];
  limitations: string[];
  conclusion: string;
  expertOpinions: ExpertOpinion[];
  references: Reference[];
}

export interface Claim {
  id: number;
  text: string;
  category: string;
  status: string;
  confidence: number;
  date: string;
  analysis: Analysis;
  influencer: {
    id: number;
    name: string;
    handle: string;
    platform: string;
    trustScore: number;
  };
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