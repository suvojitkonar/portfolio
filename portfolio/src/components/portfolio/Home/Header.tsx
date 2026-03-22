"use client";

import { useState } from "react";
import { TOTAL_SCREENS, GET_SCREEN_INDEX } from "@/lib/commonUtilities";
import { faBars } from "@fortawesome/free-solid-svg-icons";
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
    <header
      className="flex justify-center border-b-4 border-foreground bg-card/90 py-6 text-foreground shadow-neo backdrop-blur-sm"
      onClick={() => setShowHeaderOptions(!showHeaderOptions)}
    >
      <div className="relative flex w-[70%] max-w-5xl items-center justify-between max-md:w-full max-md:px-6">
        <button
          type="button"
          className="hidden text-foreground max-md:block"
          onClick={(e) => {
            e.stopPropagation();
            setShowHeaderOptions(!showHeaderOptions);
          }}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} className="text-3xl" />
        </button>
        <div className="mb-6 inline-block border-4 border-foreground bg-primary px-6 py-4 text-lg font-bold uppercase shadow-neo">
          Suvojit&apos;s
        </div>
        <nav
          className={cn(
            "flex items-center gap-12 font-semibold max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[1000] max-md:h-screen max-md:w-full max-md:flex-col max-md:justify-center max-md:bg-background max-md:transition-all",
            showHeaderOptions ? "max-md:translate-x-0" : "max-md:-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
          role="tablist"
          aria-label="Portfolio sections"
        >
          {TOTAL_SCREENS.map((screen, i) => (
            <button
              key={screen.screen_name}
              type="button"
              role="tab"
              aria-selected={selectedScreen === i}
              className={cn(
                "border-b-2 border-transparent text-left transition-colors hover:text-primary",
                selectedScreen === i &&
                  "border-foreground font-bold text-primary underline decoration-4 underline-offset-4"
              )}
              onClick={(e) => {
                e.stopPropagation();
                switchScreen(screen.screen_name);
              }}
            >
              {screen.navLabel}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
