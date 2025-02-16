import React from "react";

const KeyHighlight = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-2 mt-6 first:mt-0">
      <div className="text-xl font-semibold text-[#000000]">{title}</div>
      <div className="text-base ">{description}</div>
    </div>
  );
};

export default KeyHighlight;
