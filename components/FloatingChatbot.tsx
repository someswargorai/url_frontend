"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

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

  // Auto-scroll to bottom of chat
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
    
    // Optimistic UI update
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/url/ai-chat`,
        { messages: [...messages, userMessage] },
        {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        }
      );

      const aiResponseText = response.data.reply;
      const aiMessage: Message = { role: "model", parts: [{ text: aiResponseText }] };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      const errorMessage: Message = { role: "model", parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again." }] };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <>
      {/* Floating Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="absolute top-3 right-3 h-3 w-3 text-white/80 animate-pulse" />
          <MessageSquareText className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-[-10deg]" />
        </button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] sm:w-[400px] h-[550px] max-h-[calc(100vh-48px)] flex flex-col rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    ShortyAI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <MessageSquareText className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-400">Ask me anything about your <br/> links, traffic, and campaigns!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm
                      ${msg.role === "user" 
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm" 
                        : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-sm"
                      }`}
                    >
                      <div 
                        className="prose prose-sm prose-invert max-w-none prose-p:my-0 prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.parts[0].text) }} 
                      />
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none p-3 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md">
              <form 
                onSubmit={handleSendMessage}
                className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-colors"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your links..."
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="mr-2 p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <p className="text-[10px] text-center text-zinc-500 mt-2 font-medium">AI can make mistakes. Check important stats.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
