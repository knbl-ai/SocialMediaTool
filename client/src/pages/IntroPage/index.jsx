"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./iGentityComponents/Header";
import KeyHighlights from "./iGentityComponents/KeyHighlights";
import FeatureCard from "./iGentityComponents/FeatureCard";
import ImpactMetric from "./iGentityComponents/ImpactMetric";
import ContactForm from "./iGentityComponents/ContactForm";
import Footer from "./iGentityComponents/Footer";

const featureData = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/235af9153805bb6ff776f8a76b99fdc7154a795c1c4f96341568c021d7b08dc4?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "Not Just Another AI Tool",
    description: "Built by marketing experts who understand social media engagement and how it should work in \"the real world\""
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba08a9ef6f22b6be95b7cb66c2b316b11cdd2a273856c1f0c37bf8ded9629bb9?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "Smart Automation, Not Spam",
    description: "Creates thoughtful and tailored content that resonates with audiences."
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ff3a30e2f79af14299ac8df29e169add3feca8cb501adfda43ffcc0df7bf7b89?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "Flexible and Customizable",
    description: "adaptation to unique user's needs with seamlessly integrations to various content sources such as: Testimonials videos, Website blog and in-dept articles."
  }
];

const impactMetricsData = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/39310a25440f36a29ee54f639fcff912eb66454098a2a0ec0d4cb1745ba98058?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "Consistency & Engagement",
    description: "Increase in engagement rates and brand awareness by powering up multi-platform content creation"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/2381e727d356b7081369990cbb1c9c4fed8b658b1c750593a74de72346da5116?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "70% Time Savings",
    description: "Reduction in time spent on content creation and scheduling."
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bbaa31bb34dac6885b5b9a6da5cc3502e7f2ad86b0559777d90e408ebacc3760?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
    title: "Scale & Content Production",
    description: "Proven to scale content production without increasing workload."
  }
];

function IgentityLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-black h-full pt-10">
      <div className="flex flex-col items-center w-full">
        <Header />
        <button
          onClick={() => navigate('/auth')}
          className="absolute top-8 right-8 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105"
        >
          Go to App
        </button>
        <div className="w-full max-w-[1440px] px-4 md:px-6 mx-auto mt-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-purple-600">iGentitY</span>
              <span className="text-white"> One Stop AI Platform</span>
              <br />
              <span className="text-white">for Social Media Content Creation</span>
            </h1>
          
          </div>

          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5634187f111e659dd821f2b1e63c803f67fcfa32b32f0503d1ae21cfd83afa15?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
            alt="iGentitY platform visualization"
            className="w-full object-contain aspect-[1.68]"
          />
          <div className="flex flex-col mt-5 w-full text-lg tracking-normal text-white text-opacity-60">
            <div className="max-w-[530px]">
              iGentitY is an AI-powered social media content platform that generated
              tailored authentic content for all Social platforms in one-stop-shop
              dashboard.
              <br />
              <span className="text-purple-600">
                More content, More creativity, More efficiency.
              </span>
              <br />
              Brands and content creators can do more in less time without
              sacrificing creativity. iGentitY assists with content creation,
              scheduling, and publishing across multiple platforms.
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/37381d516ed9fe2423ee1a2e938c6e7c72f1dc62007684cc61c6dd11744890d6?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
              alt="iGentitY platform features overview"
              className="w-full object-contain mt-32 md:mt-60 aspect-[1.76]"
            />
          </div>
          
          <div className="w-full mt-20">
            <div className="flex gap-5 flex-col md:flex-row">
              <div className="w-full md:w-6/12 bg-zinc-900 p-8 md:p-16">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/9d0c5b1e490170b9e3f1aeaef63833ac06eb668182d1c7437ea51935c61e9e61?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                  alt="iGentitY platform interface"
                  className="w-full object-contain aspect-[0.85]"
                />
              </div>
              <KeyHighlights />
            </div>
          </div>

          <div className="mt-32 text-4xl font-semibold tracking-tight text-center text-white">
            Why iGentitY Stands Out
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-white">
            {featureData.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          <div className="mt-32 md:mt-56 text-4xl font-semibold tracking-tight text-center text-white">
            Impact Metrics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-white">
            {impactMetricsData.map((metric, index) => (
              <ImpactMetric key={index} {...metric} />
            ))}
          </div>

          <div className="mt-32 text-4xl font-semibold tracking-tight text-center">
            <span className="text-white">The Future</span>{" "}
            <span className="text-purple-600">of Content Creation Awaits</span>
          </div>
          <div className="mt-5 text-lg tracking-normal text-center text-white text-opacity-60 max-w-[625px] mx-auto">
            iGentitY empowers businesses and content creators worldwide. Join us and
            see the potential of AI-assisted, human-led content creation.
          </div>
        </div>
        
        <ContactForm />
        <Footer />
      </div>
    </div>
  );
}

export default IgentityLandingPage; 