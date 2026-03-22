"use client";

import { useEffect } from "react";
import Footer from "@/components/portfolio/Home/Footer";
import Profile from "@/components/portfolio/Home/Profile";
import Animations from "@/lib/animations";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  screenName?: string;
};

export default function Home({ id }: Props) {
  useEffect(() => {
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      Animations.animations.fadeInScreen(id);
    });
    return () => cancelAnimationFrame(frame);
  }, [id]);

  return (
    <section
      id={id || ""}
      className={cn(
        "fade-in relative flex min-h-[min(560px,90dvh)] flex-1 flex-col justify-between opacity-0 sm:min-h-[560px]",
        "bg-[linear-gradient(135deg,hsl(var(--primary)/0.35)_0%,hsl(var(--background))_45%,hsl(var(--accent)/0.2)_100%)] bg-cover bg-center",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/Home/bg.jpg')] bg-cover bg-center opacity-40 mix-blend-multiply" />
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <Profile />
        <Footer />
      </div>
    </section>
  );
}
