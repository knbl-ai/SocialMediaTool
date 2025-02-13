import React from "react";

const KeyHighlight = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-2 mt-6 first:mt-0">
      <div className="font-medium">{title}</div>
      <div className="text-white text-opacity-80">{description}</div>
    </div>
  );
};

export default KeyHighlight;
