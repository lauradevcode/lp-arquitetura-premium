import { createFileRoute } from "@tanstack/react-router";

import { ChatWidget } from "@/components/chat/chat-widget";
import { AboutSection } from "@/components/site/about-section";
import { ContactSection } from "@/components/site/contact-section";
import { HeroSection } from "@/components/site/hero-section";
import { PortfolioSection } from "@/components/site/portfolio-section";
import { ProcessSection } from "@/components/site/process-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { getSiteData } from "@/lib/site.functions";

export const Route = createFileRoute("/")({
  loader: () => getSiteData(),
  head: () => ({
    meta: [
      { title: "Marina Bittencourt Arquitetura | Projetos de alto padrão" },
      {
        name: "description",
        content:
          "Escritório de arquitetura e design de interiores de alto padrão. Projetos residenciais e comerciais com neuroarquitetura, do conceito ao acompanhamento de obra.",
      },
      { property: "og:title", content: "Marina Bittencourt Arquitetura" },
      {
        property: "og:description",
        content:
          "Arquitetura e interiores personalizados: design inteligente aplicado ao bem-estar de quem vive o espaço.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { content, projects, testimonials } = Route.useLoaderData();
  const officeName = content["office_name"] ?? "Estúdio";

  return (
    <>
      <SiteNav
        officeName={officeName}
        logoUrl={content["logo_url"] || undefined}
        whatsapp={content["whatsapp_number"]}
      />
      <main>
        <HeroSection content={content} />
        <AboutSection content={content} />
        <PortfolioSection content={content} projects={projects} />
        <ProcessSection content={content} />
        <TestimonialsSection content={content} testimonials={testimonials} />
        <ContactSection content={content} />
      </main>
      <SiteFooter content={content} />
      <ChatWidget officeName={officeName} />
    </>
  );
}
