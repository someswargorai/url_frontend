"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export function FloatingChatbot() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading || status !== "authenticated") return;

    const userMsgText = inputValue;
    const userMessage: Message = { role: "user", parts: [{ text: userMsgText }] };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/url/ai-chat`,
        { messages: [...messages, userMessage] },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      const aiMessage: Message = { role: "model", parts: [{ text: response.data.reply }] };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      }
      setMessages((prev) => [...prev, {
        role: "model",
        parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again." }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <>
      {/* floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-13 w-13 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background: "#0d0d12",
            border: "1px solid rgba(0,229,160,0.3)",
            boxShadow: "0 0 20px rgba(0,229,160,0.12)",
            width: 52,
            height: 52,
          }}
        >
          {/* pulse ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(0,229,160,0.08)", animationDuration: "2.5s" }}
          />
          <Sparkles
            className="absolute top-2.5 right-2.5 h-2.5 w-2.5 animate-pulse"
            style={{ color: "#00e5a0", opacity: 0.7 }}
            strokeWidth={1.5}
          />
          <MessageSquareText
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[-10deg]"
            style={{ color: "#00e5a0" }}
            strokeWidth={1.5}
          />
        </button>
      </motion.div>

      {/* chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width: "min(380px, calc(100vw - 48px))",
              height: "min(560px, calc(100vh - 48px))",
              background: "#0d0d12",
              border: "1px solid #1e1e2e",
              borderRadius: 16,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px #1e1e2e",
            }}
          >
            {/* top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #00e5a0, transparent)" }}
            />

            {/* header */}
            <div
              className="flex-none flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "#13131a", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)" }}
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "#00e5a0" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight">
                    ShortyAI <span style={{ color: "#00e5a0" }}>Assistant</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ background: "#00e5a0" }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-1.5 w-1.5"
                        style={{ background: "#00e5a0" }}
                      />
                    </span>
                    <p
                      className="font-mono text-[9px] tracking-widest uppercase"
                      style={{ color: "#00e5a0" }}
                    >
                      Online
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#6b6b85" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e2e")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)" }}
                  >
                    <MessageSquareText
                      className="h-5 w-5"
                      style={{ color: "#00e5a0", opacity: 0.6 }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#6b6b85" }}>
                    Ask me anything about your
                    <br />
                    links, traffic, and campaigns!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] rounded-xl p-3 text-[13px] leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "rgba(0,229,160,0.1)",
                              border: "1px solid rgba(0,229,160,0.2)",
                              color: "#e0e0f0",
                              borderBottomRightRadius: 4,
                            }
                          : {
                              background: "#13131a",
                              border: "1px solid #1e1e2e",
                              color: "#a0a0b8",
                              borderBottomLeftRadius: 4,
                            }
                      }
                    >
                      <div
                        className="prose prose-sm max-w-none prose-p:my-0"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.parts[0].text) }}
                      />
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-xl p-3 flex items-center gap-1.5"
                    style={{ background: "#13131a", border: "1px solid #1e1e2e", borderBottomLeftRadius: 4 }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#00e5a0", opacity: 0.7, animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <div
              className="flex-none p-3 border-t"
              style={{ background: "#13131a", borderColor: "#1e1e2e" }}
            >
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center rounded-lg overflow-hidden"
                style={{ background: "#0d0d12", border: "1px solid #1e1e2e" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,160,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1e1e2e")}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your links..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/40 font-mono"
                  style={{ color: "#e0e0f0", fontSize: 13 }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="mr-2 p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "rgba(0,229,160,0.1)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.2)" }}
                >
                  {isLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Send className="h-3.5 w-3.5" />
                  }
                </button>
              </form>
              <p className="font-mono text-[9px] text-center mt-2" style={{ color: "#3a3a52" }}>
                AI can make mistakes. Check important stats.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}