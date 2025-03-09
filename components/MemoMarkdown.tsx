import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const Markdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            className="text-blue-500 hover:text-blue-700 underline decoration-2 decoration-blue-400/30 hover:decoration-blue-400 transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const MemoizedMarkdown = memo(Markdown);
