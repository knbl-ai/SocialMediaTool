import React from "react";
import Header from "./Header";
import KeyHighlights from "./KeyHighlights";
import FeatureCard from "./FeatureCard";
import ImpactMetric from "./ImpactMetric";
import ContactForm from "./ContactForm";
import Footer from "./Footer";

function IgentityApp() {
  const features = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/235af9153805bb6ff776f8a76b99fdc7154a795c1c4f96341568c021d7b08dc4?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Not Just Another AI Tool",
      description:
        'Built by marketing experts who understand social media engagement and how it should work in "the real world"',
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba08a9ef6f22b6be95b7cb66c2b316b11cdd2a273856c1f0c37bf8ded9629bb9?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Smart Automation, Not Spam",
      description:
        "Creates thoughtful and tailored content that resonates with audiences.",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ff3a30e2f79af14299ac8df29e169add3feca8cb501adfda43ffcc0df7bf7b89?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Flexible and Customizable",
      description:
        "adaptation to unique user's needs with seamlessly integrations to various content sources such as: Testimonials videos, Website blog and in-dept articles.",
    },
  ];

  const impactMetrics = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/39310a25440f36a29ee54f639fcff912eb66454098a2a0ec0d4cb1745ba98058?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Consistency & Engagement",
      description:
        "Increase in engagement rates and brand awareness by powering up multi-platform content creation",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/2381e727d356b7081369990cbb1c9c4fed8b658b1c750593a74de72346da5116?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "70% Time Savings",
      description:
        "Reduction in time spent on content creation and scheduling.",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/bbaa31bb34dac6885b5b9a6da5cc3502e7f2ad86b0559777d90e408ebacc3760?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c",
      title: "Scale & Content Production",
      description:
        "Proven to scale content production without increasing workload.",
    },
  ];

  return (
    <div className="flex overflow-hidden flex-col items-center py-11 bg-black">
      <Header />
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/5634187f111e659dd821f2b1e63c803f67fcfa32b32f0503d1ae21cfd83afa15?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
        alt="iGentitY platform visualization"
        className="object-contain self-stretch w-full aspect-[1.68] max-md:max-w-full"
      />
      <div className="flex flex-col self-end mt-5 w-full text-lg tracking-normal max-w-[1260px] text-white text-opacity-60 max-md:max-w-full">
        <div className="w-[530px] max-md:max-w-full">
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
          alt="iGentitY platform features showcase"
          className="object-contain mt-60 w-full aspect-[1.76] max-md:mt-10 max-md:max-w-full"
        />
      </div>
      <div className="self-stretch w-full max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow px-16 w-full bg-zinc-900 max-md:px-5 max-md:max-w-full">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/9d0c5b1e490170b9e3f1aeaef63833ac06eb668182d1c7437ea51935c61e9e61?placeholderIfAbsent=true&apiKey=0a41617f0e1745a1b88c87027d30e88c"
                alt="iGentitY platform interface"
                className="object-contain w-full aspect-[0.85] max-md:max-w-full"
              />
            </div>
          </div>
          <KeyHighlights />
        </div>
      </div>
      <div className="mt-32 text-4xl font-semibold tracking-tight leading-none text-center text-white max-md:mt-10 max-md:max-w-full">
        Why iGentitY Stands Out
      </div>
      <div className="flex flex-wrap gap-8 items-start mt-16 w-full text-base tracking-normal text-white max-w-[1080px] max-md:mt-10 max-md:max-w-full">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
      <div className="mt-56 text-4xl font-semibold tracking-tight leading-none text-center text-white max-md:mt-10">
        Impact Metrics
      </div>
      <div className="flex flex-wrap gap-8 items-start mt-16 w-full text-base tracking-normal text-white max-w-[1080px] max-md:mt-10 max-md:max-w-full">
        {impactMetrics.map((metric, index) => (
          <ImpactMetric key={index} {...metric} />
        ))}
      </div>
      <div className="mt-32 text-4xl font-semibold tracking-tight leading-snug text-center text-purple-600 max-md:mt-10 max-md:max-w-full">
        <span className="text-white">The Future</span> of Content Creation
        Awaits
      </div>
      <div className="mt-5 text-lg tracking-normal text-center text-white text-opacity-60 w-[625px] max-md:max-w-full">
        iGentitY empowers businesses and content creators worldwide. Join us and
        see the potential of AI-assisted, human-led content creation.
      </div>
      <ContactForm />
      <Footer />
    </div>
  );
}

export default IgentityApp;
