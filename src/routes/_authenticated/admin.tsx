import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteProject,
  deleteTestimonial,
  getAdminData,
  saveProject,
  saveSiteContent,
  saveTestimonial,
  updateLeadStatus,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel de gestão | Marina Bittencourt Arquitetura" },
      { name: "description", content: "Gestão de projetos, textos, depoimentos e leads." },
      { property: "og:title", content: "Painel de gestão" },
      { property: "og:description", content: "Gestão de projetos, textos, depoimentos e leads." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const tabs = ["Leads", "Projetos", "Textos", "Depoimentos", "Assistente"] as const;
const statuses = ["novo", "em_contato", "proposta", "fechado", "arquivado"] as const;

const field =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-terracotta";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchData = useServerFn(getAdminData);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Leads");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => fetchData(),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <p className="p-10 text-sm text-muted-foreground">Carregando painel...</p>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="font-serif text-2xl">Acesso restrito</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Não foi possível carregar o painel."}
        </p>
        <button onClick={signOut} className="mt-6 eyebrow text-terracotta">
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between px-6 py-5">
          <div>
            <p className="eyebrow">Painel</p>
            <p className="font-serif text-xl">Gestão do site</p>
          </div>
          <button onClick={signOut} className="eyebrow text-muted-foreground">
            Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-[80rem] gap-6 overflow-x-auto px-6 pb-3">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`whitespace-nowrap pb-2 text-[0.72rem] uppercase tracking-[0.16em] ${
                tab === item
                  ? "border-b border-terracotta text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[80rem] px-6 py-10">
        {tab === "Leads" ? <LeadsPanel leads={data.leads} onChange={refetch} /> : null}
        {tab === "Projetos" ? <ProjectsPanel projects={data.projects} onChange={refetch} /> : null}
        {tab === "Textos" ? <ContentPanel content={data.content} onChange={refetch} /> : null}
        {tab === "Depoimentos" ? (
          <TestimonialsPanel testimonials={data.testimonials} onChange={refetch} />
        ) : null}
        {tab === "Assistente" ? <ConversationsPanel conversations={data.conversations} /> : null}
      </main>
    </div>
  );
}

