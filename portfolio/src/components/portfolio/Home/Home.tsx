"use client";

import { useEffect } from "react";
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
        "fade-in relative flex min-h-[min(560px,90dvh)] flex-1 flex-col justify-between bg-background opacity-0 sm:min-h-[560px]",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="relative flex flex-1 flex-col justify-between">
        <Profile />
      </div>
    </section>
  );
}
