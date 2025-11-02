"use client";

import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqs } from "@/data/faqs";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import { ArrowRight } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

// Sparkles Component to be rendered as a fixed background element
const Sparkles = () => {
  const sparkles = useMemo(() => {
    const sparkleData = [
      // Top-Right Cluster
      {
        key: "tr1",
        top: "10%",
        left: "90%",
        size: 3,
        tint: "white",
        delay: 0.1,
        dur: 4.8,
      },
      {
        key: "tr2",
        top: "15%",
        left: "95%",
        size: 2,
        tint: "cyan",
        delay: 0.4,
        dur: 5.2,
      },
      {
        key: "tr3",
        top: "20%",
        left: "88%",
        size: 2,
        tint: "white",
        delay: 0.9,
        dur: 4.6,
      },
      // Bottom-Left Cluster
      {
        key: "bl1",
        top: "85%",
        left: "15%",
        size: 3,
        tint: "white",
        delay: 0.2,
        dur: 5.0,
      },
      {
        key: "bl2",
        top: "90%",
        left: "10%",
        size: 2,
        tint: "cyan",
        delay: 0.5,
        dur: 4.7,
      },
      {
        key: "bl3",
        top: "80%",
        left: "5%",
        size: 2,
        tint: "white",
        delay: 1.1,
        dur: 5.4,
      },
    ];
    return sparkleData;
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20">
      {sparkles.map((s) => (
        <div
          key={s.key}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen animate-twinkle ${
            s.tint === "cyan" ? "sparkle-cyan" : "sparkle-base"
          }`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div>
      {/* Background Grid (z-index 0) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div role="presentation" className="absolute inset-0 grid-background" />
      </div>

      {/* Sparkle Effect (z-index 20) */}
      <Sparkles />

      {/* Main Content (z-index 10) */}
      <div className="relative z-10">
        <HeroSection />
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              Powerful Features for Your Career Growth
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary transition-colors duration-300"
                >
                  <CardContent className="pt-6 text-center flex flex-col items-center">
                    <div className="flex flex-col items-center justify-center">
                      {feature.icon}
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-4xl font-bold">50+</h3>
                <p className="text-muted-foreground text-md">
                  Industries Covered
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-4xl font-bold">1000+</h3>
                <p className="text-muted-foreground text-md">
                  Interview Questions
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-4xl font-bold">95%</h3>
                <p className="text-muted-foreground text-md">Success Rate</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-4xl font-bold">24/7</h3>
                <p className="text-muted-foreground text-md">AI Support</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Four simple steps to accelerate your career growth
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {howItWorks.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-xl">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonial.map((testimonial, index) => (
                <Card key={index} className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative h-12 w-12 shrink-0">
                          <Image
                            width={40}
                            height={40}
                            src={testimonial.image}
                            alt={testimonial.author}
                            className="rounded-full object-cover border-2 border-primary/20"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                          <p className="text-sm text-primary">
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                      <blockquote>
                        <p className="text-muted-foreground italic relative">
                          <span className="text-3xl text-primary absolute -top-4 -left-2">
                            &quot;
                          </span>
                          {testimonial.quote}
                          <span className="text-3xl text-primary absolute -bottom-4">
                            &quot;
                          </span>
                        </p>
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Find answers to common questions about our platform
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ========== CTA Section: MODIFIED with Even Darker Top/Bottom Metallic Gradient ========== */}
        <section className="w-full py-12 md:py-24">
          <div
            className="py-20 px-6 text-center"
            style={{
              backgroundImage: `linear-gradient(
        to bottom,
        #d8dee6 40%,   /* Lighter blend */
        #ffffff 50%,   /* Bright Silver/White */
        #e2e8f0 60%,   /* Lighter blend */
        #a8b0b8 80%,   /* Darker blend */
        #616a6b 100%   /* Even Darker Metallic Grey */
      )`,
            }}
          >
            <div className="flex flex-col items-center justify-center space-y-4 max-w-3xl mx-auto">
              {/* Dark text to stand out on the light metallic background */}
              <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 sm:text-4xl md:text-5xl">
                Ready to Accelerate Your Career?
              </h2>
              <p className="mx-auto max-w-[600px] text-zinc-600 md:text-xl">
                Join thousands of professionals who are advancing their careers
                with AI-powered guidance.
              </p>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-11 mt-5 animate-bounce relative overflow-hidden group"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-[length:200%_100%] animate-shimmer"
                  />
                  <span className="relative z-10 flex items-center justify-center text-white">
                    Start Your Journey Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
