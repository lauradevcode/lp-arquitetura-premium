import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "atelier-chat-conversation-id";

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Olá, seja bem-vindo. Sou a assistente do escritório e posso te ajudar a entender qual caminho faz mais sentido para o seu espaço. Você está pensando em um projeto residencial, comercial ou em uma consultoria?",
    },
  ],
};

export function ChatWidget({ officeName }: { officeName: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    setConversationId(id);
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId }),
      }),
    [conversationId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: conversationId ?? "pending",
    messages: [WELCOME],
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open && !busy) textareaRef.current?.focus();
  }, [open, busy, messages.length]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar assistente" : "Falar com a assistente"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-terracotta-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex w-[min(92vw,25rem)] flex-col overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-lift)] transition-all duration-500",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-border bg-sand/60 px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-terracotta font-serif text-sm text-terracotta-foreground">
            {officeName.slice(0, 1)}
          </span>
          <div>
            <p className="font-serif text-base leading-tight">Assistente do estúdio</p>
            <p className="text-[0.7rem] text-muted-foreground">
              Respostas imediatas · {officeName}
            </p>
          </div>
        </header>

        <Conversation className="h-[22rem] bg-background">
          <ConversationContent className="gap-5 p-5">
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={
                    message.role === "user"
                      ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                      : "text-foreground"
                  }
                >
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" ? (
              <Shimmer className="text-sm">Pensando com calma...</Shimmer>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive">
                Tivemos um instante de instabilidade. Pode tentar enviar novamente?
              </p>
            ) : null}
          </ConversationContent>
        </Conversation>

        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) handleSubmit(event);
              }}
              rows={2}
              placeholder="Conte um pouco sobre o seu espaço..."
              className="min-h-11 flex-1 resize-none rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              aria-label="Enviar mensagem"
              className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-terracotta text-terracotta-foreground transition-opacity disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
