import { CacheStore, Influencer, InfluencerStats } from "@/app/types/types";
import { cacheService } from "@/services/cacheService";

export const statsService = {
  updateStats(influencer: Influencer) {
    const store = cacheService.getStore();
    const stats = store.stats || {};
    const currentStats = stats[influencer.name] || this.initializeStats();

    // Update view count and last viewed
    currentStats.totalViews++;
    currentStats.lastViewed = new Date().toISOString();

    // Update category stats
    influencer.claims?.forEach(claim => {
      currentStats.claimsByCategory[claim.category] = 
        (currentStats.claimsByCategory[claim.category] || 0) + 1;
    });

    // Update verification stats
    currentStats.verificationStats = (influencer.claims || []).reduce((acc, claim) => {
      const status = claim.status.toLowerCase() as keyof typeof acc;
      acc[status]++;
      return acc;
    }, { verified: 0, questionable: 0, debunked: 0 });

    // Calculate average trust score
    currentStats.averageTrustScore = influencer.trustScore;

    // Update most viewed list
    const mostViewed = store.mostViewed || [];
    if (!mostViewed.includes(influencer.name)) {
      mostViewed.push(influencer.name);
    }
    
    // Sort by views
    mostViewed.sort((a, b) => 
      (stats[b]?.totalViews || 0) - (stats[a]?.totalViews || 0)
    );
    
    // Keep only top 50
    store.mostViewed = mostViewed.slice(0, 50);

    // Save updates
    store.stats = {
      ...stats,
      [influencer.name]: currentStats
    };
    
    cacheService.saveStore(store);
    return currentStats;
  },

  initializeStats(): InfluencerStats {
    return {
      totalViews: 0,
      lastViewed: new Date().toISOString(),
      averageTrustScore: 0,
      claimsByCategory: {},
      verificationStats: {
        verified: 0,
        questionable: 0,
        debunked: 0
      }
    };
  },

  getMostViewed(limit = 10): Influencer[] {
    const store = cacheService.getStore();
    const mostViewed = store.mostViewed || [];
    return mostViewed
      .slice(0, limit)
      .map(name => {
        const influencer = store.influencers[name];
        if (!influencer) return null;
        return {
          ...influencer,
          stats: store.stats[name]
        };
      })
      .filter(Boolean) as Influencer[];
  },

  getTopTrusted(limit = 10): Influencer[] {
    const store = cacheService.getStore();
    return Object.values(store.influencers)
      .filter(Boolean)
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
      .slice(0, limit);
  }
}; 