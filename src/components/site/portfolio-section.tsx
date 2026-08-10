import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/site.functions";

type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string | null;
  year: string | null;
  summary: string | null;
  cover_url: string | null;
};

export function PortfolioSection({
  content,
  projects,
}: {
  content: SiteContent;
  projects: PortfolioProject[];
}) {
  return (
    <section id="projetos" className="bg-secondary/40 py-28 lg:py-40">
      <div className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Portfólio</p>
          <h2 className="display-lg mt-6">{content["portfolio_title"]}</h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {content["portfolio_subtitle"]}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-x-10 gap-y-20 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal
              key={project.id}
              delay={(index % 2) * 120}
              className={cn(
                index % 4 === 0 && "md:col-span-2",
                index % 4 === 3 && "md:mt-[-6rem]",
              )}
            >
              <Link to="/projeto/$slug" params={{ slug: project.slug }} className="group block">
                <div className="overflow-hidden bg-muted">
                  <img
                    src={project.cover_url ?? "/images/hero.jpg"}
                    alt={project.title}
                    loading="lazy"
                    className={cn(
                      "w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                      index % 4 === 0 ? "aspect-[16/9]" : "aspect-[4/3]",
                    )}
                  />
                </div>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow">
                      {project.category}
                      {project.location ? ` · ${project.location}` : ""}
                      {project.year ? ` · ${project.year}` : ""}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl lg:text-3xl">{project.title}</h3>
                    {project.summary ? (
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {project.summary}
                      </p>
                    ) : null}
                  </div>
                  <ArrowUpRight className="mt-2 size-5 shrink-0 text-terracotta transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
