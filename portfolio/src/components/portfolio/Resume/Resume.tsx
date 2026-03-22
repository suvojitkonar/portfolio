"use client";

import { useEffect } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import { experience, education, skills } from "./resumeData";
import { cn } from "@/lib/utils";

type Props = { id?: string; screenName?: string };

export default function Resume({ id }: Props) {
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
        "screen-container fade-in bg-transparent px-4 py-8 opacity-0",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <ScreenHeading title="Resume" subHeading="My bio & work" />
        <div className="space-y-12">
          <div>
            <h3 className="mb-6 inline-block border-4 border-foreground bg-primary px-4 py-2 text-lg font-bold uppercase shadow-neo">
              Experience
            </h3>
            <div className="mt-4 space-y-8 border-l-4 border-foreground pl-6">
              {experience.map((job, i) => (
                <article key={i} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 border-2 border-foreground bg-accent shadow-neo-sm" />
                  <h4 className="break-words text-balance font-bold text-foreground">
                    {job.title} — {job.company}
                  </h4>
                  <p className="text-sm text-muted">{job.period}</p>
                  <p className="mt-2 text-sm leading-relaxed">{job.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-6 inline-block border-4 border-foreground bg-card px-4 py-2 text-lg font-bold uppercase shadow-neo">
              Education
            </h3>
            <div className="mt-4 space-y-6 border-l-4 border-foreground pl-6">
              {education.map((edu, i) => (
                <article key={i} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 border-2 border-foreground bg-primary shadow-neo-sm" />
                  <h4 className="break-words text-balance font-bold">{edu.degree}</h4>
                  <p className="text-sm text-muted">
                    {edu.school} · {edu.period}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-6 inline-block border-4 border-foreground bg-accent px-4 py-2 text-lg font-bold uppercase text-white shadow-neo">
              Skills
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className="border-2 border-foreground bg-card px-4 py-2 text-sm font-semibold shadow-neo-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
