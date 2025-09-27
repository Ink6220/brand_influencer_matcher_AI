// Brand type
export interface Brand {
  name: string;
}

// Influencer type
export interface Influencer {
  influencer: string;
  total_score: number;
  details: {
    type_of_product: number;
    target_group: number;
    positioning: number;
    brand_personality: number;
    vision: number;
  };
  Type_of_product: number;
  Target_group: number;
  Positioning: number;
  Brand_Personality: number;
  Vision: number;
  category: string;
  profile?: ProfileData;
}

// BrandData type (index signature)
export interface BrandData {
  [key: string]: Influencer[];
}

// Radar chart data type
export interface RadarData {
  subject: string;
  A: number;
}

// Profile data type
export interface ProfileData {
  type_of_content: string;
  target_audience: string;
  positioning: string;
  personality: string;
  vision: string;
}

// Influencer match type from API
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
  profile?: ProfileData;
}
