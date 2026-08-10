import type { SiteContent } from "@/lib/site.functions";

export function HeroSection({ content }: { content: SiteContent }) {
  const image = content["hero_image_url"] || "/images/hero.jpg";

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <img
        src={image}
        alt="Projeto de destaque do escritório"
        width={1920}
        height={1200}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/80" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[86rem] flex-col justify-end px-6 pb-16 pt-32 lg:px-10 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-background/60">{content["hero_eyebrow"]}</p>
            <h1 className="display-xl mt-6 max-w-3xl text-background">
              {content["hero_title"]}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-background/75">
              {content["hero_subtitle"]}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#projetos"
                className="rounded-sm bg-background px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-sand"
              >
                Ver projetos
              </a>
              <a
                href="#contato"
                className="rounded-sm border border-background/40 px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-background transition-colors hover:bg-background/10"
              >
                Falar com o estúdio
              </a>
            </div>
          </div>

          <div className="border-l border-background/25 pl-6 lg:pl-10">
            <p className="font-serif text-5xl text-background lg:text-6xl">
              {content["hero_stat_value"]}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-background/65">
              {content["hero_stat_label"]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
