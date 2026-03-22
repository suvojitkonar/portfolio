"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  markdown: string;
};

export default function BlogMarkdown({ markdown }: Props) {
  return (
    <div className="blog-markdown mt-10 min-w-0 text-sm leading-relaxed text-foreground md:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 border-b-2 border-foreground pb-2 font-mono text-xl font-bold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 font-mono text-lg font-bold">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-inside list-disc space-y-2 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-inside list-decimal space-y-2 pl-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-semibold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
              rel="noopener noreferrer"
              target={href?.startsWith("http") ? "_blank" : undefined}
            >
              {children}
            </a>
          ),
          code: (props) => {
            const { className, children, ...rest } = props;
            const inline = Boolean(
              (rest as { inline?: boolean }).inline
            );
            if (inline) {
              return (
                <code
                  className="border border-foreground bg-background px-1.5 py-0.5 font-mono text-xs"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block max-w-full min-w-0 overflow-x-auto break-words border-2 border-foreground bg-background p-3 font-mono text-xs shadow-neo-sm sm:p-4 ${className ?? ""}`}
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-4 max-w-full min-w-0 overflow-x-auto rounded-none">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-4 w-full min-w-0 overflow-x-auto">
              <table className="w-max min-w-full border-collapse border-2 border-foreground text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b-2 border-foreground bg-muted/40">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-foreground px-3 py-2 font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-foreground px-3 py-2 align-top">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-primary pl-4 italic text-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-t-4 border-foreground" />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
