import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedShowcase() {
  const containerRef = useRef(null);
  const marqueeRef = useRef(null);

  useGSAP(() => {
    // Marquee animation
    gsap.to(".marquee-content", {
      xPercent: -50,
      repeat: -1,
      duration: 20,
      ease: "none",
    });

    // Staggered text reveal
    gsap.from(".reveal-text span", {
      scrollTrigger: {
        trigger: ".reveal-text",
        start: "top 80%",
      },
      y: 100,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out",
    });

    // Subtitle fade
    gsap.from(".fade-in-text", {
      scrollTrigger: {
        trigger: ".fade-in-text",
        start: "top 90%",
      },
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  const marqueeText = "ZESTWEAR • PREMIUM APPAREL • STREETWEAR ESSENTIALS • MODERN LUXURY • ";

  return (
    <section ref={containerRef} className="py-32 bg-black overflow-hidden text-white">
      {/* Moving Marquee Section */}
      <div className="relative flex whitespace-nowrap border-y border-white/10 py-8 mb-24 overflow-hidden">
        <div className="marquee-content flex gap-8 text-[8vw] font-black uppercase tracking-tighter leading-none opacity-50">
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="fade-in-text text-sm font-black uppercase tracking-[0.5em] text-gray-500 mb-8">
          The New Standard
        </p>

        <h2 className="reveal-text text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
          {["STYLE", "BEYOND", "BOUNDARIES"].map((word, i) => (
            <span key={i} className="inline-block mr-4 md:mr-8 last:mr-0">
              {word}
            </span>
          ))}
        </h2>

        <div className="max-w-2xl mx-auto">
          <p className="fade-in-text text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
            We don't just make clothes. We curate experiences.
            Designed for the bold, the ambitious, and those who define their own path.
          </p>
        </div>
      </div>
    </section>
  );
}
