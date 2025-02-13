import React from "react";

function KeyHighlights() {
  return (
    <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
      <div className="flex flex-col grow justify-center items-center px-20 py-24 w-full text-white bg-purple-600 max-md:px-5 max-md:py-24 max-md:max-w-full">
        <div className="flex flex-col max-w-full w-[480px]">
          <div className="text-4xl font-semibold tracking-tight leading-snug max-md:max-w-full">
            Key Highlights
          </div>
          <div className="flex flex-col mt-10 w-full text-base tracking-normal max-md:max-w-full">
            <div className="max-md:max-w-full">
              <span className="text-xl font-semibold leading-8 text-black">
                Multi-Platform Connectivity
              </span>
              <br />
              Seamlessly connects to Facebook, Instagram, LinkedIn, X , TikTok,
              blogs, website
            </div>
            <div className="mt-8 max-md:max-w-full">
              <span className="text-xl font-semibold leading-8 text-black">
                Automation Across All Platforms
              </span>
              <br />
              Automatically schedules and publishes content tailored for each
              platform.
            </div>
            <div className="mt-8 max-md:max-w-full">
              <span className="text-xl font-semibold leading-8 text-black">
                Multi-Platform Adaptation
              </span>
              <br />
              Tailor-made content optimized for each platform: hashtags for X,
              vertical videos for TikTok, and more.
            </div>
            <div className="mt-8 max-md:max-w-full">
              <span className="text-xl font-semibold leading-8 text-black">
                AI-Generated Content That Feels Human
              </span>
              <br />
              Suggests engaging text, images, videos, and hashtags. Content
              teams retain full creative control.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyHighlights;
