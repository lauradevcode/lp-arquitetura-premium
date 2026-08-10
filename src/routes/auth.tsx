import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso ao painel | Marina Bittencourt Arquitetura" },
      { name: "description", content: "Área restrita de gestão do site do escritório." },
      { property: "og:title", content: "Acesso ao painel" },
      { property: "og:description", content: "Área restrita de gestão do site do escritório." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");
    setPending(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Confirme o e-mail enviado para concluir o cadastro.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-terracotta";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Área restrita</p>
        <h1 className="display-md mt-4">Painel do estúdio</h1>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <label className="block">
            <span className="eyebrow">E-mail</span>
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block">
            <span className="eyebrow">Senha</span>
            <input name="password" type="password" required minLength={6} className={field} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-sm bg-foreground px-6 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-background disabled:opacity-50"
          >
            {pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar acesso"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 text-[0.72rem] uppercase tracking-[0.18em] text-terracotta"
        >
          {mode === "login" ? "Criar um acesso" : "Já tenho acesso"}
        </button>
      </div>
    </main>
  );
}
