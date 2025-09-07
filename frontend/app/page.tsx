"use client";

import HeroSection from "@/components/HeroSection";
import RERAProjects from "@/components/RERAProjects";

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <RERAProjects />
      </div>
    </main>
  );
}
