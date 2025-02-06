import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Brain, 
  Cloud, 
  Share2, 
  Repeat2, 
  MessageSquareText,
  Timer,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import HyperText from '@/components/ui/hyper-text';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <CardContent className="p-0 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-lime-500" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

const MetricCard = ({ title, value, description }) => (
  <Card className="p-6">
    <CardContent className="p-0 space-y-2 text-center">
      <h3 className="text-4xl font-bold text-lime-500">{value}</h3>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 border-2"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center space-y-6">
        <HyperText className="text-5xl font-bold mb-4">
          iGentitY: One-Stop AI Platform for Social Media Content Creation
        </HyperText>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Empowering brands and creators to thrive in the world of endless platforms and content.
        </p>
      </section>

      {/* What is iGentitY Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8">What is iGentitY?</h2>
          <p className="text-lg text-center max-w-3xl mx-auto text-muted-foreground">
            iGentitY is an AI-powered social media content platform that generates tailored authentic content for all Social platforms in one-stop-shop dashboard.
          </p>
          <p className="text-lg text-center max-w-3xl mx-auto text-muted-foreground">
            Brands and content creators can do more in less time without sacrificing creativity. iGentitY assists with content creation, scheduling, and publishing across multiple platforms.
          </p>
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-lime-500">More content, More creativity, More efficiency.</h3>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Scalable & Reliable Technology</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="Custom AI Models"
              description="Custom AI models for text, video, testimonials and image generation."
            />
            <FeatureCard
              icon={Cloud}
              title="Cloud Infrastructure"
              description="Cloud-based infrastructure designed to handle large-scale content needs."
            />
            <FeatureCard
              icon={Share2}
              title="API Integrations"
              description="API-driven integrations with all major social media platforms."
            />
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Repeat2}
              title="Multi-Platform Connectivity"
              description="Automatically schedules and publishes content tailored for each platform."
            />
            <FeatureCard
              icon={MessageSquareText}
              title="Multi-Platform Adaptation"
              description="Tailor-made content optimized for each platform: hashtags for X, vertical videos for TikTok, and more."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI-Generated Content That Feels Human"
              description="Suggests engaging text, images, videos, and hashtags. Content teams retain full creative control."
            />
          </div>
        </div>
      </section>

      {/* Why iGentitY Stands Out */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why iGentitY Stands Out</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Rocket}
              title="Not Just Another AI Tool"
              description="Built by marketing experts who understand social media engagement and how it should work in 'the real world'"
            />
            <FeatureCard
              icon={Brain}
              title="Smart Automation, Not Spam"
              description="Creates thoughtful and tailored content that resonates with audiences."
            />
            <FeatureCard
              icon={Scale}
              title="Flexible and Customizable"
              description="Adaptation to unique user's needs with seamlessly integrations to various content sources such as: Testimonials videos, Website blog and in-dept articles."
            />
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Impact Metrics</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <MetricCard
              title="Engagement"
              value="↑"
              description="Increase in engagement rates and brand awareness by powering up multi-platform content creation"
            />
            <MetricCard
              title="Time Savings"
              value="70%"
              description="Reduction in time spent on content creation and scheduling."
            />
            <MetricCard
              title="Content Production"
              value="∞"
              description="Proven to scale content production without increasing workload."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold">The Future of Content Creation Awaits</h2>
          <p className="text-lg text-muted-foreground">
            iGentitY empowers businesses and content creators worldwide. Join us and see the potential of AI-assisted, human-led content creation.
          </p>
          <Button 
            size="lg" 
            className="mt-8"
            onClick={() => navigate('/')}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About; 