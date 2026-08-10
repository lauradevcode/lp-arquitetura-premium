import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso restrito ao administrador do estúdio.");
}

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabase } = context;
    const [content, projects, testimonials, leads, conversations] = await Promise.all([
      supabase.from("site_content").select("key, value, label, group_name").order("key"),
      supabase.from("projects").select("*").order("order_index"),
      supabase.from("testimonials").select("*").order("order_index"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200),
      supabase
        .from("ai_conversations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return {
      content: content.data ?? [],
      projects: projects.data ?? [],
      testimonials: testimonials.data ?? [],
      leads: leads.data ?? [],
      conversations: conversations.data ?? [],
    };
  });

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        entries: z
          .array(z.object({ key: z.string().min(1).max(80), value: z.string().max(4000) }))
          .min(1)
          .max(80),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    for (const entry of data.entries) {
      const { error } = await context.supabase
        .from("site_content")
        .update({ value: entry.value })
        .eq("key", entry.key);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

const ProjectInput = z.object({
  id: z.string().uuid().nullable(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(60),
  location: z.string().trim().max(120),
  year: z.string().trim().max(20),
  summary: z.string().trim().max(400),
  description: z.string().trim().max(6000),
  cover_url: z.string().trim().max(500),
  order_index: z.number().int().min(0).max(999),
  published: z.boolean(),
});

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProjectInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      slug: data.slug,
      title: data.title,
      category: data.category,
      location: data.location || null,
      year: data.year || null,
      summary: data.summary || null,
      description: data.description || null,
      cover_url: data.cover_url || null,
      order_index: data.order_index,
      published: data.published,
    };
    const query = data.id
      ? context.supabase.from("projects").update(payload).eq("id", data.id)
      : context.supabase.from("projects").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const TestimonialInput = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120),
  quote: z.string().trim().min(10).max(600),
  photo_url: z.string().trim().max(500),
  order_index: z.number().int().min(0).max(999),
});

export const saveTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TestimonialInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      name: data.name,
      role: data.role || null,
      quote: data.quote,
      photo_url: data.photo_url || null,
      order_index: data.order_index,
    };
    const query = data.id
      ? context.supabase.from("testimonials").update(payload).eq("id", data.id)
      : context.supabase.from("testimonials").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["novo", "em_contato", "proposta", "fechado", "arquivado"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
