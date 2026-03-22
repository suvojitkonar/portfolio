"use client";

import { useEffect } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import { cn } from "@/lib/utils";

const quotes = [
  {
    text: "Suvojit consistently delivered quality work and communicated clearly across the stack. A reliable partner on tight deadlines.",
    author: "Alex Morgan",
    role: "Engineering Lead",
  },
  {
    text: "Strong problem-solving skills and attention to detail. The features shipped smoothly and were easy to maintain.",
    author: "Priya Sharma",
    role: "Product Manager",
  },
  {
    text: "Great collaborator who bridges frontend polish with backend pragmatism. I would gladly work together again.",
    author: "Jordan Lee",
    role: "Senior Developer",
  },
];

type Props = { id?: string; screenName?: string };

export default function Testimonial({ id }: Props) {
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
      <div className="mx-auto max-w-5xl">
        <ScreenHeading title="Testimonials" subHeading="What people say" />
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <blockquote
              key={i}
              className="flex flex-col border-4 border-foreground bg-card p-6 shadow-neo"
            >
              <p className="flex-1 text-sm italic leading-relaxed text-foreground">
                <span className="text-3xl font-black text-primary">&ldquo;</span>
                {q.text}
              </p>
              <footer className="mt-6 border-t-4 border-foreground pt-4">
                <p className="font-bold">{q.author}</p>
                <p className="text-sm text-muted">{q.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
