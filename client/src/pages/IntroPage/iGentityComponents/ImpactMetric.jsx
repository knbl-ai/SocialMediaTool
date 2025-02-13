import React from 'react';

const ImpactMetric = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col flex-1 items-start">
      <img
        loading="lazy"
        src={icon}
        alt={title}
        className="aspect-square w-[72px]"
      />
      <div className="mt-6 text-2xl font-medium tracking-tight leading-8">
        {title}
      </div>
      <div className="mt-4 leading-6 text-white text-opacity-60">
        {description}
      </div>
    </div>
  );
};

export default ImpactMetric;
