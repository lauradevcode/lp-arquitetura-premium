import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export type SiteContent = Record<string, string>;

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [contentRes, projectsRes, testimonialsRes] = await Promise.all([
    supabase.from("site_content").select("key, value"),
    supabase
      .from("projects")
      .select("id, slug, title, category, location, year, summary, cover_url, order_index")
      .eq("published", true)
      .order("order_index"),
    supabase
      .from("testimonials")
      .select("id, name, role, quote, photo_url, order_index")
      .order("order_index"),
  ]);

  const content: SiteContent = {};
  for (const row of contentRes.data ?? []) content[row.key] = row.value;

  return {
    content,
    projects: projectsRes.data ?? [],
    testimonials: testimonialsRes.data ?? [],
  };
});

export const getProjectBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (!project) return null;

    const [imagesRes, contentRes, othersRes] = await Promise.all([
      supabase
        .from("project_images")
        .select("id, image_url, caption, order_index")
        .eq("project_id", project.id)
        .order("order_index"),
      supabase.from("site_content").select("key, value"),
      supabase
        .from("projects")
        .select("id, slug, title, category, cover_url")
        .eq("published", true)
        .neq("id", project.id)
        .order("order_index")
        .limit(3),
    ]);

    const content: SiteContent = {};
    for (const row of contentRes.data ?? []) content[row.key] = row.value;

    return {
      project,
      images: imagesRes.data ?? [],
      others: othersRes.data ?? [],
      content,
    };
  });

const LeadInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().min(8).max(40),
  project_type: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      project_type: data.project_type || null,
      budget: data.budget || null,
      message: data.message || null,
      source: "formulario",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
