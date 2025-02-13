import { useState } from 'react';

const reviews = [
  {
    name: "Caliber",
    username: "caliber.co.il",
    body: "Smart, fast, and on-brand—let AI handle your social media while you focus on what matters! 🤖✨ #ContentMadeEasy",
    img: "https://res.cloudinary.com/dbajenfxp/image/upload/v1739274864/WhatsApp_Image_2025-02-11_at_08.45.19_rxpind.jpg"
  },
  {
    name: "GetStarted",
    username: "getstarted.co.il ",
    body: "Say goodbye to content stress—this app creates, you shine! 🚀📲 #GameChanger",
    img: "https://res.cloudinary.com/dbajenfxp/image/upload/v1739274864/3_ek5ygr.png"
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
    <figure className="relative w-64 shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4 border-gray-950/10 bg-gray-950/[.01] hover:bg-gray-950/[.05] dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/[.15]">
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

const MarqueeRow = ({ items, reverse = false }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="group relative flex w-full overflow-hidden w-[70vw]">
      <div 
        className="animate-marquee flex min-w-full gap-4 py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {/* Triple the items for extra safety in seamless loop */}
        {[...items, ...items, ...items].map((review, index) => (
          <ReviewCard key={`${review.username}-${index}`} {...review} />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  const midpoint = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, midpoint);

  return (
    <>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}
      </style>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        {/* First Row */}
        <MarqueeRow items={firstRow} />
        
        {/* Gradient Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
      </div>
    </>
  );
};

export default Testimonials;