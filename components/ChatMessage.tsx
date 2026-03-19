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
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
