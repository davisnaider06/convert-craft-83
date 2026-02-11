import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => Promise<void>;
      destroy?: () => void;
    };
  }
}

export function UnicornBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  // Scroll-based parallax
  const { scrollY } = useScroll();
  
  // Smooth spring animation for parallax
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms
  const backgroundY = useTransform(smoothScrollY, [0, 1000], [0, 150]);
  const overlayOpacity = useTransform(smoothScrollY, [0, 500], [0.3, 0.6]);
  const scale = useTransform(smoothScrollY, [0, 1000], [1, 1.1]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Load Unicorn Studio script
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: async () => {} };
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js";
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
            .then(() => {
              console.log("Unicorn Studio Initialized");
              window.UnicornStudio!.isInitialized = true;
            })
            .catch((err) => {
              console.error("Failed to initialize Unicorn Studio:", err);
            });
        }
      };
      document.head.appendChild(script);
    } else if (!window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init()
        .then(() => {
          console.log("Unicorn Studio Initialized");
          window.UnicornStudio!.isInitialized = true;
        })
        .catch((err) => {
          console.error("Failed to initialize Unicorn Studio:", err);
        });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden">
      {/* Unicorn Studio Effect with parallax */}
      <motion.div
        id="unicorn-bg"
        data-us-project="bmaMERjX2VZDtPrh4Zwx"
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundColor: isDark ? "#0a0a0f" : "#f8fafc",
          y: backgroundY,
          scale,
          transition: "background-color 0.5s ease",
        }}
      />
      
      {/* Floating parallax orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{
          background: isDark 
            ? "radial-gradient(circle, hsl(166 86% 56% / 0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, hsl(166 86% 56% / 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          y: useTransform(smoothScrollY, [0, 1000], [0, -100]),
          transition: "background 0.5s ease",
        }}
      />

      <motion.div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, hsl(166 86% 56% / 0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, hsl(166 86% 56% / 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          y: useTransform(smoothScrollY, [0, 1000], [0, 80]),
          transition: "background 0.5s ease",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, hsl(166 86% 56% / 0.04) 0%, transparent 60%)"
            : "radial-gradient(circle, hsl(166 86% 56% / 0.08) 0%, transparent 60%)",
          filter: "blur(50px)",
          y: useTransform(smoothScrollY, [0, 1000], [0, -60]),
          x: useTransform(smoothScrollY, [0, 1000], [0, 30]),
          transition: "background 0.5s ease",
        }}
      />
      
      {/* Theme overlay with smooth transition */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: isDark 
            ? "radial-gradient(ellipse at center, transparent 0%, hsl(220 30% 5% / 0.7) 100%)"
            : "radial-gradient(ellipse at center, transparent 0%, hsl(0 0% 100% / 0.8) 100%)",
          opacity: overlayOpacity,
          transition: "background 0.5s ease",
        }}
      />
      
      {/* Vignette effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 30%, hsl(220 30% 5% / 0.5) 100%)"
            : "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 100% / 0.6) 100%)",
          transition: "background 0.5s ease",
        }}
      />

    </div>
  );
}
