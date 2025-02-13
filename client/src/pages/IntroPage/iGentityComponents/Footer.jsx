import React from "react";

function Footer() {
  return (
    <div className="flex flex-wrap gap-5 justify-between mt-80 w-full text-sm tracking-normal text-right text-white max-w-[1360px] max-md:mt-10 max-md:max-w-full">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/562bf34b83003a8ce04c840e76c6e97751c0a7468bd6889a019fbddc39971588?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
        alt="iGentitY logo"
        className="object-contain shrink-0 max-w-full aspect-[4.39] w-[184px]"
      />
      <div className="self-end mt-5">Powered by KNBL.</div>
    </div>
  );
}

export default Footer;
