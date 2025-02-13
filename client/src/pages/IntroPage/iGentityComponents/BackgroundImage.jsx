import React from "react";

const BackgroundImage = () => {
  return (
    <div className="absolute w-full h-full left-0 top-0 z-0 pointer-events-none overflow-hidden">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc793e9e2f12b3c5af5ef72d8cc1a2eb1c2b08123100c847b4bcf617501c083a?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
        className="object-cover w-full h-full opacity-70"
        alt="Background wave pattern"
      />
    </div>
  );
};

export default BackgroundImage;