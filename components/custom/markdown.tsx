import Link from "next/link";
import React, { memo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from 'highlight.js';
// Import your favorite theme
// import 'highlight.js/styles/tokyo-night-dark.css'; // This is already a good dark theme
// Other great options:
import 'highlight.js/styles/github-dark.css';
// import 'highlight.js/styles/atom-one-dark.css';
// import 'highlight.js/styles/dracula.css';
// import 'highlight.js/styles/monokai-sublime.css';
// import 'highlight.js/styles/nord.css';

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  useEffect(() => {
    hljs.configure({
      ignoreUnescapedHTML: true,
    });
  }, []);

  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : '';
      if (!inline && match) {
        const codeString = String(children).replace(/\n$/, '');
        let highlightedCode;
        try {
          highlightedCode = hljs.highlight(codeString, { language }).value;
        } catch (error) {
          highlightedCode = hljs.highlightAuto(codeString).value;
        }
        return (
          <div className="relative my-6 group">
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-900 border-b-2 border-fuchsia-300 px-4 py-2 rounded-t-lg">
              <span className="text-zinc-400 text-xs font-mono tracking-widest">
                {language.toUpperCase()}
              </span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            {/* Code block */}
            <pre className="hljs !mt-0 !rounded-t-none !rounded-b-lg !border-t-0 border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <code
                className={`hljs language-${language} block p-4 text-sm leading-relaxed`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
                style={{
                  fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Monaco, Consolas, monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
              />
            </pre>
            {/* Copy button */}
            <button 
              className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-xs shadow-lg"
              onClick={() => navigator.clipboard.writeText(codeString)}
            >
              Copy
            </button>
          </div>
        );
      }
      // Inline code
      return (
        <code
          className="bg-zinc-800 text-zinc-300 text-sm px-1.5 py-0.5 rounded font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ node, children, ...props }: any) => (
      <Link
        className="text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-zinc-600 dark:text-zinc-300" {...props}>
        {children}
      </em>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside my-2 text-zinc-800 dark:text-zinc-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="ml-2" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-zinc-600 pl-4 italic text-zinc-300 bg-zinc-900/60 my-4 rounded"
        {...props}
      >
        {children}
      </blockquote>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-bold mt-6 mb-3 text-zinc-200" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-semibold mt-5 mb-2 text-zinc-200" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-medium mt-4 mb-2 text-zinc-200" {...props}>
        {children}
      </h3>
    ),
  };

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prev, next) => prev.children === next.children
);

// Installation command:
// npm install highlight.js @types/highlight.js