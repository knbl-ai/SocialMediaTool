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
      description: "adaptation to unique user's needs with seamlessly integrations to various content sources such as: Testimonials videos, Website blog and in-dept articles."
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
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/bfc3e2373ca4a8c904af560e72ad3afea6062a550d6bb20dadf2400d27680528?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
              alt="iGentitY logo"
              className="object-contain max-w-full aspect-[4.41] w-[211px]"
            />
            <button
              onClick={() => navigate('/auth')}
              className="absolute top-[2vh] right-[2vw] bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-[0.5vh] px-[1.5vw] rounded-full transition-all duration-200 transform hover:scale-105"
            >
              Go to App
            </button>
            <div className="mt-36 text-6xl font-semibold tracking-tighter text-center text-[#ffffff] leading-[80px] max-md:mt-10 max-md:max-w-full max-md:text-4xl max-md:leading-[55px]">
              <span className="text-[#9333ea]">iGentitY</span> One Stop AI Platform
              <br />
              for Social Media Content Creation
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c7b93229ff6b072f6118d3facad3a6cf82e7ec9d16af65046764ec7fc1172cc1?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
              alt="Social media platforms illustration"
              className="object-contain self-stretch w-full aspect-[1.68] max-md:max-w-full"
            />
            <div className="flex flex-col self-end mt-5 w-full text-lg tracking-normal max-md:max-w-full bg-black">
              <div className="flex items-center px-[13vw] max-md:flex-col">
                <div className="w-[300px] max-md:w-full shrink-0 flex flex-col justify-center text-[#ffffff] opacity-60">
                  iGentitY is an AI-powered social media content platform that generated
                  tailored authentic content for all Social platforms in one-stop-shop
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
                <div className="flex-1 aspect-video ms-20">
                  <iframe 
                    src="https://player.vimeo.com/video/1056134661?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
                    className="w-full h-full rounded-lg"
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                    title="iGentitY - Your new social presence"
                  />
                </div>
              </div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/37381d516ed9fe2423ee1a2e938c6e7c72f1dc62007684cc61c6dd11744890d6?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                alt="Content creation process illustration"
                className="object-contain w-full aspect-[1.76] max-md:mt-10 max-md:max-w-full px-[13vw] ms-[10vw]"
              />
            </div>
            <div className="self-stretch w-full max-md:max-w-full">
              <div className="flex max-md:flex-col">
                <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
                  <div className="flex flex-col grow px-16 w-full bg-[#18181b] max-md:px-5 max-md:max-w-full">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/9d0c5b1e490170b9e3f1aeaef63833ac06eb668182d1c7437ea51935c61e9e61?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                      alt="iGentitY platform interface"
                      className="object-contain w-full aspect-[0.85] max-md:max-w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
                  <div className="flex flex-col grow justify-center items-center px-20 py-24 w-full text-[#ffffff] bg-[#9333ea] max-md:px-5 max-md:py-24 max-md:max-w-full">
                    <div className="flex flex-col max-w-full w-[480px]">
                      <div className="text-4xl font-semibold tracking-tight leading-snug max-md:max-w-full">
                        Key Highlights
                      </div>
                      <div className="flex flex-col mt-10 w-full text-base tracking-normal max-md:max-w-full">
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
              <div className="mt-16 text-4xl font-semibold tracking-tight leading-none text-center text-[#ffffff] max-md:mt-10 max-md:max-w-full">
                Why iGentitY Stands Out
              </div>
              <div className="flex flex-wrap justify-center gap-8 items-start mt-16 w-full text-base tracking-normal text-[#ffffff] max-w-[1440px] mx-auto px-4 max-md:mt-10">
                {featureHighlights.map((feature, index) => (
                  <FeatureHighlight key={index} {...feature} />
                ))}
              </div>
              <div className="mt-24 text-4xl font-semibold tracking-tight leading-none text-center text-[#ffffff] max-md:mt-10">
                Impact Metrics
              </div>
              <div className="flex flex-wrap justify-center gap-8 items-start mt-16 w-full text-base tracking-normal text-[#ffffff] max-w-[1440px] mx-auto px-4 max-md:mt-10">
                {impactMetrics.map((metric, index) => (
                  <ImpactMetric key={index} {...metric} />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="mt-16 text-4xl font-semibold tracking-tight leading-snug text-center text-[#9333ea] max-md:mt-10 max-md:max-w-full">
              <span className="text-[#ffffff]">The Future</span> of Content Creation Awaits
            </div>
            <div className="mt-5 text-lg tracking-normal text-center text-[#ffffff] opacity-60 w-[625px] max-md:max-w-full">
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