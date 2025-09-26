const API_BASE_URL = 'http://localhost:8000';

export interface InfluencerMatch {
  influencer: string;
  total_score: number;
  details: {
    Type_of_product: number;
    Target_group: number;
    Positioning: number;
    Brand_Personality: number;
    Vision: number;
  };
  category: string;
  profile: {
    type_of_content: string;
    target_audience: string;
    positioning: string;
    personality: string;
    vision: string;
  };
}

export const matchInfluencers = async (brandName: string): Promise<InfluencerMatch[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/match-influencers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_name: brandName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Error matching influencers:', error);
    throw error;
  }
};
