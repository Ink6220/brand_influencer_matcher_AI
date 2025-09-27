"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Star, Target, Upload, Loader2, User, Instagram, Facebook, Youtube, Check } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

type ScoreBreakdown = {
  Type_of_product: number;
  Target_group: number;
  Positioning: number;
  Brand_Personality: number;
  Vision: number;
};

type Profile = {
  name: string;
  platform: string;
  followers: string;
  engagement: string;
  bio: string;
  image: string;
  type_of_content?: string;
  target_audience?: string;
  positioning?: string;
  personality?: string;
  vision?: string;
};

type InfluencerData = {
  influencer: string;
  total_score: number;
  scores: ScoreBreakdown;
  category: string;
  profile: Profile;
  content: string[];
  match_reasons: string[];
  concerns: string[];
  contact: string;
};

type Brand = {
  name: string;
};

const defaultInfluencer: InfluencerData = {
  influencer: "@influencer",
  total_score: 0,
  scores: {
    Type_of_product: 0,
    Target_group: 0,
    Positioning: 0,
    Brand_Personality: 0,
    Vision: 0,
  },
  category: "Category",
  profile: {
    name: "Influencer Name",
    platform: "Instagram",
    followers: "0",
    engagement: "0",
    bio: "No bio available",
    image: "",
  },
  content: ["No content available"],
  match_reasons: ["No match reasons available"],
  concerns: ["No concerns available"],
  contact: "No contact available",
};

