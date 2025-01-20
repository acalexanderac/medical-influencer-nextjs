import { Influencer, CacheStore } from '../types/types';

const CACHE_KEY = 'health_influencer_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const cacheService = {
  getStore(): CacheStore {
    if (typeof window === 'undefined') return {
      influencers: {},
      favorites: [],
      lastUpdated: {},
      stats: {},        // Add stats property
      mostViewed: []    // Add mostViewed property
    };
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {
      influencers: {},
      favorites: [],
      lastUpdated: {},
      stats: {},        // Add stats property
      mostViewed: []    // Add mostViewed property
    };
  },

  saveStore(store: CacheStore) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  },

  getInfluencer(name: string): Influencer | null {
    const store = this.getStore();
    const influencer = store.influencers[name];
    const lastUpdated = store.lastUpdated[name];

    if (!influencer || !lastUpdated) return null;

    // Check if cache is still valid
    const isExpired = Date.now() - new Date(lastUpdated).getTime() > CACHE_DURATION;
    return isExpired ? null : influencer;
  },

  saveInfluencer(influencer: Influencer) {
    const store = this.getStore();
    store.influencers[influencer.name] = influencer;
    store.lastUpdated[influencer.name] = new Date().toISOString();
    this.saveStore(store);
  },

  toggleFavorite(name: string) {
    const store = this.getStore();
    const index = store.favorites.indexOf(name);
    
    if (index === -1) {
      store.favorites.push(name);
    } else {
      store.favorites.splice(index, 1);
    }
    
    this.saveStore(store);
    return store.favorites.includes(name);
  },

  getFavorites(): string[] {
    return this.getStore().favorites;
  }
}; 