function LeadsPanel({ leads, onChange }: { leads: any[]; onChange: () => void }) {
  const update = useServerFn(updateLeadStatus);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{leads.length} contatos recebidos</p>
      {leads.map((lead) => (
        <article key={lead.id} className="border border-border bg-background p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-serif text-lg">{lead.name}</p>
              <p className="text-sm text-muted-foreground">
                {[lead.phone, lead.email].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {[lead.project_type, lead.budget, lead.source].filter(Boolean).join(" · ")}
              </p>
            </div>
            <select
              value={lead.status}
              onChange={async (event) => {
                try {
                  await update({
                    data: { id: lead.id, status: event.target.value as (typeof statuses)[number] },
                  });
                  onChange();
                  toast.success("Status atualizado");
                } catch {
                  toast.error("Não foi possível atualizar");
                }
              }}
              className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.12em]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          {lead.message ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lead.message}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ContentPanel({ content, onChange }: { content: any[]; onChange: () => void }) {
  const save = useServerFn(saveSiteContent);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(content.map((row) => [row.key, row.value ?? ""])),
  );
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    try {
      await save({
        data: { entries: Object.entries(values).map(([key, value]) => ({ key, value })) },
      });
      onChange();
      toast.success("Textos atualizados");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {content.map((row) => (
          <label key={row.key} className="block">
            <span className="eyebrow">{row.label ?? row.key}</span>
            <textarea
              rows={(values[row.key] ?? "").length > 90 ? 4 : 2}
              value={values[row.key] ?? ""}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [row.key]: event.target.value }))
              }
              className={`${field} mt-2`}
            />
          </label>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={pending}
        className="rounded-sm bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar textos"}
      </button>
    </div>
  );
}

const emptyProject = {
  id: null as string | null,
  slug: "",
  title: "",
  category: "Residencial",
  location: "",
  year: "",
  summary: "",
  description: "",
  cover_url: "",
  order_index: 0,
  published: true,
};

function ProjectsPanel({ projects, onChange }: { projects: any[]; onChange: () => void }) {
  const save = useServerFn(saveProject);
  const remove = useServerFn(deleteProject);
  const [form, setForm] = useState<typeof emptyProject | null>(null);

  async function submit() {
    if (!form) return;
    try {
      await save({ data: form });
      setForm(null);
      onChange();
      toast.success("Projeto salvo");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar projeto");
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setForm({ ...emptyProject, order_index: projects.length })}
        className="rounded-sm bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background"
      >
        Novo projeto
      </button>

      {form ? (
        <div className="grid gap-4 border border-border bg-background p-5 md:grid-cols-2">
          {(
            [
              ["title", "Título"],
              ["slug", "Slug (url)"],
              ["category", "Categoria"],
              ["location", "Local"],
              ["year", "Ano"],
              ["cover_url", "Imagem de capa (url)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="eyebrow">{label}</span>
              <input
                value={String(form[key] ?? "")}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className={`${field} mt-2`}
              />
            </label>
          ))}
          <label className="block md:col-span-2">
            <span className="eyebrow">Resumo</span>
            <textarea
              rows={2}
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="eyebrow">Descrição</span>
            <textarea
              rows={6}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm({ ...form, published: event.target.checked })}
            />
            Publicado no site
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              onClick={submit}
              className="rounded-sm bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background"
            >
              Salvar
            </button>
            <button onClick={() => setForm(null)} className="eyebrow text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-border bg-background p-4"
          >
            <div>
              <p className="font-serif text-lg">{project.title}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {project.category} · /{project.slug} ·{" "}
                {project.published ? "publicado" : "rascunho"}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  setForm({
                    id: project.id,
                    slug: project.slug,
                    title: project.title,
                    category: project.category,
                    location: project.location ?? "",
                    year: project.year ?? "",
                    summary: project.summary ?? "",
                    description: project.description ?? "",
                    cover_url: project.cover_url ?? "",
                    order_index: project.order_index,
                    published: project.published,
                  })
                }
                className="eyebrow text-terracotta"
              >
                Editar
              </button>
              <button
                onClick={async () => {
                  try {
                    await remove({ data: { id: project.id } });
                    onChange();
                    toast.success("Projeto removido");
                  } catch {
                    toast.error("Erro ao remover");
                  }
                }}
                className="eyebrow text-destructive"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const emptyTestimonial = {
  id: null as string | null,
  name: "",
  role: "",
  quote: "",
  photo_url: "",
  order_index: 0,
};

function TestimonialsPanel({
  testimonials,
  onChange,
}: {
  testimonials: any[];
  onChange: () => void;
}) {
  const save = useServerFn(saveTestimonial);
  const remove = useServerFn(deleteTestimonial);
  const [form, setForm] = useState<typeof emptyTestimonial | null>(null);

  return (
    <div className="space-y-6">
      <button
        onClick={() => setForm({ ...emptyTestimonial, order_index: testimonials.length })}
        className="rounded-sm bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background"
      >
        Novo depoimento
      </button>

      {form ? (
        <div className="grid gap-4 border border-border bg-background p-5 md:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Nome</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Descrição / projeto</span>
            <input
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="eyebrow">Depoimento</span>
            <textarea
              rows={3}
              value={form.quote}
              onChange={(event) => setForm({ ...form, quote: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="eyebrow">Foto (url)</span>
            <input
              value={form.photo_url}
              onChange={(event) => setForm({ ...form, photo_url: event.target.value })}
              className={`${field} mt-2`}
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              onClick={async () => {
                try {
                  await save({ data: form });
                  setForm(null);
                  onChange();
                  toast.success("Depoimento salvo");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Erro ao salvar");
                }
              }}
              className="rounded-sm bg-foreground px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-background"
            >
              Salvar
            </button>
            <button onClick={() => setForm(null)} className="eyebrow text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {testimonials.map((item) => (
          <article key={item.id} className="border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-lg">{item.name}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.role}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setForm({
                      id: item.id,
                      name: item.name,
                      role: item.role ?? "",
                      quote: item.quote,
                      photo_url: item.photo_url ?? "",
                      order_index: item.order_index,
                    })
                  }
                  className="eyebrow text-terracotta"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    try {
                      await remove({ data: { id: item.id } });
                      onChange();
                      toast.success("Depoimento removido");
                    } catch {
                      toast.error("Erro ao remover");
                    }
                  }}
                  className="eyebrow text-destructive"
                >
                  Excluir
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.quote}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ConversationsPanel({ conversations }: { conversations: any[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {conversations.filter((item) => item.qualified).length} de {conversations.length} conversas
        qualificadas pela assistente
      </p>
      {conversations.map((item) => (
        <article
          key={item.id}
          className="flex items-center justify-between gap-4 border border-border bg-background p-4"
        >
          <div>
            <p className="font-serif text-lg">{item.visitor_name ?? "Visitante"}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {item.project_type ?? "sem tipo definido"} ·{" "}
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <span
            className={`text-[0.7rem] uppercase tracking-[0.14em] ${
              item.qualified ? "text-terracotta" : "text-muted-foreground"
            }`}
          >
            {item.qualified ? "qualificado" : "em conversa"}
          </span>
        </article>
      ))}
    </div>
  );
}
