import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isCorrect?: boolean | null;
  shouldAnimate?: boolean | null;
}

export function ChatMessage({
  role,
  content,
  isCorrect,
  shouldAnimate,
}: ChatMessageProps) {
  const isUser = role === "user";
  const isAssessment = isCorrect !== undefined && isCorrect !== null;

  return (
    <div
      className={`flex gap-5 mb-8 max-w-[90%] ${isUser ? "self-end flex-row-reverse" : "group"}`}
    >
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
          {isUser ? "person" : isAssessment ? "verified" : "auto_awesome"}
        </span>
      </div>
      <div
        className={`p-6 shadow-xl leading-relaxed text-[15px] ${
          isUser
            ? "bg-[#630000] text-white rounded-2xl rounded-tr-none border border-[#FFFCFB]/10 shadow-sm shadow-[#570000]/20"
            : `bg-[#FFFEFD] text-[#570000] rounded-2xl rounded-tl-none border border-[#570000]/10 shadow-sm shadow-[#570000]/20 relative ${shouldAnimate ? "after:absolute after:inset-0 after:rounded-inherit after:pointer-events-none after:content-[''] after:animate-hint-flash" : ""}`
        }`}
      >
        {isAssessment && (
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 mb-1">
              # Submission Assessment
            </h1>
            <p className="text-sm">
              The submission is{" "}
              <strong className={isCorrect ? "text-green-600" : "text-red-600"}>
                {isCorrect ? "correct" : "incorrect"}
              </strong>
            </p>
          </div>
        )}
        <div
          className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 pb-1 border-b border-slate-200">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-md font-bold mb-1 mt-3 first:mt-0">
                  {children}
                </h3>
              ),
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
                <ul
                  className={`list-disc ml-6 mb-4 ${isUser ? "marker:text-white/70" : "marker:text-[#570000]/70"}`}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-2">{children}</li>,
              strong: ({ children }) => (
                <strong
                  className={`font-bold ${isUser ? "text-white" : "text-[#570000]"}`}
                >
                  {children}
                </strong>
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
