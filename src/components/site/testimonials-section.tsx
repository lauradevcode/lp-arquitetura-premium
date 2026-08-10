import { Reveal } from "@/components/site/reveal";
import type { SiteContent } from "@/lib/site.functions";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  photo_url: string | null;
};

export function TestimonialsSection({
  content,
  testimonials,
}: {
  content: SiteContent;
  testimonials: Testimonial[];
}) {
  return (
    <section id="depoimentos" className="bg-ink py-28 text-background lg:py-40">
      <div className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-background/45">Depoimentos</p>
          <h2 className="display-lg mt-6 text-background">{content["testimonials_title"]}</h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 100}
              className="flex h-full flex-col justify-between border-t border-background/15 pt-8"
            >
              <blockquote className="font-serif text-xl leading-relaxed text-background/90">
                “{item.quote}”
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                ) : null}
                <div>
                  <p className="text-sm">{item.name}</p>
                  {item.role ? (
                    <p className="text-[0.72rem] uppercase tracking-[0.16em] text-background/45">
                      {item.role}
                    </p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
