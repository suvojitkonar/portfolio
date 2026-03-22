import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subHeading?: string;
  className?: string;
};

export default function ScreenHeading({ title, subHeading, className }: Props) {
  return (
    <div className={cn("mb-10 flex w-full flex-col items-center", className)}>
      <h2 className="border-b-4 border-foreground bg-card px-4 py-2 text-center text-3xl font-extrabold uppercase tracking-tight text-foreground shadow-neo">
        {title}
      </h2>
      {subHeading ? (
        <p className="mt-4 max-w-md text-center text-sm font-medium uppercase tracking-[0.2em] text-muted">
          {subHeading}
        </p>
      ) : null}
      <div className="mt-6 flex w-40 items-center justify-center">
        <span className="h-1 flex-1 bg-foreground" />
        <span className="mx-2 h-4 w-4 rotate-45 border-2 border-foreground bg-primary" />
        <span className="h-1 flex-1 bg-foreground" />
      </div>
    </div>
  );
}
