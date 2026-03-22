"use client";

import { useCallback, useState } from "react";
import Header from "@/components/portfolio/Home/Header";
import Blog from "@/components/portfolio/Blog/Blog";
import Projects from "@/components/portfolio/Projects/Projects";
import SiteFooter from "@/components/portfolio/SiteFooter";
import { TOTAL_SCREENS } from "@/lib/commonUtilities";
import type { BlogPostMeta } from "@/lib/blog";
import type { Project } from "@/lib/project-model";
import { PortfolioNavProvider } from "@/lib/portfolioNav";
import { cn } from "@/lib/utils";

type Props = {
  blogPostsMeta: BlogPostMeta[];
  projects: Project[];
};

export default function PortfolioContainer({ blogPostsMeta, projects }: Props) {
  const [activeScreen, setActiveScreen] = useState("Home");
  const goTo = useCallback((screenId: string) => {
    setActiveScreen(screenId);
  }, []);

  const active = TOTAL_SCREENS.find((s) => s.screen_name === activeScreen);
  const ActiveComponent = active?.component;

  return (
    <PortfolioNavProvider goTo={goTo}>
      <div className="flex min-h-screen min-w-0 flex-col bg-background">
        <Header activeScreen={activeScreen} onNavigate={goTo} />
        <main
          role="main"
          className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6 md:px-8"
        >
          <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col">
            <div
              className={cn(
                "flex min-h-[min(70vh,720px)] w-full min-w-0 flex-1 flex-col border-4 border-foreground bg-card shadow-neo-lg",
                activeScreen === "Home" ? "overflow-hidden p-0" : "p-4 sm:p-6 md:p-10"
              )}
            >
              {active?.screen_name === "Blog" ? (
                <Blog
                  key={activeScreen}
                  id={active.screen_name}
                  screenName={active.screen_name}
                  posts={blogPostsMeta}
                />
              ) : active?.screen_name === "Projects" ? (
                <Projects
                  key={activeScreen}
                  id={active.screen_name}
                  screenName={active.screen_name}
                  projects={projects}
                />
              ) : ActiveComponent && active ? (
                <ActiveComponent
                  key={activeScreen}
                  id={active.screen_name}
                  screenName={active.screen_name}
                />
              ) : null}
            </div>
            <SiteFooter />
          </div>
        </main>
      </div>
    </PortfolioNavProvider>
  );
}