export default function InfluencerMatchingApp() {
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"brand" | "influencer" | null>(null)
  const [uploadName, setUploadName] = useState("")
  const [currentInfluencers, setCurrentInfluencers] = useState<InfluencerData[]>([])
  const [isFetchingInfluencers, setIsFetchingInfluencers] = useState<boolean>(false)

  // Fetch brands from the backend
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Mock data for demonstration
  const mockInfluencers: Record<string, InfluencerData[]> = {
    "Nike Thailand": [
      {
        influencer: "@fitlife_th",
        total_score: 49.3,
        scores: {
          Type_of_product: 9.47,
          Target_group: 10.0,
          Positioning: 9.83,
          Brand_Personality: 10.0,
          Vision: 10.0,
        },
        category: "Fitness & Lifestyle",
        profile: {
          name: "Fit Life Thailand",
          platform: "Instagram",
          followers: "1.2M",
          engagement: "4.5%",
          bio: "Fitness enthusiast | Health coach | Personal trainer",
          image: "",
          type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
          target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
          positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
          personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
          vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต"
        },
        content: [
          "https://example.com/video1",
          "https://example.com/video2"
        ],
        match_reasons: [
          "เนื้อหาสอดคล้องกับแบรนด์",
          "กลุ่มเป้าหมายตรงกัน"
        ],
        concerns: [
          "อาจมีคู่แข่งรายอื่นร่วมงานด้วย"
        ],
        contact: "contact@fitlife.com"
      },
      {
        influencer: "@sporty_bangkok",
        total_score: 46.2,
        scores: {
          Type_of_product: 9.2,
          Target_group: 9.5,
          Positioning: 9.0,
          Brand_Personality: 9.0,
          Vision: 9.5,
        },
        category: "Sports & Fitness",
        profile: {
          name: "Sporty Bangkok",
          platform: "Instagram",
          followers: "850K",
          engagement: "3.8%",
          bio: "Sports lover | Fitness trainer | Bangkok based",
          image: "",
          type_of_content: "วิดีโอการออกกำลังกายและสุขภาพ",
          target_audience: "คนรักสุขภาพในกรุงเทพฯ",
          positioning: "ผู้เชี่ยวชาญด้านการออกกำลังกายและสุขภาพในกรุงเทพฯ",
          personality: "เป็นกันเอง รู้ลึกเรื่องสุขภาพ",
          vision: "ส่งเสริมให้คนกรุงเทพฯ มีสุขภาพดี"
        },
        content: [
          "https://example.com/video3",
          "https://example.com/video4"
        ],
        match_reasons: [
          "กลุ่มเป้าหมายเฉพาะทาง",
          "มีผลงานที่เกี่ยวข้องกับกีฬา"
        ],
        concerns: [
          "จำนวนผู้ติดตามน้อยกว่าเมื่อเทียบกับคู่แข่ง"
        ],
        contact: "contact@sportybkk.com"
      }
    ],
    "Sephora Thailand": [
      {
        influencer: "@beauty_guru_th",
        total_score: 48.7,
        scores: {
          Type_of_product: 9.8,
          Target_group: 9.5,
          Positioning: 9.7,
          Brand_Personality: 9.5,
          Vision: 9.2,
        },
        category: "Beauty & Makeup",
        profile: {
          name: "Beauty Guru TH",
          platform: "YouTube",
          followers: "2.1M",
          engagement: "5.2%",
          bio: "Beauty enthusiast | Makeup artist | Product reviewer",
          image: "",
          type_of_content: "รีวิวเครื่องสำอางและเทคนิคการแต่งหน้า",
          target_audience: "ผู้หญิงที่สนใจความงามและการแต่งหน้า",
          positioning: "ผู้เชี่ยวชาญด้านความงามและเครื่องสำอาง",
          personality: "เป็นกันเอง ตรงไปตรงมา",
          vision: "เป็นแหล่งข้อมูลด้านความงามที่เชื่อถือได้"
        },
        content: [
          "https://example.com/video5",
          "https://example.com/video6"
        ],
        match_reasons: [
          "มีความเชี่ยวชาญด้านความงาม",
          "มีผู้ติดตามจำนวนมาก"
        ],
        concerns: [
          "ค่าใช้จ่ายในการร่วมงานสูง"
        ],
        contact: "contact@beautyguru.com"
      },
      {
        influencer: "@skincare_lover",
        total_score: 45.9,
        scores: {
          Type_of_product: 9.1,
          Target_group: 9.3,
          Positioning: 9.0,
          Brand_Personality: 9.2,
          Vision: 9.3,
        },
        category: "Skincare",
        profile: {
          name: "Skincare Lover",
          platform: "Instagram",
          followers: "1.5M",
          engagement: "4.8%",
          bio: "Skincare enthusiast | Product reviewer | Dermatology student",
          image: "",
          type_of_content: "รีวิวสกินแคร์และเทคนิคการดูแลผิว",
          target_audience: "ผู้ที่สนใจการดูแลผิวหน้า",
          positioning: "ผู้เชี่ยวชาญด้านการดูแลผิว",
          personality: "เป็นกันเอง ให้คำแนะนำที่เป็นประโยชน์",
          vision: "ช่วยให้ทุกคนมีผิวสุขภาพดี"
        },
        content: [
          "https://example.com/video7",
          "https://example.com/video8"
        ],
        match_reasons: [
          "มีความรู้ด้านผิวพรรณ",
          "มีผู้ติดตามที่สนใจด้านความงาม"
        ],
        concerns: [
          "อาจมีการแข่งขันสูงในหมวดนี้"
        ],
        contact: "contact@skincarelover.com"
      }
    ]
  };

  // Fetch brands when component mounts
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // In a real app, you would fetch this from your API
        // const response = await fetch('/api/v1/brands')
        // if (!response.ok) {
        //   throw new Error('Failed to fetch brands')
        // }
        // const data = await response.json()
        
        // For now, use the mock data
        const mockBrands = Object.keys(mockInfluencers).map(name => ({ name }));
        setBrands(mockBrands);
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Fetch influencers when a brand is selected
  const handleBrandSelect = async (brandName: string) => {
    setSelectedBrand(brandName)
    setIsFetchingInfluencers(true)
    
    try {
      // In a real app, you would fetch this from your API
      // const response = await fetch('/api/v1/match-influencers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ brand_name: brandName }),
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to fetch influencers')
      // }
      // 
      // const data = await response.json()
      
      // For now, use the mock data
      const influencers = mockInfluencers[brandName] || [];
      setCurrentInfluencers(influencers)
      setCurrentInfluencerIndex(0)
    } catch (error) {
      console.error('Error fetching influencers:', error)
      setCurrentInfluencers([])
    } finally {
      setIsFetchingInfluencers(false)
    }
  }

  const currentInfluencer = currentInfluencers[currentInfluencerIndex] || defaultInfluencer

  const getRadarData = (details: ScoreBreakdown) => {
    return [
      { subject: "Product Type", value: details.Type_of_product, fullMark: 10 },
      { subject: "Target Group", value: details.Target_group, fullMark: 10 },
      { subject: "Positioning", value: details.Positioning, fullMark: 10 },
      { subject: "Personality", value: details.Brand_Personality, fullMark: 10 },
      { subject: "Vision", value: details.Vision, fullMark: 10 },
    ]
  }

  const nextInfluencer = () => {
    setCurrentInfluencerIndex((prev) => (prev + 1) % currentInfluencers.length)
  }

  const prevInfluencer = () => {
    setCurrentInfluencerIndex((prev) => (prev - 1 + currentInfluencers.length) % currentInfluencers.length)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && uploadName.trim()) {
      console.log(`[v0] Uploading ${uploadType} file:`, file.name, "Name:", uploadName)
      // Here you would handle the file upload logic
      setIsUploadOpen(false)
      setUploadType(null)
      setUploadName("")
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Upload Button */}
        <div className="text-center space-y-4 relative">
          <h1 className="text-3xl font-bold tracking-tight">Influencer Matching Platform</h1>
          <p className="text-muted-foreground">Find the perfect influencers for your brand</p>
          
          <div className="absolute top-0 right-0">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  อัปโหลด
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>เลือกประเภทข้อมูลที่ต้องการอัปโหลด</DialogTitle>
                  <DialogDescription>คุณต้องการอัปโหลดข้อมูลแบรนด์หรือข้อมูล Influencer?</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!uploadType ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                        onClick={() => setUploadType("brand")}
                      >
                        <Target className="h-6 w-6" />
                        อัปโหลดแบรนด์
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                        onClick={() => setUploadType("influencer")}
                      >
                        <Star className="h-6 w-6" />
                        อัปโหลด Influencer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="font-medium">
                          {uploadType === "brand" ? "อัปโหลดข้อมูลแบรนด์" : "อัปโหลดข้อมูล Influencer"}
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="upload-name">{uploadType === "brand" ? "ชื่อแบรนด์" : "ชื่อ Influencer"}</Label>
                          <Input
                            id="upload-name"
                            type="text"
                            placeholder={uploadType === "brand" ? "กรอกชื่อแบรนด์..." : "กรอกชื่อ Influencer..."}
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="upload-file">ไฟล์ข้อมูล</Label>
                          <Input
                            id="upload-file"
                            type="file"
                            accept=".json,.csv"
                            onChange={handleFileUpload}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadType(null)
                            setUploadName("")
                          }}
                          className="flex-1"
                        >
                          ย้อนกลับ
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={!uploadName.trim()}
                          className="flex-1"
                          onClick={() => document.getElementById('upload-file')?.click()}
                        >
                          อัปโหลด
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Brand Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกแบรนด์</CardTitle>
            <CardDescription>เลือกแบรนด์เพื่อดูรายชื่ออินฟลูเอนเซอร์ที่เหมาะสม</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">กำลังโหลดข้อมูลแบรนด์...</span>
                </div>
              ) : (
                <Select onValueChange={handleBrandSelect} value={selectedBrand} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoading ? "กำลังโหลด..." : "เลือกแบรนด์..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">กำลังโหลด...</div>
                    ) : brands.length > 0 ? (
                      brands.map((brand) => (
                        <SelectItem key={brand.name} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">ไม่พบแบรนด์</div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Influencer List */}
        {selectedBrand && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>อินฟลูเอนเซอร์ที่เหมาะสม</CardTitle>
                  <CardDescription>รายการอินฟลูเอนเซอร์ที่เหมาะกับแบรนด์ {selectedBrand}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={prevInfluencer} disabled={currentInfluencers.length <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentInfluencers.length > 0 ? `${currentInfluencerIndex + 1} / ${currentInfluencers.length}` : '0 / 0'}
                  </span>
                  <Button variant="outline" size="sm" onClick={nextInfluencer} disabled={currentInfluencers.length <= 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isFetchingInfluencers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">กำลังค้นหาอินฟลูเอนเซอร์ที่เหมาะสม...</span>
                </div>
              ) : currentInfluencers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  ไม่พบอินฟลูเอนเซอร์ที่เหมาะสมกับแบรนด์นี้
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Influencer Profile */}
                  <div className="md:col-span-1">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={currentInfluencer.profile.image} alt={currentInfluencer.influencer} />
                            <AvatarFallback>
                              <User className="h-12 w-12" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center space-y-1">
                            <h3 className="text-lg font-semibold">{currentInfluencer.profile.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentInfluencer.influencer}</p>
                            <div className="flex items-center justify-center space-x-2 mt-2">
                              {currentInfluencer.profile.platform.toLowerCase().includes('instagram') && (
                                <Instagram className="h-4 w-4 text-pink-600" />
                              )}
                              {currentInfluencer.profile.platform.toLowerCase().includes('youtube') && (
                                <Youtube className="h-4 w-4 text-red-600" />
                              )}
                              {currentInfluencer.profile.platform.toLowerCase().includes('facebook') && (
                                <Facebook className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="text-xs text-muted-foreground">{currentInfluencer.profile.platform}</span>
                            </div>
                          </div>
                          <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">ผู้ติดตาม:</span>
                              <span className="font-medium">{currentInfluencer.profile.followers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">อัตราการมีส่วนร่วม:</span>
                              <span className="font-medium">{currentInfluencer.profile.engagement}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">หมวดหมู่:</span>
                              <span className="font-medium">{currentInfluencer.category}</span>
                            </div>
                          </div>
                          <div className="w-full pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">คะแนนความเข้ากันได้</span>
                              <span className="text-lg font-bold text-primary">
                                {currentInfluencer.total_score.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={currentInfluencer.total_score} className="h-2" />
                          </div>
                          <Button className="w-full mt-4" variant="default">
                            ติดต่ออินฟลูเอนเซอร์
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Influencer Details */}
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">ประเภทของเนื้อหา</h4>
                            <p>{currentInfluencer.profile.type_of_content || 'ไม่มีข้อมูล'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">กลุ่มเป้าหมาย</h4>
                            <p>{currentInfluencer.profile.target_audience || 'ไม่มีข้อมูล'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">จุดยืน</h4>
                            <p>{currentInfluencer.profile.positioning || 'ไม่มีข้อมูล'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">บุคลิกภาพ</h4>
                            <p>{currentInfluencer.profile.personality || 'ไม่มีข้อมูล'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">วิสัยทัศน์</h4>
                            <p>{currentInfluencer.profile.vision || 'ไม่มีข้อมูล'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>คะแนนความเข้ากันได้</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(currentInfluencer.scores)}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} />
                              <Radar
                                name="Score"
                                dataKey="value"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                              />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>เหตุผลที่เหมาะสม</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentInfluencer.match_reasons.map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {currentInfluencer.concerns.length > 0 && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="text-yellow-800">ข้อควรระวัง</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {currentInfluencer.concerns.map((concern, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-yellow-600">•</span>
                                <span className="ml-2 text-yellow-800">{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>ตัวอย่างเนื้อหา</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentInfluencer.content.map((content, index) => (
                            <div key={index} className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <span className="text-sm text-muted-foreground">ตัวอย่างเนื้อหา {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
