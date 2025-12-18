import React, { useEffect, useState } from 'react';

export interface FlowerPalette {
  name: string;
  backPetal: string;
  frontPetal: string;
  highlight: string;
  center: string;
  centerDot: string;
}

interface FlowerPotProps {
  isBreezy: boolean;
  palette: FlowerPalette;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const FlowerPot: React.FC<FlowerPotProps> = ({ isBreezy, palette }) => {
  // Animation states
  const [stemGrown, setStemGrown] = useState(false);
  const [leavesOpen, setLeavesOpen] = useState(false);
  const [budVisible, setBudVisible] = useState(false);
  const [flowerBloom, setFlowerBloom] = useState(false);
  const [bloomFinished, setBloomFinished] = useState(false); // New state to track animation completion
  
  // Interaction states
  const [isCenterClicked, setIsCenterClicked] = useState(false);
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});

  // Stagger the animation on mount
  useEffect(() => {
    const t1 = setTimeout(() => setStemGrown(true), 50); // Start immediately
    const t2 = setTimeout(() => setLeavesOpen(true), 600); // Leaves unfurl as stem finishes
    const t3 = setTimeout(() => setBudVisible(true), 1200); // Bud appears
    const t4 = setTimeout(() => setFlowerBloom(true), 1600); // Bloom starts
    // Mark bloom as finished after the longest transition (1600 start + 1800 duration + buffer)
    const t5 = setTimeout(() => setBloomFinished(true), 3500); 

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleCenterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCenterClicked(true);
    // Reset click animation state after it plays
    setTimeout(() => setIsCenterClicked(false), 300);
  };

  const handlePetalClick = (e: React.MouseEvent, petalId: string) => {
    e.stopPropagation();
    
    // Calculate coordinates relative to the petal's group
    const target = e.currentTarget as unknown as SVGGraphicsElement;
    const svg = target.ownerSVGElement;
    
    if (svg && target.getScreenCTM) {
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        
        const ctm = target.getScreenCTM();
        if (ctm) {
            const inverseCtm = ctm.inverse();
            const localPoint = point.matrixTransform(inverseCtm);
            
            const newRipple = {
                x: localPoint.x,
                y: localPoint.y,
                id: Date.now()
            };
            
            setRipples(prev => ({
                ...prev,
                [petalId]: [...(prev[petalId] || []), newRipple]
            }));
            
            // Remove ripple after animation
            setTimeout(() => {
                setRipples(prev => {
                    const current = prev[petalId];
                    if (!current) return prev;
                    const filtered = current.filter(r => r.id !== newRipple.id);
                    if (filtered.length === 0) {
                        const { [petalId]: _, ...rest } = prev;
                        return rest;
                    }
                    return {
                        ...prev,
                        [petalId]: filtered
                    };
                });
            }, 600);
        }
    }
  };

  // Layer 1: Outer/Back Petals (Deepest, Darker, Largest) - Open first
  const layer1 = Array.from({ length: 12 }).map((_, i) => ({
    id: `l1-${i}`,
    rotation: i * 30,
    scale: 1.15,
    delay: i * 20 // Quick ripple
  }));

  // Layer 2: Mid/Back Petals (Darker, standard size) - Open shortly after
  const layer2 = Array.from({ length: 10 }).map((_, i) => ({
    id: `l2-${i}`,
    rotation: i * 36 + 18, 
    scale: 1.0,
    delay: i * 25 + 150
  }));

  // Layer 3: Mid/Front Petals (Lighter, slightly smaller) - Open after mid back
  const layer3 = Array.from({ length: 10 }).map((_, i) => ({
    id: `l3-${i}`,
    rotation: i * 36, 
    scale: 0.85,
    delay: i * 30 + 350
  }));

  // Layer 4: Inner Petals (Lighter, smallest, center) - Open last
  const layer4 = Array.from({ length: 8 }).map((_, i) => ({
    id: `l4-${i}`,
    rotation: i * 45 + 22.5,
    scale: 0.6,
    delay: i * 35 + 550
  }));

  // Organic petal shape path
  const petalPath = "M0,0 C-6,-15 -18,-35 0,-55 C18,-35 6,-15 0,0";

  // Smoother ease-out with a slight organic overshoot, less aggressive than before
  const organicEase = "ease-[cubic-bezier(0.34,1.3,0.64,1)]";
  
  // Interactive hover classes for petals
  // We switch duration and ease after bloom is finished to make hovers snappy
  const transitionClass = bloomFinished 
    ? "transition-all duration-300 ease-out" 
    : `transition-all duration-[1800ms] ${organicEase}`;
    
  const petalHoverClasses = "cursor-pointer hover:scale-110 hover:brightness-110 hover:drop-shadow-lg";

  // Render Ripple Elements helper
  const renderRipples = (petalId: string) => {
      const activeRipples = ripples[petalId];
      if (!activeRipples) return null;
      
      return activeRipples.map(ripple => (
          <circle
            key={ripple.id}
            cx={ripple.x}
            cy={ripple.y}
            r="10"
            fill={palette.highlight}
            className="animate-ripple pointer-events-none"
            style={{ transformOrigin: `${ripple.x}px ${ripple.y}px` }}
          />
      ));
  };

  return (
    <div className="relative w-64 h-96 flex justify-center items-end transition-transform duration-[3000ms]">
      <svg
        viewBox="0 0 200 300"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pot Shadow */}
        <ellipse cx="100" cy="290" rx="50" ry="8" fill="rgba(0,0,0,0.2)" className="blur-sm" />

        {/* Stem Group - Anchored at bottom of the SVG coordinate system for the plant */}
        <g transform="translate(100, 270)">
          
          {/* Main Sway Wrapper: Sways the entire plant from the base (0,0) */}
          <g 
            className={isBreezy ? 'animate-sway' : ''} 
            style={{ transformOrigin: '0px 0px', animationDuration: '4s' }}
          >
            {/* Stem - smoother curve */}
            <path
              d="M0,0 C2,-40 -4,-80 0,-180"
              fill="none"
              stroke="#15803d" 
              strokeWidth="6"
              strokeLinecap="round"
              className={`transition-all duration-[2000ms] ease-out ${
                stemGrown ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
              }`}
              style={{ transformOrigin: 'bottom center' }}
            />

            {/* Leaves */}
            <g className={`transition-all duration-[1200ms] delay-300 ${organicEase} ${leavesOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transformOrigin: '0 -80px' }}>
              
              {/* Lower Right Leaf (Smaller) */}
              <path
                d="M0,-50 Q8,-60 25,-62 Q35,-65 20,-45 Q5,-40 0,-50"
                fill="#16a34a" 
                className={`origin-bottom-left hover:fill-lime-300 transition-colors cursor-pointer hover:animate-wiggle ${isBreezy ? 'animate-leaf-flutter' : ''}`}
                style={{ animationDelay: '0.2s', animationDuration: '2.5s' }}
              />

              {/* Middle Left Leaf (Main) */}
              <path
                d="M0,-90 Q-10,-100 -40,-105 Q-60,-110 -30,-80 Q-10,-70 0,-90"
                fill="#22c55e" 
                className={`origin-bottom-right hover:fill-lime-300 transition-colors cursor-pointer hover:animate-wiggle ${isBreezy ? 'animate-leaf-flutter' : ''}`}
                style={{ animationDelay: '0.5s', animationDuration: '3.2s' }}
              />
              
              {/* Middle Right Leaf (Main) */}
              <path
                d="M0,-110 Q10,-120 40,-125 Q60,-130 30,-100 Q10,-90 0,-110"
                fill="#22c55e" 
                className={`origin-bottom-left hover:fill-lime-300 transition-colors cursor-pointer hover:animate-wiggle ${isBreezy ? 'animate-leaf-flutter' : ''}`}
                style={{ animationDelay: '1.1s', animationDuration: '2.8s' }}
              />

              {/* Top Left Leaf (Smaller) */}
              <path
                d="M0,-140 Q-8,-150 -25,-152 Q-35,-155 -20,-135 Q-5,-130 0,-140"
                fill="#4ade80" 
                className={`origin-bottom-right hover:fill-lime-300 transition-colors cursor-pointer hover:animate-wiggle ${isBreezy ? 'animate-leaf-flutter' : ''}`}
                style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}
              />
            </g>

            {/* Flower Head Group - Top of stem */}
            <g transform="translate(0, -180)">
              
              {/* Bud Stage (Green sepals before bloom) */}
              <g className={`transition-all duration-1000 ease-out ${budVisible && !flowerBloom ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                  <path d="M0,0 C-10,-15 -5,-25 0,-30 C5,-25 10,-15 0,0" fill="#4ade80" />
              </g>

              {/* Blooming Flower Wrapper */}
              <g className={`transition-all duration-[800ms] ease-out ${flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  
                  {/* Layer 1: Extra Back Petals */}
                  {layer1.map((petal, i) => (
                    <g key={petal.id} transform={`rotate(${petal.rotation}) scale(${petal.scale})`}>
                      <g 
                        className={`origin-bottom ${isBreezy ? 'animate-sway' : ''}`} 
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '3s' }}
                        onClick={(e) => handlePetalClick(e, petal.id)}
                      >
                        <path
                          d={petalPath}
                          fill={palette.backPetal}
                          className={`${transitionClass} origin-bottom ${petalHoverClasses} ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ transitionDelay: bloomFinished ? '0ms' : `${petal.delay}ms` }}
                        />
                        {renderRipples(petal.id)}
                      </g>
                    </g>
                  ))}

                  {/* Layer 2: Standard Back Petals */}
                  {layer2.map((petal, i) => (
                    <g key={petal.id} transform={`rotate(${petal.rotation}) scale(${petal.scale})`}>
                      <g 
                        className={`origin-bottom ${isBreezy ? 'animate-sway' : ''}`} 
                        style={{ animationDelay: `${i * 0.15 + 0.2}s`, animationDuration: '2.8s' }}
                        onClick={(e) => handlePetalClick(e, petal.id)}
                      >
                        <path
                          d={petalPath}
                          fill={palette.backPetal}
                          className={`${transitionClass} origin-bottom ${petalHoverClasses} ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ transitionDelay: bloomFinished ? '0ms' : `${petal.delay}ms` }}
                        />
                        {renderRipples(petal.id)}
                      </g>
                    </g>
                  ))}

                  {/* Layer 3: Front Petals */}
                  {layer3.map((petal, i) => (
                    <g key={petal.id} transform={`rotate(${petal.rotation}) scale(${petal.scale})`}>
                      <g 
                        className={`origin-bottom ${isBreezy ? 'animate-sway' : ''}`} 
                        style={{ animationDelay: `${i * 0.15 + 0.5}s`, animationDuration: '3.2s' }}
                        onClick={(e) => handlePetalClick(e, petal.id)}
                      >
                        <path
                          d={petalPath}
                          fill={palette.frontPetal}
                          className={`${transitionClass} origin-bottom ${petalHoverClasses} ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ 
                            transitionDelay: bloomFinished ? '0ms' : `${petal.delay}ms`,
                            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))'
                          }}
                        />
                        <path
                          d="M0,0 C-3,-10 -6,-25 0,-40 C6,-25 3,-10 0,0"
                          fill={palette.highlight}
                          fillOpacity="0.5"
                          className={`pointer-events-none transition-all duration-[1800ms] origin-bottom ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ transitionDelay: `${petal.delay + 100}ms` }}
                        />
                        {renderRipples(petal.id)}
                      </g>
                    </g>
                  ))}

                  {/* Layer 4: Inner Petals */}
                  {layer4.map((petal, i) => (
                    <g key={petal.id} transform={`rotate(${petal.rotation}) scale(${petal.scale})`}>
                      <g 
                        className={`origin-bottom ${isBreezy ? 'animate-sway' : ''}`} 
                        style={{ animationDelay: `${i * 0.15 + 0.7}s`, animationDuration: '2.5s' }}
                        onClick={(e) => handlePetalClick(e, petal.id)}
                      >
                        <path
                          d={petalPath}
                          fill={palette.frontPetal}
                          fillOpacity="0.9"
                          className={`${transitionClass} origin-bottom ${petalHoverClasses} ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ 
                            transitionDelay: bloomFinished ? '0ms' : `${petal.delay}ms`,
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'
                          }}
                        />
                         <path
                          d="M0,0 C-3,-10 -6,-25 0,-40 C6,-25 3,-10 0,0"
                          fill={palette.highlight}
                          fillOpacity="0.6"
                          className={`pointer-events-none transition-all duration-[1800ms] origin-bottom ${
                            flowerBloom ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          style={{ transitionDelay: `${petal.delay + 100}ms` }}
                        />
                        {renderRipples(petal.id)}
                      </g>
                    </g>
                  ))}

                  {/* Center of Flower - Interactive */}
                  <g 
                    onClick={handleCenterClick}
                    className={`transition-all duration-1000 delay-[800ms] ease-out cursor-pointer hover:scale-110 active:scale-95 group ${
                      flowerBloom ? 'scale-100' : 'scale-0'
                    }`}
                  >
                      {/* Glow underlay */}
                      <circle 
                        cx="0" 
                        cy="0" 
                        r="14" 
                        fill={palette.center} 
                        className="opacity-50 transition-opacity group-hover:opacity-80"
                        style={{ filter: 'blur(5px)' }}
                      />

                      {/* Expanding Ring Effect (on click) */}
                      <circle 
                        cx="0" 
                        cy="0" 
                        r={isCenterClicked ? 40 : 10} 
                        fill="none"
                        stroke={palette.highlight}
                        strokeWidth={isCenterClicked ? 0 : 2}
                        className={`transition-all duration-300 ease-out ${isCenterClicked ? 'opacity-100' : 'opacity-0'}`}
                      />

                      {/* Main center disk */}
                      <circle cx="0" cy="0" r="10" fill={palette.center} />
                      
                      {/* Textured dots in center */}
                      <circle cx="-4" cy="-4" r="1.5" fill={palette.centerDot} />
                      <circle cx="4" cy="-4" r="1.5" fill={palette.centerDot} />
                      <circle cx="-4" cy="4" r="1.5" fill={palette.centerDot} />
                      <circle cx="4" cy="4" r="1.5" fill={palette.centerDot} />
                      <circle cx="0" cy="0" r="1.5" fill={palette.centerDot} />
                  </g>
              </g>
            </g>
          </g>
        </g>

        {/* Pot Body - Static (does not sway) */}
        <g transform="translate(100, 270)">
          {/* Rim */}
          <path d="M-40,0 L40,0 L36,12 L-36,12 Z" fill="#78350f" /> {/* amber-900 */}
          {/* Rim Detail - horizontal inset line */}
          <path d="M-38,6 L38,6" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />

          {/* Base */}
          <path d="M-32,12 L32,12 L24,60 L-24,60 Z" fill="#92400e" /> {/* amber-800 */}
          
          {/* Texture: Horizontal bands (turned clay look) */}
          <path d="M-30,24 Q0,28 30,24" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <path d="M-28,36 Q0,40 28,36" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <path d="M-26,48 Q0,52 26,48" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />

          {/* Texture: Speckles */}
          <circle cx="-10" cy="20" r="1" fill="rgba(0,0,0,0.2)" />
          <circle cx="15" cy="30" r="1.5" fill="rgba(0,0,0,0.2)" />
          <circle cx="-5" cy="45" r="1" fill="rgba(0,0,0,0.2)" />
          <circle cx="10" cy="50" r="1" fill="rgba(0,0,0,0.2)" />
          <circle cx="-20" cy="35" r="1" fill="rgba(0,0,0,0.2)" />

          {/* Shine/Highlight */}
          <path d="M-20,15 L-15,55" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round" className="blur-[1px]" />
        </g>
      </svg>
    </div>
  );
};