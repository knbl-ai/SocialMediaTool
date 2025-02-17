"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import ImpactMetric from "./iGentityComponents/ImpactMetric";
import FeatureHighlight from "./iGentityComponents/FeatureHighlight";
import KeyHighlight from "./iGentityComponents/KeyHighlight";
import ContactForm from "./iGentityComponents/ContactForm";
import BackgroundImage from "./iGentityComponents/BackgroundImage";
import BottomImage from "./iGentityComponents/BottomImage";

const IGentityLandingPage = () => {
  const navigate = useNavigate();

  const impactMetrics = [
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/39310a25440f36a29ee54f639fcff912eb66454098a2a0ec0d4cb1745ba98058?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Consistency & Engagement",
      description: "Increase in engagement rates and brand awareness by powering up multi-platform content creation"
    },
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/2381e727d356b7081369990cbb1c9c4fed8b658b1c750593a74de72346da5116?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "70% Time Savings",
      description: "Reduction in time spent on content creation and scheduling."
    },
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/bbaa31bb34dac6885b5b9a6da5cc3502e7f2ad86b0559777d90e408ebacc3760?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Scale & Content Production",
      description: "Proven to scale content production without increasing workload."
    }
  ];

  const featureHighlights = [
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/235af9153805bb6ff776f8a76b99fdc7154a795c1c4f96341568c021d7b08dc4?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Not Just Another AI Tool",
      description: "Built by marketing experts who understand social media engagement and how it should work in \"the real world\""
    },
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba08a9ef6f22b6be95b7cb66c2b316b11cdd2a273856c1f0c37bf8ded9629bb9?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Smart Automation, Not Spam",
      description: "Creates thoughtful and tailored content that resonates with audiences."
    },
    {
      imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/ff3a30e2f79af14299ac8df29e169add3feca8cb501adfda43ffcc0df7bf7b89?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Flexible and Customizable",
      description: "Adaptation to unique user's needs with seamlessly integrations to various content sources such as: Testimonials videos, Website blog and in-dept articles."
    }
  ];

  const keyHighlights = [
    {
      title: "Multi-Platform Connectivity",
      description: "Seamlessly connects to Facebook, Instagram, LinkedIn, X , TikTok, blogs, website"
    },
    {
      title: "Automation Across All Platforms",
      description: "Automatically schedules and publishes content tailored for each platform."
    },
    {
      title: "Multi-Platform Adaptation",
      description: "Tailor-made content optimized for each platform: hashtags for X, vertical videos for TikTok, and more."
    },
    {
      title: "AI-Generated Content That Feels Human",
      description: "Suggests engaging text, images, videos, and hashtags. Content teams retain full creative control."
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full w-full bg-black">
          <div className="w-full flex flex-col items-center pt-8">
            <div className="w-full flex md:justify-center justify-start px-4 md:px-0">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bfc3e2373ca4a8c904af560e72ad3afea6062a550d6bb20dadf2400d27680528?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                alt="iGentitY logo"
                className="object-contain max-w-full aspect-[4.41] w-[211px] md:w-[211px] max-md:w-[150px]"
              />
            </div>
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  const button = document.querySelector('#goToAppBtn');
                  button.classList.add('mobile-clicked');
                } else {
                  navigate('/auth');
                }
              }}
              id="goToAppBtn"
              className="absolute md:top-[4vh] top-[32px] right-[2vw] bg-[#22c55e] text-black font-semibold py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105 md:hover:bg-[#16a34a] text-sm md:text-base max-md:[&.mobile-clicked]:pointer-events-none max-md:[&.mobile-clicked]:bg-orange-500"
            >
              <span className="block max-md:[.mobile-clicked_&]:hidden">Go to App</span>
              <span className="hidden max-md:[.mobile-clicked_&]:block">Must use on Desktop</span>
            </button>
            <style>
              {`
                @media (max-width: 767px) {
                  #goToAppBtn.mobile-clicked {
                    background-color: rgb(249 115 22) !important;
                  }
                }
              `}
            </style>
            <div className="mt-36 md:text-6xl text-4xl font-semibold tracking-tighter text-center text-[#ffffff] md:leading-[80px] leading-[55px] px-4 md:px-0 max-md:mt-16">
              <div className="md:block hidden">
                One Stop
                AI Platform for
                <br />
                Social Media
                Content Creation
              </div>
              <div className="md:hidden block">
                One Stop AI Platform
                <br />
                For Social Media
                <br />
                Content Creation
              </div>
            </div>
            {/* Desktop Image */}
            <div className="hidden md:block">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c7b93229ff6b072f6118d3facad3a6cf82e7ec9d16af65046764ec7fc1172cc1?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                alt="Social media platforms illustration"
                className="object-contain w-full mt-8 aspect-[1.68]"
              />
            </div>
            {/* Mobile Content */}
            <div className="md:hidden flex flex-col items-center">
              <p className="text-[#ffffff] opacity-60 text-center px-4 mt-4">
                Empowering brands and creators to thrive in the world of endless platforms and content
              </p>
              <img
                src="/mobile.png"
                alt="Mobile social media illustration"
                className="w-full mt-8"
              />
              <h2 className="text-[#ffffff] text-4xl font-semibold mt-4">
                What is iGentitY
              </h2>
            </div>
            <div className="flex flex-col self-end mt-5 w-full text-lg tracking-normal max-md:max-w-full bg-black">
              <div className="flex items-center px-[13vw] max-md:flex-col max-md:px-4">
                <div className="w-[300px] max-md:w-full shrink-0 flex flex-col justify-center text-[#ffffff] opacity-60 max-md:text-center max-md:mt-8">
                  iGentitY is an AI-powered social media content platform that generates
                  tailored authentic content for all social media platforms in one-stop-shop
                  dashboard.
                  <br />
                  <span className="text-[#9333ea] opacity-100">
                    More content, More creativity, More efficiency.
                  </span>
                  <br />
                  Brands and content creators can do more in less time without
                  sacrificing creativity. iGentitY assists with content creation,
                  scheduling, and publishing across multiple platforms.
                </div>
                <div className="flex-1 aspect-video ms-20 max-md:ms-0 max-md:mt-8 max-md:w-full">
                  <div className="relative w-full h-full rounded-lg shadow-[0_0_80px_rgba(147,51,234,0.3)] overflow-hidden">
                    <iframe 
                      src="https://player.vimeo.com/video/1056134661?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
                      className="w-full h-full"
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                      title="iGentitY - Your new social presence"
                    />
                  </div>
                </div>
              </div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/37381d516ed9fe2423ee1a2e938c6e7c72f1dc62007684cc61c6dd11744890d6?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                alt="Content creation process illustration"
                className="object-contain w-full aspect-[1.76] max-md:mt-10 max-md:px-4 px-[13vw] ms-[10vw] max-md:ms-0"
              />
            </div>
            <div className="self-stretch w-full max-md:max-w-full">
              <div className="flex max-md:flex-col">
                <div className="flex flex-col w-6/12 max-md:w-full">
                  <div className="flex flex-col grow px-16 w-full bg-[#18181b] max-md:px-4">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/9d0c5b1e490170b9e3f1aeaef63833ac06eb668182d1c7437ea51935c61e9e61?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                      alt="iGentitY platform interface"
                      className="object-contain w-full aspect-[0.85]"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-6/12 max-md:w-full">
                  <div className="flex flex-col grow justify-center items-center px-20 py-24 w-full bg-gradient-to-br from-purple-500 to-purple-600 max-md:px-6 max-md:py-16">
                    <div className="flex flex-col max-w-full w-[480px] max-md:w-full">
                      <div className="text-5xl font-bold text-white mb-12 max-md:text-4xl max-md:mb-8">
                        Key Highlights
                      </div>
                      <div className="flex flex-col gap-8 w-full text-base tracking-normal">
                        {keyHighlights.map((highlight, index) => (
                          <KeyHighlight key={index} {...highlight} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full relative">
            <BackgroundImage />
            <div className="relative z-10">
              <div className="mt-16 text-4xl font-semibold tracking-tight leading-none text-center text-[#ffffff] max-md:mt-10 max-md:px-4">
                Why iGentitY Stands Out
              </div>
              <div className="flex flex-wrap justify-center gap-8 items-start mt-16 w-full text-base tracking-normal text-[#ffffff] max-w-[1440px] mx-auto px-4 max-md:mt-10 max-md:gap-6">
                {featureHighlights.map((feature, index) => (
                  <FeatureHighlight key={index} {...feature} />
                ))}
              </div>
              <div className="mt-24 text-4xl font-semibold tracking-tight leading-none text-center text-[#ffffff] max-md:mt-16 max-md:px-4">
                Impact Metrics
              </div>
              <div className="flex flex-wrap justify-center gap-8 items-start mt-16 w-full text-base tracking-normal text-[#ffffff] max-w-[1440px] mx-auto px-4 max-md:mt-10 max-md:gap-6">
                {impactMetrics.map((metric, index) => (
                  <ImpactMetric key={index} {...metric} />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="mt-16 text-4xl font-semibold tracking-tight leading-snug text-center text-[#9333ea] max-md:mt-10 max-md:px-4">
              <span className="text-[#ffffff]">Step into the</span> Future of Content Creation
            </div>
            <div className="mt-5 text-lg tracking-normal text-center text-[#ffffff] opacity-60 w-[625px] max-md:w-full max-md:px-6">
              iGentitY empowers businesses and content creators worldwide. Join us and
              see the potential of AI-assisted, human-led content creation.
            </div>
            <ContactForm />
            <div className="w-full">
              <BottomImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IGentityLandingPage; 