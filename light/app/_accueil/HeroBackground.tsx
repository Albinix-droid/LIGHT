// app/_accueil/HeroBackground.tsx
// Fond du hero : les photos défilent (fondu enchaîné et lent zoom), avec un léger effet de
// parallaxe au défilement de la page. Les visiteurs qui limitent les animations voient une photo fixe.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export const HERO_SLIDES = [
  { src: "/images/accueil/hero-1.jpg", caption: "Construire ensemble" },
  { src: "/images/accueil/hero-2.jpg", caption: "Apprendre entre pairs" },
  { src: "/images/accueil/hero-3.jpg", caption: "Présenter son projet" },
  { src: "/images/accueil/hero-4.jpg", caption: "Imaginer la suite" },
];

const DURATION = 7000;

export default function HeroBackground() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollY } = useScroll();
  // Les photos avancent moins vite que le contenu : impression de profondeur
  const y = useTransform(scrollY, [0, 900], [0, 260]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, DURATION);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <>
      <motion.div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden" style={reduceMotion ? undefined : { y }}>
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-[-6%] transition-opacity duration-[1600ms] ease-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === active && !reduceMotion ? "animate-[hero-zoom_7.5s_ease-out_forwards]" : ""}`}
            />
          </div>
        ))}
      </motion.div>

      {/* Voile bleu nuit : plus dense au centre, derrière le slogan, la photo respire sur les bords */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(11,19,36,0.55)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(11,19,36,0.6),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-[linear-gradient(180deg,transparent,rgba(11,19,36,0.85))]" />

      {/* Indicateurs */}
      <div className="absolute bottom-24 left-1/2 z-10 hidden w-full max-w-[1200px] -translate-x-1/2 px-5 sm:bottom-32 sm:px-8 md:block">
        <div className="flex items-center justify-center gap-5">
          <div className="flex gap-2" role="tablist" aria-label="Photos d'ambiance">
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={slide.caption}
                onClick={() => setActive(i)}
                className="relative h-1 w-10 overflow-hidden rounded-full bg-white/25 transition-colors hover:bg-white/40"
              >
                {i === active && (
                  <span
                    key={`${active}-progress`}
                    className={`absolute inset-y-0 left-0 rounded-full bg-white ${reduceMotion ? "w-full" : "animate-[hero-progress_7s_linear_forwards]"}`}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-[12.5px] font-medium tracking-wide text-white/70" aria-live="polite">{HERO_SLIDES[active].caption}</p>
        </div>
      </div>
    </>
  );
}
