import React from "react";

const BottomImage = () => {
  return (
    <div className="relative w-full min-h-[400px] flex items-end">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/7c806acf2c45d9d67ef925d6bbd630a2f97956e494d00b6fa9dd7a6b639579b1?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Background waves"
      />
      <div className="relative z-10 flex justify-between items-center w-full max-w-[1440px] px-8 pb-8 mx-auto">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/562bf34b83003a8ce04c840e76c6e97751c0a7468bd6889a019fbddc39971588?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
          alt="iGentitY logo"
          className="h-12 object-contain"
        />
        <div className="text-white text-opacity-60">
          Powered by KNBL.
        </div>
      </div>
    </div>
  );
};

export default BottomImage;