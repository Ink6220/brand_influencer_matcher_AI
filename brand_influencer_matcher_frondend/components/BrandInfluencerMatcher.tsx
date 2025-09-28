'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Eye, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnalysisModal } from './AnalysisModal';
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

interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
  fill: string;
  stroke: string;
  key: string;
}

type InfluencerAnalysis = {
  Type_of_content: string;
  target_Audience: string;
  positioning: string;
  personality: string;
  vision: string;
};

interface Influencer {
  influencer: string;
  total_score: number;
  details: ScoreDetails;
  analysis?: InfluencerAnalysis;
}

  const getInfluencerData = (details: ScoreDetails) => {
    return [
      { 
        subject: 'Product Type', 
        A: details.type_of_product, 
        fullMark: 10,
        fill: 'url(#productGradient)',
        stroke: '#3b82f6',
        key: 'type_of_product'
      },
      { 
        subject: 'Target Group', 
        A: details.target_group, 
        fullMark: 10,
        fill: 'url(#targetGradient)',
        stroke: '#10b981',
        key: 'target_group'
      },
      { 
        subject: 'Positioning', 
        A: details.positioning, 
        fullMark: 10,
        fill: 'url(#positioningGradient)',
        stroke: '#f59e0b',
        key: 'positioning'
      },
      { 
        subject: 'Personality', 
        A: details.brand_personality, 
        fullMark: 10,
        fill: 'url(#personalityGradient)',
        stroke: '#8b5cf6',
        key: 'brand_personality'
      },
      { 
        subject: 'Vision', 
        A: details.vision, 
        fullMark: 10,
        fill: 'url(#visionGradient)',
        stroke: '#ec4899',
        key: 'vision'
      },
    ];
  };

