"use client";

import { useEffect } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import { usePortfolioNav } from "@/lib/portfolioNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { id?: string; screenName?: string };

export default function AboutMe({ id }: Props) {
  const { goTo } = usePortfolioNav();

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
        "screen-container fade-in flex flex-col items-center bg-transparent px-4 py-8 opacity-0",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="w-full max-w-4xl">
        <ScreenHeading title="About Me" subHeading="Why choose me?" />
        <div className="flex flex-col overflow-hidden border-4 border-foreground bg-card shadow-neo-lg md:flex-row">
          <div
            className="h-44 shrink-0 border-b-4 border-foreground bg-muted bg-cover bg-center md:hidden"
            style={{
              backgroundImage: "url(/assets/AboutMe/me.jpg)",
            }}
            aria-hidden
          />
          <div
            className="hidden min-h-[280px] border-b-4 border-foreground bg-muted bg-cover bg-center md:block md:w-1/2 md:border-b-0 md:border-r-4"
            style={{
              backgroundImage: "url(/assets/AboutMe/me.jpg)",
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-6 p-5 text-sm leading-relaxed text-foreground sm:p-6 md:w-1/2 md:p-8 md:text-base">
            <p>
              I am a full-stack developer with experience building web
              applications end to end—from responsive interfaces to reliable APIs
              and data pipelines. I enjoy turning complex requirements into clear,
              maintainable solutions and collaborating closely with teams to ship
              on time.
            </p>
            <div>
              <p className="mb-3 font-bold uppercase tracking-wide text-foreground">
                Here are a few highlights
              </p>
              <ul className="space-y-3">
                {[
                  "Full-stack web development with React and modern tooling",
                  "Backend services, APIs, and data engineering with Spark and Hadoop",
                  "Strong focus on performance, accessibility, and clean code",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-1.5 h-3 w-3 shrink-0 border-2 border-foreground bg-primary shadow-neo-sm" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="min-w-[160px] rounded-none"
                onClick={() => goTo("ContactMe")}
              >
                Hire Me
              </Button>
              <Button
                type="button"
                variant="accent"
                className="min-w-[160px] rounded-none"
                onClick={() => goTo("Resume")}
              >
                View Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
