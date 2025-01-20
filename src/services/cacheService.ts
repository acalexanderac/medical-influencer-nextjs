import { Influencer, CacheStore } from "@/app/types/types";

const CACHE_KEY = 'health_influencer_cache';

const INITIAL_DATA: CacheStore = {
  influencers: {
    "Dr. Mike Varshavski": {
      name: "Dr. Mike Varshavski",
      handle: "doctormike",
      platform: "YouTube",
      followers: 10200000,
      trustScore: 92,
      profileImage: "",
      claims: [
        {
          id: "1",
          text: "Regular exercise improves mental health",
          category: "Mental Health",
          status: "Verified",
          confidence: 95,
          date: "2024-03-15"
        }
      ]
    },
    "Dr. Eric Berg": {
      name: "Dr. Eric Berg",
      handle: "drberg",
      platform: "YouTube",
      followers: 9800000,
      trustScore: 85,
      claims: [
        {
          id: "2",
          text: "Intermittent fasting can help with insulin resistance",
          category: "Nutrition",
          status: "Verified",
          confidence: 90,
          date: "2024-03-10"
        }
      ]
    }
  },
  favorites: [],
  lastUpdated: {},
  stats: {
    "Dr. Mike Varshavski": {
      totalViews: 150,
      lastViewed: new Date().toISOString(),
      averageTrustScore: 92,
      claimsByCategory: { "Mental Health": 1 },
      verificationStats: { verified: 1, questionable: 0, debunked: 0 }
    },
    "Dr. Eric Berg": {
      totalViews: 120,
      lastViewed: new Date().toISOString(),
      averageTrustScore: 85,
      claimsByCategory: { "Nutrition": 1 },
      verificationStats: { verified: 1, questionable: 0, debunked: 0 }
    }
  },
  mostViewed: ["Dr. Mike Varshavski", "Dr. Eric Berg"]
};

export const cacheService = {
  getStore(): CacheStore {
    if (typeof window === 'undefined') return INITIAL_DATA;
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      this.saveStore(INITIAL_DATA);
      return INITIAL_DATA;
    }
    
    return JSON.parse(cached);
  },

  saveStore(store: CacheStore) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  },

  getInfluencer(name: string): Influencer | null {
    const store = this.getStore();
    const influencer = store.influencers[name];
    
    if (!influencer) {
      console.warn(`Influencer not found in cache: ${name}`);
      return null;
    }

    // Update view count
    if (store.stats[name]) {
      store.stats[name].totalViews = (store.stats[name].totalViews || 0) + 1;
      store.stats[name].lastViewed = new Date().toISOString();
      this.saveStore(store);
    }

    return {
      ...influencer,
      isFavorite: store.favorites.includes(name),
      lastAnalyzed: store.lastUpdated[name]
    };
  },

  saveInfluencer(influencer: Influencer) {
    const store = this.getStore();
    
    // Ensure required properties exist
    if (!influencer.name || !influencer.handle) {
      console.error('Invalid influencer data:', influencer);
      return;
    }

    // Save influencer data
    store.influencers[influencer.name] = {
      ...influencer,
      claims: influencer.claims || []
    };

    // Update last updated timestamp
    store.lastUpdated[influencer.name] = new Date().toISOString();

    // Initialize stats if they don't exist
    if (!store.stats[influencer.name]) {
      store.stats[influencer.name] = {
        totalViews: 0,
        lastViewed: new Date().toISOString(),
        averageTrustScore: influencer.trustScore,
        claimsByCategory: {},
        verificationStats: { verified: 0, questionable: 0, debunked: 0 }
      };
    }

    // Update most viewed list if not already present
    if (!store.mostViewed.includes(influencer.name)) {
      store.mostViewed.push(influencer.name);
    }

    this.saveStore(store);
  },

  toggleFavorite(name: string): boolean {
    const store = this.getStore();
    const index = store.favorites.indexOf(name);
    
    if (index === -1) {
      store.favorites.push(name);
    } else {
      store.favorites.splice(index, 1);
    }
    
    this.saveStore(store);
    return store.favorites.includes(name);
  }
}; 