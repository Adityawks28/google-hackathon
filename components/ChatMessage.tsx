import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isCorrect?: boolean | null;
}

export function ChatMessage({ role, content, isCorrect }: ChatMessageProps) {
  const isUser = role === "user";
  const isAssessment = isCorrect !== undefined && isCorrect !== null;

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
          {isUser ? "person" : isAssessment ? "verified" : "smart_toy"}
        </span>
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-white rounded-2xl rounded-tr-none"
            : isAssessment
              ? "bg-white border-2 border-slate-200 shadow-sm text-slate-800 rounded-2xl rounded-tl-none"
              : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
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
        <div className="prose prose-sm max-w-none">
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
                <ol className="list-decimal ml-4 mb-2">{children}</ol>
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
