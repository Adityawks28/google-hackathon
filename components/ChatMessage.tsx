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
            ? "rounded-full bg-[#FFFBF9]-container-highest overflow-hidden border border-[#FFFCFB]/20 shadow-md" 
            : "rounded-xl bg-[#630000] text-[#FFFCFB] shadow-lg shadow-[#630000]/20"
        }`}
      >
        <span
          className={`material-symbols-outlined text-base ${
            isUser ? "text-[#630000]" : ""
          }`}
        >
          {isUser ? "person" : "auto_awesome"}
        </span>
      </div>
      <div
        className={`p-6 shadow-xl leading-relaxed text-[15px] ${
          isUser
            ? "bg-[#4C0000] text-white rounded-2xl rounded-tr-none border border-[#FFFCFB]/10 shadow-sm shadow-[#570000]/20"
            : "bg-[#FFFEFD] text-[#570000] rounded-2xl rounded-tl-none border border-[#570000]/10 shadow-sm shadow-[#570000]/20"
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
                    className={`${isUser ? "bg-white/10 text-white" : "bg-black/5 text-[#570000]"} px-1.5 py-0.5 rounded font-fira-code text-sm`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className={`${isUser ? "bg-white/20 text-white border-[#FFFCFB]/10" : "bg-black/5 text-[#570000] border-[#570000]/10"} p-4 rounded-lg overflow-x-auto my-3 font-fira-code text-sm border`}
                  >
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              ul: ({ children }) => (
                <ul className={`list-disc ml-6 mb-4 ${isUser ? "marker:text-white/70" : "marker:text-[#570000]/70"}`}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ul className="list-decimal ml-6 mb-4">{children}</ul>
              ),
              li: ({ children }) => <li className="mb-2">{children}</li>,
              strong: ({ children }) => (
                <strong className={`font-bold ${isUser ? "text-white" : "text-[#570000]"}`}>{children}</strong>
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
