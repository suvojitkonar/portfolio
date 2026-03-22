import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-4 w-full shrink-0 border-t-2 border-foreground py-6">
      <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted">
        <span>Made with love and</span>
        <Link
          href="https://cursor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
        >
          Cursor
        </Link>
        <img
          src="/assets/heart-red.svg"
          alt=""
          width={20}
          height={20}
          className="inline-block h-5 w-5 shrink-0"
        />
      </p>
    </footer>
  );
}
