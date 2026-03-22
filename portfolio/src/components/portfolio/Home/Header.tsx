"use client";

import { useState } from "react";
import { TOTAL_SCREENS, GET_SCREEN_INDEX } from "@/lib/commonUtilities";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

type Props = {
  activeScreen: string;
  onNavigate: (screenName: string) => void;
};

export default function Header({ activeScreen, onNavigate }: Props) {
  const [showHeaderOptions, setShowHeaderOptions] = useState(false);
  const selectedScreen = GET_SCREEN_INDEX(activeScreen);

  const switchScreen = (screenName: string) => {
    onNavigate(screenName);
    setShowHeaderOptions(false);
  };

  return (
    <header className="relative z-20 flex justify-center border-b-4 border-foreground bg-card/90 py-4 text-foreground shadow-neo backdrop-blur-sm sm:py-6">
      {showHeaderOptions ? (
        <button
          type="button"
          className="fixed inset-0 z-[1000] bg-foreground/25 md:hidden"
          aria-label="Close menu"
          onClick={() => setShowHeaderOptions(false)}
        />
      ) : null}
      <div className="relative z-[1002] flex w-[70%] max-w-5xl items-center justify-between max-md:w-full max-md:px-4 sm:max-md:px-6">
        <button
          type="button"
          className="hidden text-foreground max-md:block"
          onClick={() => setShowHeaderOptions(!showHeaderOptions)}
          aria-expanded={showHeaderOptions}
          aria-controls="portfolio-nav"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} className="text-3xl" />
        </button>
        <div className="border-4 border-foreground bg-primary px-4 py-3 text-base font-bold uppercase shadow-neo max-md:mb-0 sm:px-6 sm:py-4 sm:text-lg md:mb-6">
          Suvojit&apos;s
        </div>
        <nav
          id="portfolio-nav"
          className={cn(
            "flex items-center gap-8 font-semibold md:gap-12",
            "max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[1001] max-md:h-[100dvh] max-md:w-full max-md:flex-col max-md:items-stretch max-md:bg-background max-md:transition-transform max-md:duration-300 max-md:ease-out",
            showHeaderOptions ? "max-md:translate-x-0" : "max-md:-translate-x-full"
          )}
          role="tablist"
          aria-label="Portfolio sections"
        >
          <div className="flex shrink-0 justify-end border-b-4 border-foreground p-3 max-md:pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
            <button
              type="button"
              className="border-2 border-foreground bg-card p-2 text-foreground shadow-neo-sm"
              onClick={() => setShowHeaderOptions(false)}
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faXmark} className="text-2xl" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 max-md:px-4 max-md:pb-8 md:flex-row md:items-center md:gap-12 md:px-0 md:pb-0">
            {TOTAL_SCREENS.map((screen, i) => (
              <button
                key={screen.screen_name}
                type="button"
                role="tab"
                aria-selected={selectedScreen === i}
                className={cn(
                  "border-b-2 border-transparent px-2 text-center transition-colors hover:text-primary max-md:py-2 md:text-left",
                  selectedScreen === i &&
                    "border-foreground font-bold text-primary underline decoration-4 underline-offset-4"
                )}
                onClick={() => switchScreen(screen.screen_name)}
              >
                {screen.navLabel}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
