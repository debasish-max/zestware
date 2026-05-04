import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";

const slides = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000); // Slower, more elegant transitions
    return () => clearInterval(id);
  }, []);

  const scrollToProducts = () => {
    const section = document.querySelector("#collection");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-gray-100 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-gray-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10 py-12 md:py-24">
        {/* Text Content */}
        <div className="space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9]">
              Premium <br />
              <span className="text-brand">ZESTWARE</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Elevate your style with our premium collection of streetwear and essentials.
              Designed for those who demand quality and comfort.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button
              onClick={scrollToProducts}
              className="group bg-brand text-white px-8 py-4 rounded-2xl text-lg font-black flex items-center gap-2 hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-brand/20 active:scale-95"
            >
              Shop Collection
              <ShoppingBag className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-gray-600 font-bold hover:text-brand transition-colors px-6 py-4"
            >
              Explore Collection
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Image Slider */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gray-100 rounded-[3rem] blur-2xl group-hover:bg-gray-200 transition-colors duration-500" />
          <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[2.5rem] shadow-2xl">
            {slides.map((slide, index) => (
              <div
                key={slide}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
                  }`}
                style={{ transitionProperty: "opacity, transform" }}
              >
                <img
                  src={slide}
                  alt={`Streetwear item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

