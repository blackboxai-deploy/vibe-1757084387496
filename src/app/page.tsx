'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with canvas
const CarromGame = dynamic(() => import('@/components/CarromGame'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🎯</div>
        <div className="text-xl font-semibold text-amber-900">Loading Carrom Game...</div>
        <div className="text-amber-700 mt-2">Preparing the board...</div>
      </div>
    </div>
  )
});

export default function Home() {
  return <CarromGame />;
}