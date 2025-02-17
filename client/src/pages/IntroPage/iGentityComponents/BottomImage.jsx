import React from "react";

const BottomImage = () => {
  return (
    <div className="w-full mt-32">
      <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] xl:h-[800px]">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/7c806acf2c45d9d67ef925d6bbd630a2f97956e494d00b6fa9dd7a6b639579b1?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
          className="absolute inset-0 w-full h-full object-cover object-top"
          alt="Background waves"
        />
        {/* Desktop version */}
        <div className="absolute bottom-0 left-0 right-0 z-10 hidden md:flex justify-between items-center w-full max-w-[1440px] px-8 pb-8 mx-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/562bf34b83003a8ce04c840e76c6e97751c0a7468bd6889a019fbddc39971588?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
            alt="iGentitY logo"
            className="h-12 lg:h-16 object-contain"
          />
          <div className="text-white text-opacity-60 text-base lg:text-lg">
            Powered by KNBL.
          </div>
        </div>
        {/* Mobile version */}
        <div className="absolute bottom-0 left-0 right-0 z-10 md:hidden flex flex-col items-center justify-center w-full pb-8">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/562bf34b83003a8ce04c840e76c6e97751c0a7468bd6889a019fbddc39971588?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
            alt="iGentitY logo"
            className="h-12 object-contain mb-4"
          />
          <div className="text-white text-opacity-60 text-base">
            Powered by KNBL.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomImage;