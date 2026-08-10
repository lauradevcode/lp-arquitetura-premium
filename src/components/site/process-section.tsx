import { Reveal } from "@/components/site/reveal";
import type { SiteContent } from "@/lib/site.functions";

const steps = [
  {
    number: "01",
    title: "Conversa de diagnóstico",
    text: "Uma reunião de escuta sobre rotina, referências e desejos. Saímos daqui com escopo, prazos e faixa de investimento claros.",
  },
  {
    number: "02",
    title: "Estudo preliminar",
    text: "Levantamento técnico, análise de luz natural e fluxos. Apresentamos partido de projeto, moodboard e primeiras plantas.",
  },
  {
    number: "03",
    title: "Projeto executivo",
    text: "Detalhamento completo: marcenaria, iluminação em camadas, revestimentos, elétrica e hidráulica, com caderno de especificações.",
  },
  {
    number: "04",
    title: "Acompanhamento de obra",
    text: "Visitas periódicas, compatibilização com fornecedores e curadoria de acabamentos até a entrega com styling final.",
  },
];

const differentials = [
  "Neuroarquitetura aplicada ao conforto real do dia a dia",
  "Cronograma e planilha de investimento auditáveis",
  "Rede própria de marceneiros, marmoristas e iluminadores",
  "Consultoria pontual para quem quer começar aos poucos",
];

export function ProcessSection({ content }: { content: SiteContent }) {
  return (
    <section id="processo" className="mx-auto max-w-[86rem] px-6 py-28 lg:px-10 lg:py-40">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow">Processo</p>
          <h2 className="display-lg mt-6">{content["process_title"]}</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {content["process_subtitle"]}
          </p>

          <ul className="mt-12 space-y-4">
            {differentials.map((item) => (
              <li key={item} className="flex gap-4 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="space-y-px border-t border-border">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={index * 90}
              className="border-b border-border py-8 lg:py-10"
            >
              <div className="flex gap-8">
                <span className="font-serif text-xl text-terracotta">{step.number}</span>
                <div>
                  <h3 className="font-serif text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
