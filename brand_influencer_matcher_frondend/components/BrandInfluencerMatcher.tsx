'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

type Brand = {
  _id: string;
  name: string;
};

type ScoreDetails = {
  type_of_product: number;
  target_group: number;
  positioning: number;
  brand_personality: number;
  vision: number;
  [key: string]: number;
};

type Influencer = {
  influencer: string;
  total_score: number;
  details: ScoreDetails;
};

const getInfluencerData = (details: ScoreDetails) => {
  return [
    { subject: 'Product Type', A: details.type_of_product, fullMark: 10 },
    { subject: 'Target Group', A: details.target_group, fullMark: 10 },
    { subject: 'Positioning', A: details.positioning, fullMark: 10 },
    { subject: 'Personality', A: details.brand_personality, fullMark: 10 },
    { subject: 'Vision', A: details.vision, fullMark: 10 },
  ];
};

export function BrandInfluencerMatcher() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to sample data if API fails
        setBrands([
          { _id: '1', name: 'Sample Brand 1' },
          { _id: '2', name: 'Sample Brand 2' }
        ]);
      }
    };

    fetchBrands();
  }, []);

  // Fetch influencers when a brand is selected
  const handleBrandSelect = async (brandName: string) => {
    setSelectedBrand(brandName);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/match-influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand_name: brandName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch influencers');
      }
      
      const data = await response.json();
      
      // Use the data directly from the API
      setInfluencers(data.matches || []);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      // Fallback to sample data if API fails
      setInfluencers([
        {
          influencer: 'uufit_',
          total_score: 46.77,
          details: {
            type_of_product: 9.93,
            target_group: 8.24,
            positioning: 10.0,
            brand_personality: 9.4,
            vision: 9.19
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ค้นหาอินฟลูเอนเซอร์ที่เหมาะสมกับแบรนด์ของคุณ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Select onValueChange={handleBrandSelect} value={selectedBrand}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกแบรนด์" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <p>กำลังค้นหาอินฟลูเอนเซอร์ที่เหมาะสม...</p>
        </div>
      )}

      {!isLoading && influencers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            อินฟลูเอนเซอร์ที่เหมาะสมกับ {selectedBrand}
          </h2>
          
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {influencers.map((influencer, index) => (
                <CarouselItem key={index} className="basis-full">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardHeader className="flex flex-col items-center">
                        <Avatar className="w-24 h-24 mb-4">
                          <AvatarImage src={`/influencers/${influencer.influencer.replace('@', '')}.jpg`} />
                          <AvatarFallback>{influencer.influencer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold">{influencer.influencer}</h3>
                          <div className="text-lg font-bold text-primary">
                            {influencer.total_score.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            คะแนนความเหมาะสม
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getInfluencerData(influencer.details)}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} />
                              <Radar
                                name="Score"
                                dataKey="A"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-left">
                            <p className="font-medium">ประเภทสินค้า</p>
                            <p className="text-muted-foreground">{influencer.details.type_of_product.toFixed(1)}/10</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">กลุ่มเป้าหมาย</p>
                            <p className="text-muted-foreground">{influencer.details.target_group.toFixed(1)}/10</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">การวางตำแหน่ง</p>
                            <p className="text-muted-foreground">{influencer.details.positioning.toFixed(1)}/10</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">บุคลิกภาพ</p>
                            <p className="text-muted-foreground">{influencer.details.brand_personality.toFixed(1)}/10</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">วิสัยทัศน์</p>
                            <p className="text-muted-foreground">{influencer.details.vision.toFixed(1)}/10</p>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-2" variant="outline">
                          ดูโปรไฟล์
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}

export default BrandInfluencerMatcher;
