import { useState, useEffect, useRef } from 'react';

const reviews = [
  {
    name: "Caliber",
    username: "caliber.co.il",
    body: "Smart, fast, and on-brand—let AI handle your social media while you focus on what matters! 🤖✨ #ContentMadeEasy",
    img: "https://res.cloudinary.com/dbajenfxp/image/upload/v1739274864/WhatsApp_Image_2025-02-11_at_08.45.19_rxpind.jpg"
  },
  {
    name: "GetStarted",
    username: "getstarted.co.il",
    body: "Say goodbye to content stress—this app creates, you shine! 🚀📲 #GameChanger",
    img: "https://res.cloudinary.com/dbajenfxp/image/upload/v1739274864/3_ek5ygr.png"
  },
  {
    name: "Genesis Tours",
    username: "genesis-tours.co.il",
    body: "It increases our Social Media conversion rate and liberates us from the stress of creating content.",
    img: "../../public/tourist.jpeg"
  },
  {
    name: "Company",
    username: "@company",
    body: "Place for your testimonials",
    img: "https://png.pngtree.com/png-vector/20220825/ourmid/pngtree-creative-logo-design-vector-free-png-png-image_6123042.png"
  },
  {
    name: "Company",
    username: "@company",
    body: "Place for your testimonials",
    img: "https://png.pngtree.com/png-vector/20220825/ourmid/pngtree-creative-logo-design-vector-free-png-png-image_6123042.png"
  },
  {
    name: "Company",
    username: "@company",
    body: "Place for your testimonials",
    img: "https://png.pngtree.com/png-vector/20220825/ourmid/pngtree-creative-logo-design-vector-free-png-png-image_6123042.png"
  }
];

const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure className="relative w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4 
      border-gray-950/10 bg-gray-950/[.01] hover:bg-gray-950/[.05] 
      dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/[.15]
      transition-all duration-300">
      <div className="flex flex-row items-center gap-2">
        <img 
          className="rounded-full w-8 h-8 object-cover" 
          alt={`${name}'s profile`} 
          src={img}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/32';
          }}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm dark:text-white/80">{body}</blockquote>
    </figure>
  );
};

const InfiniteMarquee = ({ items, direction = 'left', speed = 50 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollerRef = useRef(null);
  const primaryRef = useRef(null);
  const scrollWidth = useRef(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!primaryRef.current) return;
    
    const calculateWidth = () => {
      if (primaryRef.current) {
        scrollWidth.current = primaryRef.current.offsetWidth;
        setShouldAnimate(true);
      }
    };

    // Initial calculation
    calculateWidth();

    // Recalculate on window resize
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, [items]);

  const marqueeSpeed = isHovered ? 0 : speed;

  return (
    <div 
      className="group relative flex overflow-hidden w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={scrollerRef}
    >
      <div
        className="flex gap-4 py-4 animate-none"
        style={{
          animationPlayState: isHovered ? 'paused' : 'running',
          animationDuration: `${scrollWidth.current / marqueeSpeed}s`,
          animationName: shouldAnimate ? 'scroll' : 'none',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: direction === 'right' ? 'reverse' : 'normal'
        }}
        ref={primaryRef}
      >
        {items.map((review, idx) => (
          <ReviewCard key={idx} {...review} />
        ))}
        {items.map((review, idx) => (
          <ReviewCard key={`duplicate-${idx}`} {...review} />
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-black" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-black" />
    </div>
  );
};

const Testimonials = () => {
  return (
    <div className="w-full max-w-[100vw] overflow-hidden">
      <style>
        {`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
      <InfiniteMarquee items={reviews} direction="left" speed={40} />
    </div>
  );
};

export default Testimonials;