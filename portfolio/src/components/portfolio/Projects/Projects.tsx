"use client";

import { useEffect } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import { projects } from "./projectsData";
import ProjectBoard from "./ProjectBoard";
import { cn } from "@/lib/utils";

type Props = { id?: string; screenName?: string };

export default function Projects({ id }: Props) {
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
        "screen-container fade-in flex flex-col items-center opacity-0",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="w-full max-w-6xl">
        <ScreenHeading title="Projects" subHeading="Things I've built" />
        <p className="mb-6 text-center text-xs text-muted">
          Drag cards between columns using the handle.
        </p>
        <ProjectBoard projects={projects} />
      </div>
    </section>
  );
}
