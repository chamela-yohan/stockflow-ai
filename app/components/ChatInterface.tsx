"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      console.log(data);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.content || "⚠️ Something went wrong.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Failed to connect. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white border border-amber-500 rounded-2xl shadow-2xl flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-amber-700 p-4 text-white font-bold flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-white" />
              <span className="text-white">StockFlow AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Empty state + suggestions */}
            {messages.length === 0 && (
              <div className="text-center mt-6 space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  How can I help with inventory today?
                </p>

                <div className="flex flex-col gap-2">
                  {[
                    "Check milk stock",
                    "What items are low?",
                    "Check coffe and bread",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat bubbles */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-amber-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-black rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    // Plain text for user messages — no markdown needed
                    m.content
                  ) : (
                    // Render markdown only for AI messages
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <span className="font-semibold">{children}</span>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 mt-1 space-y-0.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-snug">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 text-amber-700 px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 px-2 py-2 bg-white border rounded-xl shadow-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
            <div className="relative">
              <input
                className="w-full p-3 pr-10 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stock levels..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 hover:text-black transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 bg-amber-600 text-white"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
