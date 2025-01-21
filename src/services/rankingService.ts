import { supabase, isAuthenticated } from '@/lib/supabase';
import { Influencer, InfluencerStats, Claim } from '@/app/types/types';

// Funciones auxiliares
function mapInfluencerData(data: any): Influencer {
  return {
    name: data.name,
    handle: data.handle,
    platform: data.platform,
    followers: data.followers,
    trustScore: data.trust_score,
    profileImage: data.profile_image || '',
    claims: data.claims || [],
    stats: {
      totalViews: data.total_views,
      lastViewed: data.last_viewed,
      averageTrustScore: data.trust_score,
      claimsByCategory: data.claims_by_category || {},
      verificationStats: {
        verified: 0,
        questionable: 0,
        debunked: 0
      }
    }
  };
}

function calculateClaimsByCategory(claims: any[]): Record<string, number> {
  const categories: Record<string, number> = {};
  claims.forEach(claim => {
    if (claim.category) {
      categories[claim.category] = (categories[claim.category] || 0) + 1;
    }
  });
  return categories;
}

function extractCategories(claims: any[]): string[] {
  return Array.from(new Set(claims.map(claim => claim.category)));
}

// Interfaces para los datos de Supabase
interface SupabaseInfluencerJoin {
  id: number;
  name: string;
  handle: string;
  platform: string;
  trust_score: number;
}

interface SupabaseClaim {
  id: number;
  text: string;
  status: string;
  category: string;
  date: string;
  confidence: number;
  methodology: string | null;
  evidence: string[] | null;
  limitations: string[] | null;
  conclusion: string | null;
  sources: string[] | null;
  influencer_id: number;
  influencer: SupabaseInfluencerJoin;
}

