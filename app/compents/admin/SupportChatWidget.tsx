"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "admin" | "customer";
  text: string;
  time: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", sender: "customer", text: "Hola, ¿tienen la chaqueta en talla M?", time: "10:32 AM" },
  { id: "m2", sender: "admin", text: "¡Hola! Sí, tenemos disponibilidad en talla M.", time: "10:34 AM" },
];

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState(MOCK_MESSAGES);
  const [draft, setDraft] = React.useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "admin",
        text: draft,
        time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 h-96 bg-white border border-border/60 rounded-card shadow-modal flex flex-col overflow-hidden animate-fadeIn">
          <div className="h-14 px-4 flex items-center justify-between bg-brand-dark text-white flex-shrink-0">
            <div>
              <p className="text-xs font-semibold">Soporte al cliente</p>
              <p className="text-[10px] text-white/70">🟢 En línea</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.sender === "admin" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-xs",
                    msg.sender === "admin"
                      ? "bg-brand-dark text-white rounded-br-sm"
                      : "bg-white border border-border/50 text-brand-dark rounded-bl-sm"
                  )}
                >
                  <p>{msg.text}</p>
                  <p className={cn(
                    "text-[9px] mt-1",
                    msg.sender === "admin" ? "text-white/60" : "text-brand-muted"
                  )}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border/30 flex-shrink-0">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 h-9 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
            <button
              type="submit"
              className="h-9 w-9 flex items-center justify-center rounded-button bg-brand-dark text-white hover:bg-brand-dark/90 transition-colors flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full bg-brand-dark text-white shadow-modal flex items-center justify-center hover:bg-brand-dark/90 transition-all hover:scale-105"
        aria-label="Abrir chat de soporte"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}