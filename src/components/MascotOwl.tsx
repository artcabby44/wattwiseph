import { useState, useEffect, useRef } from 'react';

interface MascotOwlProps {
  mood?: 'neutral' | 'happy' | 'worried' | 'sleeping';
  className?: string;
}

export function MascotOwl({ mood = 'neutral', className = '' }: MascotOwlProps) {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const owlRef = useRef<SVGSVGElement | null>(null);
  const [blink, setBlink] = useState(false);

  // Eye-tracking interaction
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!owlRef.current || mood === 'sleeping') return;

      const rect = owlRef.current.getBoundingClientRect();
      const owlCenterX = rect.left + rect.width / 2;
      const owlCenterY = rect.top + rect.height / 2;

      const dx = event.clientX - owlCenterX;
      const dy = event.clientY - owlCenterY;
      const angle = Math.atan2(dy, dx);
      
      // Limit eye travel distance
      const distance = Math.min(4, Math.sqrt(dx * dx + dy * dy) / 60);

      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mood]);

  // Periodic blinking effect
  useEffect(() => {
    if (mood === 'sleeping') return;
    
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [mood]);

  // Define colours and eye shape based on mood
  const isWorried = mood === 'worried';
  const isHappy = mood === 'happy';
  const isSleeping = mood === 'sleeping';

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        ref={owlRef}
        viewBox="0 0 100 100"
        className="w-32 h-32 md:w-36 md:h-36 drop-shadow-md select-none transition-transform duration-300 hover:scale-105"
        aria-label="WattWisePH mascot owl"
      >
        {/* Branch / Perch */}
        <path
          d="M 15,85 L 85,85"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-slate-300 dark:text-slate-700"
        />
        
        {/* Tail feathers */}
        <path
          d="M 45,78 L 50,86 L 55,78 Z"
          fill="currentColor"
          className="text-emerald-700 dark:text-emerald-900 animate-tail-wag"
        />

        {/* Feet */}
        <ellipse cx="43" cy="83" rx="4" ry="2" fill="#f59e0b" />
        <ellipse cx="57" cy="83" rx="4" ry="2" fill="#f59e0b" />

        {/* Outer Wings (Underneath body) */}
        <path
          d="M 22,50 C 15,62 25,75 30,72"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          className="text-emerald-700 dark:text-emerald-800 transition-all duration-300 hover:-rotate-3"
        />
        <path
          d="M 78,50 C 85,62 75,75 70,72"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          className="text-emerald-700 dark:text-emerald-800 transition-all duration-300 hover:rotate-3"
        />

        {/* Body Shape */}
        <path
          d="M 30,25 C 20,40 25,78 50,78 C 75,78 80,40 70,25 C 65,22 55,25 50,25 C 45,25 35,22 30,25 Z"
          fill="currentColor"
          className="text-emerald-600 dark:text-emerald-700 transition-colors duration-300"
        />

        {/* Ear Tufts */}
        <path d="M 30,26 L 25,16 L 38,23 Z" fill="currentColor" className="text-emerald-700 dark:text-emerald-800" />
        <path d="M 70,26 L 75,16 L 62,23 Z" fill="currentColor" className="text-emerald-700 dark:text-emerald-800" />

        {/* Belly Patch */}
        <path
          d="M 35,50 C 35,68 42,74 50,74 C 58,74 65,68 65,50 C 65,38 58,36 50,36 C 42,38 35,38 35,50 Z"
          fill="white"
          className="dark:fill-slate-100 transition-colors duration-300"
        />

        {/* Feather details on belly */}
        <path d="M 46,45 L 48,48 L 50,45 M 50,45 L 52,48 L 54,45" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 42,53 L 44,56 L 46,53 M 48,53 L 50,56 L 52,53 M 54,53 L 56,56 L 58,53" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 46,61 L 48,64 L 50,61 M 50,61 L 52,64 L 54,61" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* EYE BACKS (Whites of the eyes) */}
        <circle cx="38" cy="38" r="11" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="62" cy="38" r="11" fill="white" stroke="#e2e8f0" strokeWidth="1" />

        {/* Cheek Blush (if Happy) */}
        {isHappy && (
          <>
            <circle cx="29" cy="46" r="3.5" fill="#fca5a5" opacity="0.6" />
            <circle cx="71" cy="46" r="3.5" fill="#fca5a5" opacity="0.6" />
          </>
        )}

        {/* PUPILS AND EYE SHAPES ACCORDING TO STATE */}
        {isSleeping ? (
          <>
            {/* Sleeping eyes - arcs pointing down */}
            <path d="M 31,38 Q 38,44 45,38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 55,38 Q 62,44 69,38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : blink ? (
          <>
            {/* Blinking eyes - straight lines */}
            <line x1="28" y1="38" x2="48" y2="38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="52" y1="38" x2="72" y2="38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            {/* Happy eyes - arcs pointing up */}
            <path d="M 29,40 Q 38,30 47,40" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 53,40 Q 62,30 71,40" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : isWorried ? (
          <>
            {/* Worried eyes - Wide circular pupils, smaller to show shock, and high-angled brows */}
            <path d="M 33,26 Q 38,24 43,28" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 67,26 Q 62,24 57,28" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx={38 + pupilOffset.x} cy={38 + pupilOffset.y} r="4.5" fill="#0f172a" />
            <circle cx={62 + pupilOffset.x} cy={38 + pupilOffset.y} r="4.5" fill="#0f172a" />
            {/* White reflection inside pupil */}
            <circle cx={36.5 + pupilOffset.x} cy={36.5 + pupilOffset.y} r="1.5" fill="white" />
            <circle cx={60.5 + pupilOffset.x} cy={36.5 + pupilOffset.y} r="1.5" fill="white" />
          </>
        ) : (
          <>
            {/* Default neutral eyes with pupil tracking */}
            <circle cx={38 + pupilOffset.x} cy={38 + pupilOffset.y} r="6" fill="#0f172a" />
            <circle cx={62 + pupilOffset.x} cy={38 + pupilOffset.y} r="6" fill="#0f172a" />
            {/* White reflection inside pupil */}
            <circle cx={36 + pupilOffset.x} cy={36 + pupilOffset.y} r="2" fill="white" />
            <circle cx={60 + pupilOffset.x} cy={36 + pupilOffset.y} r="2" fill="white" />
          </>
        )}

        {/* Beak */}
        {isSleeping ? (
          // Slightly lower/softer beak while sleeping
          <path d="M 47,46 L 53,46 L 50,51 Z" fill="#d97706" />
        ) : (
          // Normal beak
          <path d="M 47,44 L 53,44 L 50,52 Z" fill="#f59e0b" />
        )}

        {/* Sweating Drop (if Worried) */}
        {isWorried && (
          <path
            d="M 75,32 C 75,32 78,36 78,39 C 78,41 76,42 75,42 C 74,42 72,41 72,39 C 72,36 75,32 75,32 Z"
            fill="#38bdf8"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Floating Zzz bubbles for sleeping owl */}
      {isSleeping && (
        <div className="absolute top-0 right-0 pointer-events-none">
          <span className="absolute text-slate-400 font-display font-semibold text-sm animate-bounce left-2 -top-1 opacity-70">z</span>
          <span className="absolute text-slate-400 font-display font-semibold text-lg animate-bounce left-6 -top-4 opacity-50 delay-100">Z</span>
          <span className="absolute text-slate-400 font-display font-semibold text-xl animate-bounce left-12 -top-8 opacity-30 delay-200">Z</span>
        </div>
      )}
    </div>
  );
}
