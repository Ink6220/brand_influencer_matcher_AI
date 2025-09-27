"use client"

import { BrandInfluencerMatcher } from "@/components/BrandInfluencerMatcher"

export default function Home() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">ระบบจับคู่แบรนด์และอินฟลูเอนเซอร์</h1>
        <BrandInfluencerMatcher />
      </div>
    </main>
  );
}
