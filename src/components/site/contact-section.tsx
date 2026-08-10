import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/site/reveal";
import { submitLead, type SiteContent } from "@/lib/site.functions";

const projectTypes = ["Residencial", "Comercial", "Consultoria pontual", "Ainda não sei"];
const budgets = [
  "Até R$ 50 mil",
  "R$ 50 a 150 mil",
  "R$ 150 a 400 mil",
  "Acima de R$ 400 mil",
  "Prefiro conversar",
];

export function ContactSection({ content }: { content: SiteContent }) {
  const send = useServerFn(submitLead);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    try {
      await send({
        data: {
          name: String(values.get("name") ?? ""),
          email: String(values.get("email") ?? ""),
          phone: String(values.get("phone") ?? ""),
          project_type: String(values.get("project_type") ?? ""),
          budget: String(values.get("budget") ?? ""),
          message: String(values.get("message") ?? ""),
        },
      });
      form.reset();
      setDone(true);
      toast.success("Recebemos seu contato. Respondemos em até um dia útil.");
    } catch {
      toast.error("Não conseguimos enviar agora. Confira nome e telefone e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-terracotta";

  return (
    <section id="contato" className="mx-auto max-w-[86rem] px-6 py-28 lg:px-10 lg:py-40">
      <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow">Contato</p>
          <h2 className="display-lg mt-6">{content["contact_title"]}</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {content["contact_text"]}
          </p>

          <div className="mt-12 space-y-4 text-sm text-muted-foreground">
            {content["contact_email"] ? <p>{content["contact_email"]}</p> : null}
            {content["contact_location"] ? <p>{content["contact_location"]}</p> : null}
            {content["whatsapp_number"] ? (
              <a
                href={`https://wa.me/${content["whatsapp_number"]}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block border-b border-terracotta pb-0.5 text-foreground"
              >
                Chamar no WhatsApp
              </a>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={120}>
          {done ? (
            <div className="border border-border bg-secondary/50 p-10">
              <p className="font-serif text-2xl">Obrigado pelo contato.</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Vamos analisar suas informações e retornar com os próximos passos. Se preferir
                adiantar, fale com a assistente do estúdio no canto da tela.
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-8 text-[0.72rem] uppercase tracking-[0.18em] text-terracotta"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="eyebrow">Nome*</span>
                <input name="name" required maxLength={120} className={fieldClass} />
              </label>
              <label className="block">
                <span className="eyebrow">WhatsApp*</span>
                <input name="phone" required maxLength={40} className={fieldClass} />
              </label>
              <label className="block">
                <span className="eyebrow">E-mail</span>
                <input name="email" type="email" maxLength={200} className={fieldClass} />
              </label>
              <label className="block">
                <span className="eyebrow">Tipo de projeto</span>
                <select name="project_type" defaultValue="" className={fieldClass}>
                  <option value="">Selecione</option>
                  {projectTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="eyebrow">Investimento previsto</span>
                <select name="budget" defaultValue="" className={fieldClass}>
                  <option value="">Selecione</option>
                  {budgets.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="eyebrow">Conte sobre o espaço</span>
                <textarea name="message" rows={4} maxLength={2000} className={fieldClass} />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-sm bg-foreground px-8 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? "Enviando..." : "Enviar mensagem"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
