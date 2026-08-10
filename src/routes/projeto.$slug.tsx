import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ChatWidget } from "@/components/chat/chat-widget";
import { Reveal } from "@/components/site/reveal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import {
  getProjectBySlug,
  type ProjectImageRow,
  type ProjectRow,
  type SiteContent,
} from "@/lib/site.functions";

type ProjectPageData = {
  project: ProjectRow;
  images: Pick<ProjectImageRow, "id" | "image_url" | "caption">[];
  others: Pick<ProjectRow, "id" | "slug" | "title" | "category" | "cover_url">[];
  content: SiteContent;
};

export const Route = createFileRoute("/projeto/$slug")({
  loader: async ({ params }) => {
    const data = await getProjectBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data as ProjectPageData;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.project.title ?? "Projeto";
    const description =
      loaderData?.project.summary ??
      "Projeto de arquitetura e interiores desenvolvido pelo estúdio.";
    return {
      meta: [
        { title: `${title} | Marina Bittencourt Arquitetura` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectPage,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-sm text-muted-foreground">Não conseguimos carregar este projeto.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-serif text-3xl">Projeto não encontrado</p>
      <Link to="/" className="eyebrow text-terracotta">
        Voltar ao início
      </Link>
    </div>
  ),
});

function ProjectPage() {
  const { project, images, others, content } = Route.useLoaderData() as ProjectPageData;
  const officeName = content["office_name"] ?? "Estúdio";

  return (
    <>
      <SiteNav
        officeName={officeName}
        logoUrl={content["logo_url"] || undefined}
        whatsapp={content["whatsapp_number"]}
        solid
      />

      <main className="pt-24">
        <section className="mx-auto max-w-[86rem] px-6 pt-12 lg:px-10 lg:pt-20">
          <Link to="/" className="eyebrow inline-flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="size-3.5" /> Todos os projetos
          </Link>
          <h1 className="display-lg mt-8 max-w-4xl">{project.title}</h1>
          <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-4">
            <div>
              <p className="eyebrow">Tipologia</p>
              <p className="mt-2 text-sm">{project.category}</p>
            </div>
            <div>
              <p className="eyebrow">Local</p>
              <p className="mt-2 text-sm">{project.location ?? "—"}</p>
            </div>
            <div>
              <p className="eyebrow">Ano</p>
              <p className="mt-2 text-sm">{project.year ?? "—"}</p>
            </div>
            <div>
              <p className="eyebrow">Área</p>
              <p className="mt-2 text-sm">{project.area ?? "—"}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[86rem] px-6 lg:px-10">
          <img
            src={project.cover_url ?? "/images/hero.jpg"}
            alt={project.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </section>

        <section className="mx-auto grid max-w-[86rem] gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <Reveal>
            <p className="eyebrow">O desafio</p>
            <h2 className="mt-5 font-serif text-3xl leading-snug">{project.summary}</h2>
          </Reveal>
          <Reveal delay={120} className="text-base leading-loose text-muted-foreground">
            {(project.description ?? "").split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mb-6">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </section>

        <section className="mx-auto max-w-[86rem] space-y-16 px-6 pb-24 lg:px-10">
          {images.map((image, index) => (
            <Reveal
              key={image.id}
              className={index % 3 === 1 ? "lg:ml-auto lg:w-[72%]" : "w-full"}
            >
              <img
                src={image.image_url}
                alt={image.caption ?? project.title}
                loading="lazy"
                className="w-full object-cover"
              />
              {image.caption ? (
                <p className="mt-4 text-sm text-muted-foreground">{image.caption}</p>
              ) : null}
            </Reveal>
          ))}
        </section>

        {others.length ? (
          <section className="border-t border-border bg-secondary/40 py-24">
            <div className="mx-auto max-w-[86rem] px-6 lg:px-10">
              <p className="eyebrow">Outros projetos</p>
              <div className="mt-10 grid gap-10 md:grid-cols-3">
                {others.map((other) => (
                  <Link
                    key={other.id}
                    to="/projeto/$slug"
                    params={{ slug: other.slug }}
                    className="group block"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={other.cover_url ?? "/images/hero.jpg"}
                        alt={other.title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="eyebrow mt-5">{other.category}</p>
                    <h3 className="mt-2 font-serif text-xl">{other.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter content={content} />
      <ChatWidget officeName={officeName} />
    </>
  );
}
