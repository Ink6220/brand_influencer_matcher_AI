"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { matchInfluencers } from "./services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Star, Target, Upload } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface InfluencerData {
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

const defaultProfile = {
  type_of_content: "Content not available",
  target_audience: "Audience not specified",
  positioning: "Positioning not specified",
  personality: "Personality not specified",
  vision: "Vision not specified"
};

const brandData: { [key: string]: InfluencerData[] } = {
  "Health & Wellness Brand": [
    {
      influencer: "@fitlife_th",
      total_score: 49.3,
      details: {
        Type_of_product: 9.47,
        Target_group: 10.0,
        Positioning: 9.83,
        Brand_Personality: 10.0,
        Vision: 10.0,
      },
      category: "Health & Fitness",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต"
      },
    },
    {
      influencer: "@aunnyc",
      total_score: 47.89,
      details: {
        Type_of_product: 10.0,
        Target_group: 9.64,
        Positioning: 10.0,
        Brand_Personality: 8.97,
        Vision: 9.27,
      },
      category: "Lifestyle & Wellness",
      profile: {
        type_of_content: "วิดีโอไลฟ์สไตล์และสุขภาพ",
        target_audience: "ผู้หญิงวัยทำงานที่สนใจการดูแลตัวเอง",
        positioning: "การนำเสนอไลฟ์สไตล์ที่มีสุขภาพดีอย่างสมดุล",
        personality: "เป็นกันเอง ดูเป็นธรรมชาติ และให้ความรู้",
        vision: "สร้างแรงบันดาลใจให้คนหันมาดูแลสุขภาพอย่างยั่งยืน"
      },
    },
    {
      influencer: "@healthy_living_th",
      total_score: 46.2,
      details: {
        Type_of_product: 9.2,
        Target_group: 9.8,
        Positioning: 9.1,
        Brand_Personality: 9.5,
        Vision: 8.6,
      },
      category: "Women's Health",
      profile: {
        type_of_content: "ความรู้ด้านสุขภาพสตรีและการดูแลตัวเอง",
        target_audience: "ผู้หญิงทุกวัยที่สนใจสุขภาพ",
        positioning: "แหล่งความรู้ด้านสุขภาพสตรีที่เข้าใจผู้หญิง",
        personality: "เป็นกันเอง ให้คำปรึกษา และน่าเชื่อถือ",
        vision: "ส่งเสริมให้ผู้หญิงไทยมีสุขภาพแข็งแรงทั้งกายและใจ"
      },
    },
  ],
  "Nike Thailand": [
    {
      influencer: "@fitlife_th",
      total_score: 49.3,
      details: {
        Type_of_product: 9.47,
        Target_group: 10.0,
        Positioning: 9.83,
        Brand_Personality: 10.0,
        Vision: 10.0,
      },
      category: "Fitness & Lifestyle",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
    {
      influencer: "@aunnyc",
      total_score: 47.89,
      details: {
        Type_of_product: 10.0,
        Target_group: 9.64,
        Positioning: 10.0,
        Brand_Personality: 8.97,
        Vision: 9.27,
      },
      category: "Fashion & Sports",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
    {
      influencer: "@sporty_bangkok",
      total_score: 46.2,
      details: {
        Type_of_product: 9.2,
        Target_group: 9.8,
        Positioning: 9.1,
        Brand_Personality: 9.5,
        Vision: 8.6,
      },
      category: "Sports & Training",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
  ],
  "Sephora Thailand": [
    {
      influencer: "@beauty_guru_th",
      total_score: 48.7,
      details: {
        Type_of_product: 10.0,
        Target_group: 9.8,
        Positioning: 9.6,
        Brand_Personality: 9.7,
        Vision: 9.6,
      },
      category: "Beauty & Cosmetics",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
    {
      influencer: "@makeup_artist_bkk",
      total_score: 47.1,
      details: {
        Type_of_product: 9.8,
        Target_group: 9.2,
        Positioning: 9.4,
        Brand_Personality: 9.3,
        Vision: 9.4,
      },
      category: "Makeup & Skincare",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
    {
      influencer: "@skincare_lover",
      total_score: 45.9,
      details: {
        Type_of_product: 9.1,
        Target_group: 9.5,
        Positioning: 9.0,
        Brand_Personality: 9.2,
        Vision: 9.1,
      },
      category: "Skincare & Wellness",
      profile: {
        type_of_content: "วิดีโอเกี่ยวกับสุขภาพ ความรู้ทั่วไป และเนื้อหาที่สร้างสรรค์",
        target_audience: "ผู้หญิง ที่สนใจสุขภาพสตรี และกลุ่มวัยรุ่นถึงวัยทำงานที่ชื่นชอบเนื้อหาสนุกสนานหรือชวนขนหัวลุก",
        positioning: "การเป็นผู้รู้และให้คำแนะนำด้านสุขภาพและการดูแลตัวเอง พร้อมกับมีบรรยากาศความตลกและน่าสนใจในเนื้อหา",
        personality: "มีความรักในการเรียนรู้ มีความเป็นมืออาชีพในด้านการแพทย์ และสร้างความสนุกสนานในเนื้อหา",
        vision: "สร้างชุมชนที่ใส่ใจและให้ความรู้ในด้านสุขภาพ รวมทั้งสนับสนุนให้ผู้หญิงดูแลสุขภาพตัวเองอย่างถูกต้องและความสนุกสนานใช่ชีวิต",
      },
    },
  ],
}

// const brandDetails = { ... }

export default function InfluencerMatchingApp() {
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"brand" | "influencer" | null>(null)
  const [uploadName, setUploadName] = useState("")

  const currentInfluencers = selectedBrand ? brandData[selectedBrand as keyof typeof brandData] : []
  const currentInfluencer = currentInfluencers[currentInfluencerIndex]
  // const currentBrandDetails = selectedBrand ? brandDetails[selectedBrand as keyof typeof brandDetails] : null

  const getRadarData = (details: any) => {
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
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsUploadOpen(false)
                            setUploadType(null)
                            setUploadName("")
                          }}
                          className="flex-1"
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (uploadName.trim()) {
                              console.log(`[v0] Adding ${uploadType}:`, uploadName)
                              // Here you would handle adding the new brand/influencer
                              setIsUploadOpen(false)
                              setUploadType(null)
                              setUploadName("")
                            }
                          }}
                          disabled={!uploadName.trim()}
                          className="flex-1"
                        >
                          เพิ่ม
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Influencer Brand Matching
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {"Find the perfect influencer matches for your brand with AI-powered compatibility scoring"}
          </p>
        </div>

        {/* Brand Selection */}
        <Card className="brand-dropdown">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {"Select Your Brand"}
            </CardTitle>
            <CardDescription>{"Choose a brand to see the top 3 influencer matches"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBrand}
              onValueChange={(value) => {
                setSelectedBrand(value)
                setCurrentInfluencerIndex(0)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a brand..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(brandData).map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedBrand && currentInfluencer && currentInfluencer.profile && (
          <Card className="influencer-profile-card">
            <CardHeader>
              <CardTitle className="text-xl">Influencer Profile: {currentInfluencer.influencer}</CardTitle>
              <CardDescription>รายละเอียดของอินฟลูเอนเซอร์ที่ match กับ {selectedBrand}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-blue-600 mb-1">ประเภทเนื้อหา</h4>
                    <p className="text-sm text-gray-700">{currentInfluencer.profile.type_of_content}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-purple-600 mb-1">กลุ่มเป้าหมาย</h4>
                    <p className="text-sm text-gray-700">{currentInfluencer.profile.target_audience}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-pink-600 mb-1">การวางตำแหน่ง</h4>
                    <p className="text-sm text-gray-700">{currentInfluencer.profile.positioning}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-orange-600 mb-1">บุคลิกภาพ</h4>
                    <p className="text-sm text-gray-700">{currentInfluencer.profile.personality}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-green-600 mb-1">วิสัยทัศน์</h4>
                    <p className="text-sm text-gray-700">{currentInfluencer.profile.vision}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Influencer Results */}
        {selectedBrand && currentInfluencer && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Influencer Info Card */}
            <Card className="influencer-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentInfluencer.influencer}</CardTitle>
                    <CardDescription className="text-base mt-1">{currentInfluencer.category}</CardDescription>
                  </div>
                  <Badge className="score-badge text-lg px-3 py-1">{currentInfluencer.total_score.toFixed(1)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Detailed Scores */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Matching Score with Brand
                  </h4>
                  {Object.entries(currentInfluencer.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${((value as number) / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{(value as number).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevInfluencer}
                    disabled={currentInfluencers.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      {currentInfluencerIndex + 1} of {currentInfluencers.length}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextInfluencer}
                    disabled={currentInfluencers.length <= 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="radar-chart-container">
              <CardHeader>
                <CardTitle>Compatibility Analysis</CardTitle>
                <CardDescription>{"Visual breakdown of matching scores across key metrics"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData(currentInfluencer.details)}>
                      <PolarGrid stroke="oklch(0.7 0.3 270)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.4 0.1 240)", fontSize: 12 }} />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fill: "oklch(0.5 0.1 240)", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="oklch(0.7 0.3 270)"
                        fill="oklch(0.7 0.3 270 / 0.3)"
                        strokeWidth={3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedBrand && (
          <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
            <CardContent>
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-blue-700">{"Select a Brand to Get Started"}</h3>
              <p className="text-blue-600">
                {"Choose a brand from the dropdown above to see AI-powered influencer matches"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
