import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser ? "bg-primary/10" : "bg-slate-200"
        }`}
      >
        <span
          className={`material-symbols-outlined text-sm ${
            isUser ? "text-primary" : "text-slate-500"
          }`}
        >
          {isUser ? "person" : "smart_toy"}
        </span>
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-white rounded-2xl rounded-tr-none"
            : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
        }`}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return !match ? (
                  <code
                    className={`${isUser ? "bg-primary-dark/20 text-white" : "bg-slate-200 text-slate-900"} px-1 py-0.5 rounded font-mono text-xs`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className={`${isUser ? "bg-primary-dark/30 text-white" : "bg-slate-800 text-slate-100"} p-3 rounded-lg overflow-x-auto my-2 font-mono text-xs`}
                  >
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc ml-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ul className="list-decimal ml-4 mb-2">{children}</ul>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-bold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

