"use client";

import { Button } from "@/components/ui/button";
import { usePortfolioNav } from "@/lib/portfolioNav";

export default function Profile() {
  const { goTo } = usePortfolioNav();
  return (
    <div className="flex flex-col items-center justify-center px-4 pb-8 pt-12 text-foreground">
      <div className="flex w-full max-w-5xl flex-col-reverse items-center gap-10 md:flex-row md:justify-between md:gap-4">
        <div className="max-w-xl flex-1 text-center md:text-left">
          <div className="mb-4 flex justify-center gap-4 text-2xl text-foreground md:justify-start">
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              className="transition-transform hover:scale-125"
              aria-label="Email"
            >
              <i className="fa fa-google-plus-square" />
            </a>
            <a
              href="https://www.instagram.com/suvojitkonar/"
              className="transition-transform hover:scale-125"
              aria-label="Instagram"
            >
              <i className="fa fa-instagram" />
            </a>
            <a
              href="https://www.linkedin.com/in/suvojit-konar-5168a6161/"
              className="transition-transform hover:scale-125"
            >
              <i className="fa fa-linkedin" aria-label="LinkedIn" />
            </a>
          </div>
          <p className="text-xl font-semibold md:text-2xl">
            Hello, I&apos;m{" "}
            <span className="text-primary underline decoration-4 underline-offset-4">
              Suvojit
            </span>
          </p>
          <div className="mt-4">
            <h1 className="break-words text-balance font-mono text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              Platform developer & senior software engineer
            </h1>
            <p className="mt-3 text-base font-light text-muted md:text-lg">
              Knack of building developer platforms with frontend and backend
              operations.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <Button
              type="button"
              variant="outline"
              className="min-w-[160px] rounded-none px-6 py-3"
              onClick={() => goTo("ContactMe")}
            >
              Hire me
            </Button>
            <a href="/Resume_BigData_Java.pdf" download="Suvojit_Resume.pdf">
              <Button
                type="button"
                variant="accent"
                className="min-w-[160px] rounded-none px-6 py-3"
              >
                Get Resume
              </Button>
            </a>
          </div>
        </div>
        <div className="relative h-[275px] w-[275px] shrink-0 border-4 border-foreground bg-card shadow-neo-lg md:h-[380px] md:w-[380px]">
          <div className="relative h-full w-full overflow-hidden border-2 border-foreground bg-muted">
            {/* Add your photo to public/assets/Home/IMG_20181216_235843_046.jpg */}
            <img
              src="/assets/Home/IMG_20181216_235843_046.jpg"
              alt="Suvojit"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
