import React from "react";

const ImpactMetric = ({ imageSrc, title, description }) => {
  return (
    <div className="flex flex-col h-[320px] px-8 py-10 rounded-2xl border border-solid bg-black bg-opacity-50 border-purple-400 border-opacity-50 min-w-[300px] max-w-[400px]">
      <div className="h-[48px] flex items-center">
        <img
          loading="lazy"
          src={imageSrc}
          alt={title}
          className="w-[2.5vw] aspect-square object-contain"
        />
      </div>
      <div className="flex flex-col mt-8">
        <div className="text-2xl font-medium tracking-tight leading-normal text-white mb-2">
          {title}
        </div>
        <div className="text-base leading-relaxed text-white text-opacity-60">
          {description}
        </div>
      </div>
    </div>
  );
};

export default ImpactMetric;
