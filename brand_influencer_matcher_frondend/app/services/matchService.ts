export interface MatchRequest {
  brand_name: string;
}

export interface InfluencerMatch {
  influencer: string;
  total_score: number;
  details: {
    type_of_product: number;
    target_group: number;
    positioning: number;
    brand_personality: number;
    vision: number;
  };
  category?: string;
  profile?: {
    type_of_content: string;
    target_audience: string;
    positioning: string;
    personality: string;
    vision: string;
  };
}

export async function getMatchingInfluencers(brandName: string): Promise<InfluencerMatch[]> {
  console.log('[getMatchingInfluencers] Starting request for brand:', brandName);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const endpoint = `${apiUrl}/api/v1/match-influencers`;
  
  console.log('[getMatchingInfluencers] Using API URL:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brand_name: brandName } as MatchRequest),
      credentials: 'include', // Include cookies if needed
    });

    console.log('[getMatchingInfluencers] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getMatchingInfluencers] API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[getMatchingInfluencers] Response data:', data);
    
    if (!data.matches) {
      console.warn('[getMatchingInfluencers] No matches array in response, using empty array');
      return [];
    }
    
    return data.matches;
  } catch (error) {
    console.error('[getMatchingInfluencers] Error:', error);
    throw error;
  }
}
