import { supabase, isAuthenticated } from '@/lib/supabase';
import { Influencer, InfluencerStats } from '@/app/types/types';

export const rankingService = {
  async updateInfluencerStats(influencer: Influencer) {
    if (!(await isAuthenticated())) {
      console.error('Authentication required for updates');
      return null;
    }

    const { data, error } = await supabase
      .from('influencer_stats')
      .upsert({
        name: influencer.name,
        handle: influencer.handle,
        platform: influencer.platform,
        followers: influencer.followers,
        trust_score: influencer.trustScore,
        total_views: 1,
        last_viewed: new Date().toISOString(),
        claims_count: influencer.claims?.length || 0
      }, {
        onConflict: 'name',
        count: 'exact'
      });

    if (error) {
      console.error('Error updating stats:', error);
      return null;
    }

    return data;
  },

  async incrementViews(influencerName: string) {
    try {
      // Primero verificamos si el influencer existe
      const { data: currentData, error: fetchError } = await supabase
        .from('influencer_stats')
        .select('*')
        .eq('name', influencerName)
        .single();

      if (fetchError) {
        console.error('Error fetching influencer:', fetchError);
        // Si el error es que no se encontró, lo registramos específicamente
        if (fetchError.code === 'PGRST116') {
          console.log('Influencer not found:', influencerName);
        }
        return null;
      }

      if (!currentData) {
        console.log('No data found for influencer:', influencerName);
        return null;
      }

      // Luego actualizamos las vistas
      const { data, error } = await supabase
        .from('influencer_stats')
        .update({
          total_views: (currentData.total_views || 0) + 1,
          last_viewed: new Date().toISOString()
        })
        .eq('name', influencerName)
        .select('*');

      if (error) {
        console.error('Error updating views:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.error('No data returned after update');
        return null;
      }

      console.log('Successfully updated views for:', influencerName);
      return data;

    } catch (error) {
      console.error('Unexpected error in incrementViews:', error);
      return null;
    }
  },

  async getMostViewed(limit = 10) {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*')
      .order('total_views', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting most viewed:', error);
      return [];
    }

    // Convertir el formato de Supabase a nuestro formato de Influencer
    return data.map(item => ({
      name: item.name,
      handle: item.handle,
      platform: item.platform,
      followers: item.followers,
      trustScore: item.trust_score,
      profileImage: item.profile_image || '',
      claims: item.claims || [],
      stats: {
        totalViews: item.total_views,
        lastViewed: item.last_viewed,
        averageTrustScore: item.trust_score,
        claimsByCategory: item.claims_by_category || {},
        verificationStats: {
          verified: 0,
          questionable: 0,
          debunked: 0
        }
      }
    }));
  },

  async getTopTrusted(limit = 10) {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*')
      .order('trust_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting top trusted:', error);
      return [];
    }

    // Convertir el formato de Supabase a nuestro formato de Influencer
    return data.map(item => ({
      name: item.name,
      handle: item.handle,
      platform: item.platform,
      followers: item.followers,
      trustScore: item.trust_score,
      profileImage: item.profile_image || '',
      claims: item.claims || [],
      stats: {
        totalViews: item.total_views,
        lastViewed: item.last_viewed,
        averageTrustScore: item.trust_score,
        claimsByCategory: item.claims_by_category || {},
        verificationStats: {
          verified: 0,
          questionable: 0,
          debunked: 0
        }
      }
    }));
  },

  async getGlobalStats() {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*');

    if (error) {
      console.error('Error getting global stats:', error);
      return {
        totalInfluencers: 0,
        totalViews: 0,
        avgTrustScore: 0,
        totalClaims: 0
      };
    }

    const totalViews = data.reduce((acc, inf) => acc + (inf.total_views || 0), 0);
    const avgTrustScore = Math.round(
      data.reduce((acc, inf) => acc + (inf.trust_score || 0), 0) / (data.length || 1)
    );
    const totalClaims = data.reduce((acc, inf) => acc + (inf.claims?.length || 0), 0);

    return {
      totalInfluencers: data.length,
      totalViews,
      avgTrustScore,
      totalClaims
    };
  }
}; 