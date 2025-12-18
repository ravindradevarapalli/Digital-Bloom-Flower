import React, { useState, useCallback } from 'react';
import { FlowerPot, FlowerPalette } from './components/FlowerPot';
import { RefreshCcw, Sun, Wind } from 'lucide-react';

const PALETTES: FlowerPalette[] = [
  {
    name: 'Rose',
    backPetal: '#be185d', // pink-700
    frontPetal: '#f472b6', // pink-400
    highlight: '#fbcfe8', // pink-200
    center: '#facc15', // yellow-400
    centerDot: '#ca8a04', // yellow-700
  },
  {
    name: 'Violet',
    backPetal: '#6b21a8', // purple-800
    frontPetal: '#a855f7', // purple-500
    highlight: '#e9d5ff', // purple-200
    center: '#fbbf24', // amber-400
    centerDot: '#d97706', // amber-600
  },
  {
    name: 'Marigold',
    backPetal: '#c2410c', // orange-700
    frontPetal: '#fb923c', // orange-400
    highlight: '#ffedd5', // orange-100
    center: '#451a03', // amber-950
    centerDot: '#78350f', // amber-900
  },
  {
    name: 'Glacier',
    backPetal: '#0369a1', // sky-700
    frontPetal: '#38bdf8', // sky-400
    highlight: '#bae6fd', // sky-200
    center: '#fde047', // yellow-300
    centerDot: '#a16207', // yellow-800
  },
  {
    name: 'Crimson',
    backPetal: '#7f1d1d', // red-900
    frontPetal: '#dc2626', // red-600
    highlight: '#fca5a5', // red-300
    center: '#451a03', // amber-950
    centerDot: '#f59e0b', // amber-500
  },
  {
    name: 'Daisy',
    backPetal: '#cbd5e1', // slate-300
    frontPetal: '#f8fafc', // slate-50
    highlight: '#ffffff', // white
    center: '#eab308', // yellow-500
    centerDot: '#854d0e', // yellow-800
  },
  {
    name: 'Coral',
    backPetal: '#e11d48', // rose-600
    frontPetal: '#fb7185', // rose-400
    highlight: '#ffe4e6', // rose-100
    center: '#881337', // rose-900
    centerDot: '#f43f5e', // rose-500
  },
  {
    name: 'Midnight',
    backPetal: '#1e1b4b', // indigo-950
    frontPetal: '#4338ca', // indigo-700
    highlight: '#818cf8', // indigo-400
    center: '#e0e7ff', // indigo-100
    centerDot: '#312e81', // indigo-900
  },
];

const App: React.FC = () => {
  const [bloomKey, setBloomKey] = useState<number>(0);
  const [isBreezy, setIsBreezy] = useState<boolean>(false);
  const [currentPalette, setCurrentPalette] = useState<FlowerPalette>(PALETTES[0]);

  const handleReset = useCallback(() => {
    setBloomKey(prev => prev + 1);
  }, []);

  const toggleBreeze = useCallback(() => {
    setIsBreezy(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000">
      
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep background glow */}
        <div 
          className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-opacity-10 rounded-full blur-[100px] transition-colors duration-1000"
          style={{ backgroundColor: currentPalette.frontPetal }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-opacity-10 rounded-full blur-[100px] transition-colors duration-1000"
          style={{ backgroundColor: currentPalette.backPetal }}
        />

        {/* Rotating Light Rays Layer 1 (Clockwise) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-3xl">
          <svg className="w-[150vmax] h-[150vmax] animate-spin-slower transition-colors duration-1000" viewBox="0 0 100 100">
             <g fill={currentPalette.highlight} fillOpacity="0.15">
                {[...Array(12)].map((_, i) => (
                   <path 
                     key={i} 
                     d="M50 50 L42 0 L58 0 Z" 
                     transform={`rotate(${i * 30} 50 50)`} 
                   />
                ))}
             </g>
          </svg>
        </div>

        {/* Rotating Light Rays Layer 2 (Counter-Clockwise) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-2xl">
          <svg className="w-[120vmax] h-[120vmax] animate-spin-reverse-slower transition-colors duration-1000" viewBox="0 0 100 100">
             <g fill={currentPalette.frontPetal} fillOpacity="0.1">
                {[...Array(8)].map((_, i) => (
                   <path 
                     key={i} 
                     d="M50 50 L35 0 L65 0 Z" 
                     transform={`rotate(${i * 45} 50 50)`} 
                   />
                ))}
             </g>
          </svg>
        </div>
      </div>

      <header className="absolute top-8 z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2 drop-shadow-md">
          Digital Bloom
        </h1>
        <p className="text-slate-300 text-sm drop-shadow-sm">Experience the serenity of growth.</p>
      </header>

      <main className="z-10 flex flex-col items-center justify-center w-full max-w-2xl px-4">
        
        {/* Flower Stage */}
        <div className="relative w-full aspect-square md:aspect-[4/3] max-h-[600px] flex items-end justify-center pb-12">
          <FlowerPot key={bloomKey} isBreezy={isBreezy} palette={currentPalette} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl max-w-full">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/10 group"
          >
            <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            Re-Bloom
          </button>

          <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block" />

          <button
            onClick={toggleBreeze}
            className={`p-3 rounded-xl transition-all border ${
              isBreezy 
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-200' 
                : 'bg-white/5 border-transparent text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Breeze"
          >
            <Wind className={`w-5 h-5 ${isBreezy ? 'animate-pulse' : ''}`} />
          </button>
          
          <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block" />

          {/* Color Palette Selector */}
          <div className="flex flex-wrap justify-center gap-3 max-w-[200px] sm:max-w-none">
             {PALETTES.map((palette) => (
               <button
                 key={palette.name}
                 onClick={() => setCurrentPalette(palette)}
                 title={palette.name}
                 className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                   currentPalette.name === palette.name
                     ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                     : 'border-transparent hover:scale-110 hover:border-white/50'
                 }`}
                 style={{ backgroundColor: palette.frontPetal }}
               />
             ))}
          </div>

        </div>
      </main>

      <footer className="absolute bottom-4 text-slate-500 text-xs">
        Generated with React & Tailwind
      </footer>
    </div>
  );
};

export default App;