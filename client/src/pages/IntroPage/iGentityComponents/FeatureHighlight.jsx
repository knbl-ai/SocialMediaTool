import React from "react";

const FeatureHighlight = ({ imageSrc, title, description }) => {
  return (
    <div className="flex flex-col h-[320px] px-8 py-10 rounded-2xl border border-solid bg-black bg-opacity-50 border-purple-400 border-opacity-50 min-w-[300px] max-w-[400px]">
      <div className="h-[64px] flex items-center">
        <img
          loading="lazy"
          src={imageSrc}
          alt={title}
          className="w-[4vw] aspect-square object-contain"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between mt-8">
        <div className="text-2xl font-medium tracking-tight leading-normal text-white">
          {title}
        </div>
        <div className="mt-4 leading-relaxed text-white text-opacity-60">
          {description}
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlight;
