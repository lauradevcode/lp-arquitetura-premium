import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const links = [
  { label: "Sobre", href: "/#sobre" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Processo", href: "/#processo" },
  { label: "Depoimentos", href: "/#depoimentos" },
  { label: "Contato", href: "/#contato" },
];

export function SiteNav({
  officeName,
  logoUrl,
  whatsapp,
  solid = false,
}: {
  officeName: string;
  logoUrl?: string;
  whatsapp?: string;
  solid?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filled = solid || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        filled
          ? "border-b border-border/60 bg-background/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[86rem] items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={officeName} className="h-8 w-auto" />
          ) : (
            <span
              className={cn(
                "font-serif text-lg tracking-tight transition-colors",
                filled ? "text-foreground" : "text-background",
              )}
            >
              {officeName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-[0.78rem] uppercase tracking-[0.16em] transition-colors",
                filled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-background/75 hover:text-background",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "hidden rounded-sm border px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.18em] transition-colors sm:block",
              filled
                ? "border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
                : "border-background/40 text-background hover:bg-background hover:text-foreground",
            )}
          >
            Agendar conversa
          </a>
        ) : null}
      </div>
    </header>
  );
}
