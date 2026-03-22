"use client";

import { useEffect } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import ProjectBoard from "./ProjectBoard";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/project-model";

type Props = { id?: string; screenName?: string; projects: Project[] };

export default function Projects({ id, projects }: Props) {
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
      <div className="w-full min-w-0 max-w-6xl">
        <ScreenHeading title="Projects" subHeading="Things I've built" />
        {/* <p className="mb-4 px-1 text-center text-[11px] text-muted sm:mb-6 sm:text-xs">
          Drag cards between columns using the handle when editing is enabled
          (blog admin + Redis in production).
        </p> */}
        <ProjectBoard projects={projects} />
      </div>
    </section>
  );
}
