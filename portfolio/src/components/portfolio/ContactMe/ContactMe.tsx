"use client";

import { useEffect, useState } from "react";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "suvojitkonar11@gmail.com";

type Props = { id?: string; screenName?: string };

export default function ContactMe({ id }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      Animations.animations.fadeInScreen(id);
    });
    return () => cancelAnimationFrame(frame);
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    const subject = encodeURIComponent(
      `Portfolio contact from ${name || "visitor"}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id={id || ""}
      className={cn(
        "screen-container fade-in bg-transparent px-4 py-8 pb-12 opacity-0",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <ScreenHeading title="Contact Me" subHeading="Let's build something" />
        <div className="border-4 border-foreground bg-card p-4 shadow-neo-lg sm:p-8">
          <p className="mb-8 text-center text-sm leading-relaxed text-muted">
            Have a project in mind? Send a message below.
            {/* <code className="border border-foreground bg-background px-1 py-0.5 font-mono text-xs">
              CONTACT_EMAIL
            </code>{" "}
            in ContactMe.tsx (currently {CONTACT_EMAIL}). */}
          </p>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-semibold">
              Name
              <input
                className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 text-foreground shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Your email
              <input
                className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 text-foreground shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Message
              <textarea
                className="mt-2 min-h-[120px] w-full resize-y border-2 border-foreground bg-background px-3 py-2 text-foreground shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </label>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="accent"
              className="w-full rounded-none py-4 text-base"
            >
              Send via email
            </Button>
          </form>
          <div className="mt-10 flex flex-wrap justify-center gap-6 border-t-4 border-foreground pt-8 text-2xl sm:gap-8">
            <a
              href="https://www.linkedin.com/in/suvojit-konar-5168a6161/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-foreground transition-transform hover:scale-125"
            >
              <i className="fa fa-linkedin" />
            </a>
            <a
              href="https://www.instagram.com/suvojitkonar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-foreground transition-transform hover:scale-125"
            >
              <i className="fa fa-instagram" />
            </a>
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email"
              className="text-foreground transition-transform hover:scale-125"
            >
              <i className="fa fa-google" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
