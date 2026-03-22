"use client";

import { useCallback, useState } from "react";
import Header from "@/components/portfolio/Home/Header";
import Blog from "@/components/portfolio/Blog/Blog";
import { TOTAL_SCREENS } from "@/lib/commonUtilities";
import type { BlogPostMeta } from "@/lib/blog";
import { PortfolioNavProvider } from "@/lib/portfolioNav";
import { cn } from "@/lib/utils";

type Props = {
  blogPostsMeta: BlogPostMeta[];
};

export default function PortfolioContainer({ blogPostsMeta }: Props) {
  const [activeScreen, setActiveScreen] = useState("Home");
  const goTo = useCallback((screenId: string) => {
    setActiveScreen(screenId);
  }, []);

  const active = TOTAL_SCREENS.find((s) => s.screen_name === activeScreen);
  const ActiveComponent = active?.component;

  return (
    <PortfolioNavProvider goTo={goTo}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header activeScreen={activeScreen} onNavigate={goTo} />
        <main
          role="main"
          className="flex flex-1 flex-col px-4 py-6 md:px-8"
        >
          <div
            className={cn(
              "mx-auto flex min-h-[min(70vh,720px)] w-full max-w-6xl flex-1 flex-col border-4 border-foreground bg-card shadow-neo-lg",
              activeScreen === "Home" ? "overflow-hidden p-0" : "p-6 md:p-10"
            )}
          >
            {active?.screen_name === "Blog" ? (
              <Blog
                key={activeScreen}
                id={active.screen_name}
                screenName={active.screen_name}
                posts={blogPostsMeta}
              />
            ) : ActiveComponent && active ? (
              <ActiveComponent
                key={activeScreen}
                id={active.screen_name}
                screenName={active.screen_name}
              />
            ) : null}
          </div>
        </main>
      </div>
    </PortfolioNavProvider>
  );
}
