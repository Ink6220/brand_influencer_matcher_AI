'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

type InfluencerAnalysis = {
  Type_of_content: string;
  target_Audience: string;
  positioning: string;
  personality: string;
  vision: string;
};

type Influencer = {
  influencer: string;
  total_score: number;
  details: ScoreDetails;
  analysis?: InfluencerAnalysis;
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'brand' | 'influencer' | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let endpoint: string;
      let requestBody: any;
      
      if (uploadType === 'brand') {
        endpoint = 'http://localhost:8000/api/v1/analyze-brand';
        requestBody = { name: formData.name };
      } else {
        endpoint = 'http://localhost:8000/api/v1/analyze-influencer';
        requestBody = { influencer_name: formData.name };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      // Refresh the brands list if we added a new brand
      if (uploadType === 'brand') {
        const updatedBrands = await fetch('http://localhost:8000/api/v1/brands');
        const data = await updatedBrands.json();
        setBrands(data);
      }

      // Reset form and close modal
      setFormData({
        name: ''
      });
      setUploadType(null);
      setShowUploadModal(false);
      
      // Show success message
      alert(`${uploadType === 'brand' ? 'แบรนด์' : 'อินฟลูเอนเซอร์'} ถูกเพิ่มเรียบร้อยแล้ว!`);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowUploadModal(false);
        setUploadType(null);
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debug log for modal state
  useEffect(() => {
    console.log('Modal state updated - showProfileModal:', showProfileModal, 'selectedInfluencer:', selectedInfluencer);
  }, [showProfileModal, selectedInfluencer]);

  const fetchInfluencerAnalysis = async (influencerName: string) => {
    try {
      console.log('Fetching analysis for:', influencerName);
      setIsLoadingProfile(true);
      // Remove @ symbol if present in the username
      const cleanName = influencerName.startsWith('@') ? influencerName.substring(1) : influencerName;
      const response = await fetch(`http://localhost:8000/api/v1/influencer-analysis/${encodeURIComponent(cleanName)}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch influencer analysis: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analysis data received:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchInfluencerAnalysis:', error);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleViewProfile = async (influencer: Influencer) => {
    console.log('handleViewProfile called with:', influencer);
    setSelectedInfluencer(influencer);
    setShowProfileModal(true);
    console.log('showProfileModal should be true now');
    
    // Fetch analysis data if not already loaded
    if (!influencer.analysis) {
      console.log('Fetching analysis for:', influencer.influencer);
      const analysis = await fetchInfluencerAnalysis(influencer.influencer);
      console.log('Analysis data received:', analysis);
      if (analysis) {
        setSelectedInfluencer(prev => {
          console.log('Updating influencer with analysis data');
          return {
            ...prev!,
            analysis
          };
        });
      }
    }
  };
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Upload Button - Fixed at top right of screen */}
      <div className="fixed right-6 top-6 z-40">
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          เพิ่มข้อมูลใหม่
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {!uploadType ? 'เลือกประเภทข้อมูลที่ต้องการเพิ่ม' : 'เพิ่มข้อมูล'}
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadType(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!uploadType ? (
              <div className="space-y-4">
                <button
                  onClick={() => setUploadType('brand')}
                  className="w-full p-4 border-2 border-dashed border-pink-200 rounded-lg hover:bg-pink-50 transition-colors text-center"
                >
                  <div className="text-pink-600 font-medium">เพิ่มแบรนด์</div>
                  <p className="text-sm text-gray-500 mt-1">เพิ่มแบรนด์ใหม่เข้าสู่ระบบ</p>
                </button>
                
                <button
                  onClick={() => setUploadType('influencer')}
                  className="w-full p-4 border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-blue-600 font-medium">เพิ่มอินฟลูเอนเซอร์</div>
                  <p className="text-sm text-gray-500 mt-1">เพิ่มอินฟลูเอนเซอร์ใหม่เข้าสู่ระบบ</p>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {uploadType === 'brand' ? 'ชื่อแบรนด์' : 'ชื่ออินฟลูเอนเซอร์'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-lg"
                    placeholder={uploadType === 'brand' ? 'กรอกชื่อแบรนด์' : 'กรอกชื่ออินฟลูเอนเซอร์'}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType(null);
                      setFormData({ name: '' });
                    }}
                    className="px-6 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2.5 text-base font-medium text-white rounded-md ${
                      uploadType === 'brand' 
                        ? 'bg-pink-600 hover:bg-pink-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    เพิ่ม{uploadType === 'brand' ? 'แบรนด์' : 'อินฟลูเอนเซอร์'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
                          <button 
                            onClick={(e) => {
                              console.log('Influencer name clicked:', influencer.influencer);
                              e.stopPropagation();
                              handleViewProfile(influencer);
                            }}
                            className="text-lg font-semibold hover:underline focus:outline-none text-blue-600"
                          >
                            {influencer.influencer}
                          </button>
                          <div className="text-lg font-bold text-primary">
                            {influencer.total_score.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            คะแนนความเหมาะสม
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="h-64 w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              cx="50%" 
                              cy="50%" 
                              outerRadius="70%"
                              data={getInfluencerData(influencer.details)}
                              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            >
                              <PolarGrid gridType="circle" stroke="#e5e7eb" />
                              <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fontSize: 12, fill: '#4b5563' }}
                                tickLine={false}
                              />
                              <PolarRadiusAxis 
                                angle={30} 
                                domain={[0, 10]}
                                tickCount={6}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickFormatter={(value) => value.toString()}
                              />
                              <Radar
                                name="Score"
                                dataKey="A"
                                stroke="#4f46e5"
                                fill="#4f46e5"
                                fillOpacity={0.4}
                                strokeWidth={2}
                                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="text-center">
                              <p className="font-medium">ประเภทสินค้า</p>
                              <p className="text-muted-foreground">{influencer.details.type_of_product.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">กลุ่มเป้าหมาย</p>
                              <p className="text-muted-foreground">{influencer.details.target_group.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">การวางตำแหน่ง</p>
                              <p className="text-muted-foreground">{influencer.details.positioning.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">บุคลิกภาพ</p>
                              <p className="text-muted-foreground">{influencer.details.brand_personality.toFixed(1)}/10</p>
                            </div>
                            <div className="col-span-2 text-center">
                              <p className="font-medium">วิสัยทัศน์</p>
                              <p className="text-muted-foreground">{influencer.details.vision.toFixed(1)}/10</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={(e) => {
                            console.log('Profile button clicked for:', influencer.influencer);
                            e.stopPropagation();
                            handleViewProfile(influencer);
                          }}
                        >
                          ดูโปรไฟล์
                          <Eye className="ml-2 h-4 w-4" />
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

      {/* Influencer Profile Modal */}
      {showProfileModal && selectedInfluencer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">โปรไฟล์อินฟลูเอนเซอร์: {selectedInfluencer.influencer}</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isLoadingProfile ? (
              <div className="text-center py-8">กำลังโหลดข้อมูลโปรไฟล์...</div>
            ) : selectedInfluencer.analysis ? (
              <div className="space-y-4 text-gray-800">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">ประเภทเนื้อหา</h4>
                  <p>{selectedInfluencer.analysis.Type_of_content}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">กลุ่มเป้าหมาย</h4>
                  <p>{selectedInfluencer.analysis.target_Audience}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">การวางตำแหน่ง</h4>
                  <p>{selectedInfluencer.analysis.positioning}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">บุคลิกภาพ</h4>
                  <p>{selectedInfluencer.analysis.personality}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">วิสัยทัศน์</h4>
                  <p>{selectedInfluencer.analysis.vision}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลโปรไฟล์</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandInfluencerMatcher;