interface SupabaseInfluencer {
  id: number;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  trust_score: number;
  profile_image: string | null;
  claims: any[] | null;
  total_views: number;
  last_viewed: string;
  claims_count: number;
  claims_by_category: Record<string, number> | null;
  categories: string[] | null;
}

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
  },

  async getInfluencersByCategory(category: string) {
    // Normalizar el nombre de la categoría
    const normalizedCategory = category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*')
      .contains('categories', [normalizedCategory])
      .order('trust_score', { ascending: false });

    if (error) {
      console.error('Error getting influencers by category:', error);
      return [];
    }

    return data.map(item => ({
      name: item.name,
      handle: item.handle,
      platform: item.platform,
      followers: item.followers,
      trustScore: item.trust_score,
      profileImage: item.profile_image || '',
      claims: (item.claims || []).filter((claim: { category: string }) => 
        claim.category === normalizedCategory
      ),
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

  async getCategoryStats() {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('claims, claims_by_category');

    if (error) {
      console.error('Error getting category stats:', error);
      return {};
    }

    // Contar claims por categoría
    const stats: Record<string, number> = {
      'Nutrition': 0,
      'Fitness': 0,
      'Mental Health': 0,
      'Medicine': 0
    };

    data.forEach(item => {
      if (item.claims_by_category) {
        Object.entries(item.claims_by_category).forEach(([category, count]) => {
          if (stats[category] !== undefined) {
            stats[category] += count as number;
          }
        });
      }
    });

    return stats;
  },

  async getAllInfluencers() {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*')
      .order('trust_score', { ascending: false });

    if (error) {
      console.error('Error getting all influencers:', error);
      return [];
    }

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

  async getAllClaims(): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        influencer:influencer_id (
          id,
          name,
          handle,
          platform,
          trust_score
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting claims:', error);
      return [];
    }

    return (data as unknown as SupabaseClaim[]).map(mapClaimFromDB);
  },

  async getClaimById(claimId: number): Promise<Claim | null> {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        id,
        text,
        status,
        category,
        date,
        confidence,
        methodology,
        evidence,
        limitations,
        conclusion,
        sources,
        influencer_id,
        influencer:influencer_id (
          id,
          name,
          handle,
          platform,
          trust_score
        )
      `)
      .eq('id', claimId)
      .single();

    if (error) {
      console.error('Error getting claim:', error);
      return null;
    }

    const claim = data as unknown as SupabaseClaim;
    return {
      id: claim.id,
      text: claim.text,
      status: claim.status,
      category: claim.category,
      date: claim.date,
      confidence: claim.confidence,
      analysis: {
        methodology: claim.methodology || 'Standard scientific analysis methodology',
        evidence: claim.evidence || [],
        limitations: claim.limitations || [],
        conclusion: claim.conclusion || 'Pending detailed analysis'
      },
      influencer: {
        id: claim.influencer.id,
        name: claim.influencer.name,
        handle: claim.influencer.handle,
        platform: claim.influencer.platform,
        trustScore: claim.influencer.trust_score
      },
      sources: claim.sources || []
    };
  },

  async getTopInfluencerByCategory(category: string) {
    const { data, error } = await supabase
      .from('influencer_stats')
      .select('*')
      .contains('categories', [category])
      .order('trust_score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('Error getting top influencer for category:', error);
      return {
        name: 'N/A',
        trustScore: 0
      };
    }

    return {
      name: data.name,
      trustScore: data.trust_score
    };
  },

  async findOrCreateInfluencer(name: string) {
    try {
      const { data: existingInfluencer, error: searchError } = await supabase
        .from('influencer_stats')
        .select('*')
        .ilike('name', name)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching for influencer:', searchError);
        throw searchError;
      }

      if (existingInfluencer) {
        return mapInfluencerData(existingInfluencer);
      }

      const { analyzeInfluencer } = await import('@/services/googleAI');
      const aiData = await analyzeInfluencer(name);

      if (!aiData) {
        console.error('Failed to get AI data for:', name);
        return null;
      }

      // Primero crear el influencer
      const { data: newInfluencer, error: createError } = await supabase
        .from('influencer_stats')
        .insert([{
          name: aiData.name,
          handle: aiData.handle || name.toLowerCase().replace(/\s+/g, '_'),
          platform: aiData.platform || 'Unknown',
          followers: aiData.followers || 0,
          trust_score: aiData.trustScore || 70,
          profile_image: aiData.profileImage || '',
          total_views: 1,
          last_viewed: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError || !newInfluencer) {
        console.error('Error creating influencer:', createError);
        return null;
      }

      // Luego insertar los claims
      if (aiData.claims?.length > 0) {
        for (const claim of aiData.claims) {
          await this.insertClaim({
            ...claim,
            influencer: {
              id: newInfluencer.id,
              name: newInfluencer.name,
              handle: newInfluencer.handle,
              platform: newInfluencer.platform,
              trustScore: newInfluencer.trust_score
            }
          });
        }
      }

      return mapInfluencerData(newInfluencer);
    } catch (error) {
      console.error('Error in findOrCreateInfluencer:', error);
      throw error;
    }
  },

  async insertClaim(claim: Omit<Claim, 'id'>) {
    const { data, error } = await supabase
      .from('claims')
      .insert([{
        text: claim.text,
        status: claim.status,
        category: claim.category,
        date: claim.date,
        confidence: claim.confidence,
        methodology: claim.analysis.methodology,
        evidence: claim.analysis.evidence,
        limitations: claim.analysis.limitations,
        conclusion: claim.analysis.conclusion,
        sources: claim.sources,
        influencer_id: claim.influencer.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting claim:', error);
      return null;
    }

    return mapClaimFromDB(data);
  }
};

// Mover la función fuera del objeto y hacerla una función helper
function mapClaimFromDB(data: any): Claim {
  return {
    id: data.id,
    text: data.text,
    status: data.status,
    category: data.category,
    date: data.date,
    confidence: data.confidence,
    analysis: {
      methodology: data.methodology || 'Standard scientific analysis methodology',
      evidence: data.evidence || [],
      limitations: data.limitations || [],
      conclusion: data.conclusion || 'Pending detailed analysis'
    },
    influencer: {
      id: data.influencer_id,
      name: data.influencer?.name || '',
      handle: data.influencer?.handle || '',
      platform: data.influencer?.platform || '',
      trustScore: data.influencer?.trust_score || 0
    },
    sources: data.sources || []
  };
} 