export function BrandInfluencerMatcher() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const productGradient = useRef<SVGLinearGradientElement>(null);
  const targetGradient = useRef<SVGLinearGradientElement>(null);
  const positioningGradient = useRef<SVGLinearGradientElement>(null);
  const personalityGradient = useRef<SVGLinearGradientElement>(null);
  const visionGradient = useRef<SVGLinearGradientElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'brand' | 'influencer' | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitType, setSubmitType] = useState<'brand' | 'influencer' | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [currentInfluencer, setCurrentInfluencer] = useState<Influencer | null>(null);

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
      }
    };

    fetchBrands();
  }, []);

  const fetchInfluencerAnalysis = async (influencerName: string) => {
    try {
      console.log(`[API] Fetching analysis for influencer: ${influencerName}`);
      const response = await fetch(`http://localhost:8000/api/v1/influencer-analysis/${encodeURIComponent(influencerName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log(`[API] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[API] Analysis data received:', data);
      
      if (!data) {
        throw new Error('No data received from the server');
      }
      
      return data;
    } catch (error) {
      console.error('[API] Error fetching influencer analysis:', error);
      throw error;
    }
  };

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
    if (!uploadType) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitType(uploadType);
    
    try {
      let endpoint: string;
      let requestBody: any;
      
      if (uploadType === 'brand') {
        endpoint = 'http://localhost:8000/api/v1/analyze-brand';
        requestBody = { brand_name: formData.name };  // Changed from 'name' to 'brand_name'
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

      // Show success message in the form
      setSubmitSuccess(true);
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({
          name: ''
        });
        setSubmitSuccess(false);
        setSubmitType(null);
        
        // Close modal for both influencer and brand additions
        setUploadType(null);
        setShowUploadModal(false);
        
        // Refresh the page if we added an influencer to see the new match
        if (uploadType === 'influencer' && selectedBrand) {
          window.location.reload();
        }
      }, 2000);
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

  // Create a ref for the modal to handle clicks outside
  const modalRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeMatch = (influencer: Influencer) => {
    if (!selectedBrand || selectedBrand.trim() === '') {
      toast.error('กรุณาเลือกแบรนด์ก่อนทำการวิเคราะห์');
      return;
    }
    console.log('Analyzing match for:', influencer.influencer, 'and brand:', selectedBrand);
    setCurrentInfluencer(influencer);
    setShowAnalysisModal(true);
  };

  const handleViewProfile = async (influencer: Influencer) => {
    try {
      console.log('[Profile] Opening profile for:', influencer.influencer);
      // First set the influencer and show the modal
      setSelectedInfluencer(influencer);
      setShowProfileModal(true);
      
      // Check if we already have the analysis data
      if (!influencer.analysis) {
        console.log('[Profile] No cached analysis, fetching...');
        setIsLoadingProfile(true);
        
        try {
          const response = await fetchInfluencerAnalysis(influencer.influencer);
          console.log('[Profile] Analysis data received:', response);
          
          // The response might be the analysis object directly or have it in an 'analysis' property
          const analysisData = response.analysis || response;
          
          if (analysisData && 
              (analysisData.Type_of_content || 
               analysisData.target_Audience || 
               analysisData.positioning || 
               analysisData.personality || 
               analysisData.vision)) {
            
            // Create a properly formatted analysis object
            const formattedAnalysis: InfluencerAnalysis = {
              Type_of_content: analysisData.Type_of_content || 'ไม่พบข้อมูล',
              target_Audience: analysisData.target_Audience || 'ไม่พบข้อมูล',
              positioning: analysisData.positioning || 'ไม่พบข้อมูล',
              personality: analysisData.personality || 'ไม่พบข้อมูล',
              vision: analysisData.vision || 'ไม่พบข้อมูล'
            };
            
            console.log('[Profile] Formatted analysis data:', formattedAnalysis);
            
            // Update the selected influencer with the new analysis data
            setSelectedInfluencer(prev => ({
              ...prev!,
              analysis: formattedAnalysis
            }));
            
            // Also update the influencers list to cache this data
            setInfluencers(prevInfluencers => 
              prevInfluencers.map(inf => 
                inf.influencer === influencer.influencer 
                  ? { ...inf, analysis: formattedAnalysis } 
                  : inf
              )
            );
          } else {
            console.warn('[Profile] No valid analysis data in response for:', influencer.influencer);
            console.warn('Response structure:', response);
            toast.error('ไม่พบข้อมูลการวิเคราะห์สำหรับอินฟลูเอนเซอร์นี้');
          }
        } catch (error) {
          console.error('[Profile] Error fetching influencer analysis:', error);
          toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        console.log('[Profile] Using cached analysis data');
      }
    } catch (error) {
      console.error('[Profile] Error in handleViewProfile:', error);
      toast.error('เกิดข้อผิดพลาดในการเปิดโปรไฟล์');
      setIsLoadingProfile(false);
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
                  {submitSuccess && submitType === uploadType ? (
                    <div className="text-green-600 text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {submitType === 'brand' ? 'เพิ่มแบรนด์เรียบร้อยแล้ว!' : 'เพิ่มอินฟลูเอนเซอร์เรียบร้อยแล้ว!'}
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2.5 text-base font-medium text-white rounded-md flex items-center justify-center min-w-[120px] ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      } ${
                        uploadType === 'brand' 
                          ? 'bg-pink-600 hover:bg-pink-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          กำลังโหลด...
                        </>
                      ) : `เพิ่ม${uploadType === 'brand' ? 'แบรนด์' : 'อินฟลูเอนเซอร์'}`}
                    </button>
                  )}
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
                              <defs>
                                {/* Product Type Gradient */}
                                <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                </linearGradient>
                                {/* Target Group Gradient */}
                                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                                </linearGradient>
                                {/* Positioning Gradient */}
                                <linearGradient id="positioningGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#fcd34d" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                </linearGradient>
                                {/* Personality Gradient */}
                                <linearGradient id="personalityGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                </linearGradient>
                                {/* Vision Gradient */}
                                <linearGradient id="visionGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f9a8d4" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3}/>
                                </linearGradient>
                              </defs>
                              <PolarGrid gridType="circle" stroke="#e2e8f0" />
                              <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fontSize: 11, fill: '#4a5568' }}
                                tickLine={false}
                              />
                              <PolarRadiusAxis 
                                angle={30} 
                                domain={[0, 10]}
                                tickCount={6}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#718096' }}
                                tickFormatter={(value) => value.toString()}
                              />
                              <Radar
                                name="Scores"
                                dataKey="A"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                                strokeWidth={2}
                                dot={{
                                  fill: '#8884d8',
                                  stroke: '#fff',
                                  strokeWidth: 1.5,
                                  r: 4
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="flex justify-center mt-2">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-100 shadow-sm">
                              <p className="font-medium text-blue-800">ประเภทสินค้า</p>
                              <p className="text-blue-600 font-semibold">{influencer.details.type_of_product.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-100 shadow-sm">
                              <p className="font-medium text-green-800">กลุ่มเป้าหมาย</p>
                              <p className="text-green-600 font-semibold">{influencer.details.target_group.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 border border-yellow-100 shadow-sm">
                              <p className="font-medium text-yellow-800">การวางตำแหน่ง</p>
                              <p className="text-yellow-600 font-semibold">{influencer.details.positioning.toFixed(1)}/10</p>
                            </div>
                            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-100 shadow-sm">
                              <p className="font-medium text-purple-800">บุคลิกภาพ</p>
                              <p className="text-purple-600 font-semibold">{influencer.details.brand_personality.toFixed(1)}/10</p>
                            </div>
                            <div className="col-span-2 text-center bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-2 border border-pink-100 shadow-sm">
                              <p className="font-medium text-pink-800">วิสัยทัศน์</p>
                              <p className="text-pink-600 font-semibold">{influencer.details.vision.toFixed(1)}/10</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline"
                              className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(influencer);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              ดูโปรไฟล์
                            </Button>
                            <Button 
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzeMatch(influencer);
                              }}
                            >
                              <BarChart2 className="h-4 w-4 mr-1" />
                              วิเคราะห์
                            </Button>
                          </div>
                        </div>
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
              <div className="text-center py-8">ไม่พบข้อมูลการวิเคราะห์</div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {currentInfluencer && selectedBrand && selectedBrand.trim() !== '' && (
        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          influencerName={currentInfluencer.influencer}
          brandName={selectedBrand}
        />
      )}
    </div>
  );
}

export default BrandInfluencerMatcher;
