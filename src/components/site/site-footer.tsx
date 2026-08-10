import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

import type { SiteContent } from "@/lib/site.functions";

export function SiteFooter({ content }: { content: SiteContent }) {
  const officeName = content["office_name"] ?? "Escritório";

  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto grid max-w-[86rem] gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-serif text-3xl tracking-tight">{officeName}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/65">
            Arquitetura e interiores com design inteligente aplicado ao bem-estar de quem vive o
            espaço.
          </p>
          <p className="mt-6 text-[0.72rem] uppercase tracking-[0.2em] text-background/50">
            {content["about_cau"]}
          </p>
        </div>

        <div className="space-y-3 text-sm text-background/70">
          <p className="eyebrow text-background/40">Contato</p>
          {content["contact_email"] ? (
            <a
              href={`mailto:${content["contact_email"]}`}
              className="flex items-center gap-2 hover:text-background"
            >
              <Mail className="size-4" /> {content["contact_email"]}
            </a>
          ) : null}
          {content["contact_location"] ? (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {content["contact_location"]}
            </p>
          ) : null}
          {content["whatsapp_number"] ? (
            <a
              href={`https://wa.me/${content["whatsapp_number"]}`}
              target="_blank"
              rel="noreferrer"
              className="block hover:text-background"
            >
              WhatsApp
            </a>
          ) : null}
        </div>

        <div className="space-y-3 text-sm text-background/70">
          <p className="eyebrow text-background/40">Redes</p>
          {content["instagram_url"] ? (
            <a
              href={content["instagram_url"]}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-background"
            >
              <Instagram className="size-4" /> Instagram
            </a>
          ) : null}
          {content["pinterest_url"] ? (
            <a
              href={content["pinterest_url"]}
              target="_blank"
              rel="noreferrer"
              className="block hover:text-background"
            >
              Pinterest
            </a>
          ) : null}
          {content["linkedin_url"] ? (
            <a
              href={content["linkedin_url"]}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-background"
            >
              <Linkedin className="size-4" /> LinkedIn
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-background/10 px-6 py-6 text-center text-[0.7rem] uppercase tracking-[0.2em] text-background/40 lg:px-10">
        © {new Date().getFullYear()} {officeName}
      </div>
    </footer>
  );
}
