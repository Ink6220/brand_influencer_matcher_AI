'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerName: string;
  brandName: string;
}

interface AnalysisData {
  influencer_strengths: string;
  content_style: string;
  brand_compatibility: string;
  campaign_suitability: string;
  strategic_recommendations: string;
  [key: string]: any; // For any additional fields
}

export function AnalysisModal({ 
  isOpen, 
  onClose, 
  influencerName, 
  brandName 
}: AnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMatch = async () => {
    if (!influencerName || !brandName) {
      toast.error('กรุณาเลือกทั้งอินฟลูเอนเซอร์และแบรนด์');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[Analysis] Starting analysis for influencer: ${influencerName}, brand: ${brandName}`);
      
      // Show loading state immediately
      setAnalysisData(null);
      
      const response = await fetch('http://localhost:8000/api/v1/analyze-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          influencer_name: influencerName,
          brand_name: brandName
        }),
      });

      console.log(`[Analysis] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Analysis] Error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('[Analysis] Received data:', data);
      
      if (!data) {
        throw new Error('No data received from the server');
      }
      
      setAnalysisData(data);
    } catch (err) {
      console.error('[Analysis] Error analyzing match:', err);
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setError(`เกิดข้อผิดพลาดในการวิเคราะห์: ${errorMessage}`);
      toast.error('เกิดข้อผิดพลาดในการวิเคราะห์ความเข้ากันได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAnalysisData(null);
      setError(null);
      // Automatically trigger analysis when modal opens
      analyzeMatch();
    }
  }, [isOpen, influencerName, brandName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            วิเคราะห์ความเข้ากันได้: {influencerName} x {brandName}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* จุดเด่นของอินฟลูเอนเซอร์ */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-700 mb-2">จุดเด่นของอินฟลูเอนเซอร์</h3>
            {analysisData ? (
              <p className="whitespace-pre-line">{analysisData.influencer_strengths}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-blue-100 rounded animate-pulse"></div>
                <div className="h-4 bg-blue-100 rounded animate-pulse w-5/6"></div>
              </div>
            )}
          </div>

          {/* สไตล์การนำเสนอคอนเทนต์ */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="font-semibold text-green-700 mb-2">สไตล์การนำเสนอคอนเทนต์</h3>
            {analysisData ? (
              <p className="whitespace-pre-line">{analysisData.content_style}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-green-100 rounded animate-pulse"></div>
                <div className="h-4 bg-green-100 rounded animate-pulse w-4/5"></div>
              </div>
            )}
          </div>

          {/* ความเข้ากันได้กับแบรนด์ */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-purple-700 mb-2">ความเข้ากันได้กับแบรนด์</h3>
            {analysisData ? (
              <p className="whitespace-pre-line">{analysisData.brand_compatibility}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-purple-100 rounded animate-pulse"></div>
                <div className="h-4 bg-purple-100 rounded animate-pulse w-5/6"></div>
              </div>
            )}
          </div>

          {/* ความเหมาะสมในการทำแคมเปญ */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h3 className="font-semibold text-yellow-700 mb-2">ความเหมาะสมในการทำแคมเปญ</h3>
            {analysisData ? (
              <p className="whitespace-pre-line">{analysisData.campaign_suitability}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-yellow-100 rounded animate-pulse"></div>
                <div className="h-4 bg-yellow-100 rounded animate-pulse w-4/5"></div>
              </div>
            )}
          </div>

          {/* ข้อเสนอแนะเชิงกลยุทธ์ */}
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
            <h3 className="font-semibold text-pink-700 mb-2">ข้อเสนอแนะเชิงกลยุทธ์</h3>
            {analysisData ? (
              <p className="whitespace-pre-line">{analysisData.strategic_recommendations}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-pink-100 rounded animate-pulse"></div>
                <div className="h-4 bg-pink-100 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-pink-100 rounded animate-pulse w-2/3"></div>
              </div>
            )}
          </div>
        </div>

        {analysisData && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">สรุปผลการวิเคราะห์</h3>
            <div className="space-y-2">
              <p className="text-green-700">
                <span className="font-medium">การวิเคราะห์เสร็จสมบูรณ์:</span> ระบบได้ทำการวิเคราะห์ความเข้ากันได้ระหว่าง {influencerName} และ {brandName} เรียบร้อยแล้ว
              </p>
              <p className="text-green-700">
                <span className="font-medium">ผลการวิเคราะห์:</span> ดูรายละเอียดได้ในส่วนด้านบน
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={analyzeMatch}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังวิเคราะห์...
              </>
            ) : (
              'วิเคราะห์ใหม่'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
