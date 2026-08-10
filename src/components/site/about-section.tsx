import { Reveal } from "@/components/site/reveal";
import type { SiteContent } from "@/lib/site.functions";

export function AboutSection({ content }: { content: SiteContent }) {
  const image = content["about_image_url"] || "/images/arquiteta.jpg";

  return (
    <section id="sobre" className="mx-auto max-w-[86rem] px-6 py-28 lg:px-10 lg:py-40">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <Reveal className="lg:pt-12">
          <img
            src={image}
            alt="A arquiteta responsável pelo escritório"
            loading="lazy"
            width={1008}
            height={1312}
            className="w-full object-cover"
          />
        </Reveal>

        <Reveal delay={120} className="flex flex-col justify-center">
          <p className="eyebrow">Sobre o estúdio</p>
          <h2 className="display-lg mt-6 max-w-xl">{content["about_title"]}</h2>
          <p className="mt-8 max-w-2xl text-base leading-loose text-muted-foreground">
            {content["about_text"]}
          </p>

          <div className="mt-12 grid gap-8 border-t border-border pt-10 sm:grid-cols-3">
            <div>
              <p className="font-serif text-3xl">12</p>
              <p className="mt-2 text-sm text-muted-foreground">anos de estúdio</p>
            </div>
            <div>
              <p className="font-serif text-3xl">{content["hero_stat_value"]}</p>
              <p className="mt-2 text-sm text-muted-foreground">projetos entregues</p>
            </div>
            <div>
              <p className="font-serif text-3xl">100%</p>
              <p className="mt-2 text-sm text-muted-foreground">projetos personalizados</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="font-serif text-lg">{content["about_signature"]}</p>
            <p className="eyebrow mt-2">{content["about_cau"]}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
