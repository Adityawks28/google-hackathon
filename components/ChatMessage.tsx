import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-5 mb-8 max-w-[90%] ${isUser ? "self-end flex-row-reverse" : "group"}`}>
      <div
        className={`h-10 w-10 flex-shrink-0 flex items-center justify-center ${
          isUser 
            ? "rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 shadow-md" 
            : "rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20"
        }`}
      >
        <span
          className={`material-symbols-outlined text-base ${
            isUser ? "text-primary" : ""
          }`}
        >
          {isUser ? "person" : "auto_awesome"}
        </span>
      </div>
      <div
        className={`p-6 shadow-xl leading-relaxed text-[15px] ${
          isUser
            ? "message-gradient-user text-on-primary rounded-2xl rounded-tr-none"
            : "message-gradient-ai text-on-surface-variant rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-sm"
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return !match ? (
                  <code
                    className={`${isUser ? "bg-white/10 text-white" : "bg-primary/5 text-primary"} px-1.5 py-0.5 rounded font-mono text-sm`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className={`${isUser ? "bg-black/20 text-white" : "bg-surface-container-highest/50 text-on-surface"} p-4 rounded-lg overflow-x-auto my-3 font-mono text-sm border border-outline-variant/10`}
                  >
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc ml-6 mb-4 marker:text-primary">{children}</ul>
              ),
              ol: ({ children }) => (
                <ul className="list-decimal ml-6 mb-4">{children}</ul>
              ),
              li: ({ children }) => <li className="mb-2">{children}</li>,
              strong: ({ children }) => (
                <strong className={`font-bold ${isUser ? "text-white" : "text-primary"}`}>{children}</strong>
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
