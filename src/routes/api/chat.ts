import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown; conversationId?: unknown };

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        const conversationId =
          typeof body.conversationId === "string" ? body.conversationId : null;

        if (!Array.isArray(messages)) {
          return new Response("Mensagens inválidas", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("IA não configurada", { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");

        if (conversationId) {
          await supabaseAdmin
            .from("ai_conversations")
            .upsert({ id: conversationId }, { onConflict: "id" });
          if (lastUser) {
            const content = textOf(lastUser);
            if (content) {
              await supabaseAdmin
                .from("ai_messages")
                .insert({ conversation_id: conversationId, role: "user", content });
            }
          }
        }

        const { data: content } = await supabaseAdmin
          .from("site_content")
          .select("key, value")
          .in("key", ["office_name", "whatsapp_number", "process_title"]);
        const map = new Map((content ?? []).map((row) => [row.key, row.value]));
        const officeName = map.get("office_name") ?? "o escritório";
        const whatsapp = map.get("whatsapp_number") ?? "";

        const gateway = createLovableAiGatewayProvider(apiKey);

        const systemPrompt = `Você é a assistente virtual de ${officeName}, um escritório de arquitetura e design de interiores de alto padrão.

TOM DE VOZ: sofisticado, acolhedor e consultivo. Frases curtas, elegantes, em português do Brasil. Nunca robótica, nunca genérica, nunca use emojis em excesso (no máximo um, raramente). Trate a pessoa por você.

OBJETIVO DA CONVERSA, nesta ordem:
1. Dê boas-vindas de forma breve e calorosa e pergunte o que a pessoa busca.
2. Entenda se o interesse é projeto residencial, comercial ou consultoria pontual.
3. Explique de forma breve (2 a 3 frases) como funciona a contratação: conversa inicial de diagnóstico, proposta com escopo e etapas, projeto (levantamento, conceito, executivo) e acompanhamento de obra.
4. Colete, uma pergunta por vez: nome, telefone (WhatsApp), tipo de projeto e orçamento aproximado previsto.
5. Só depois de ter nome, telefone e tipo de projeto, chame a ferramenta registrar_lead e então convide a pessoa a seguir a conversa no WhatsApp da arquiteta${whatsapp ? ` (https://wa.me/${whatsapp})` : ""}, resumindo em 2 frases o que foi conversado.

REGRAS: nunca prometa preços fechados nem prazos exatos; fale em faixas e etapas. Não invente projetos ou credenciais. Se a pessoa não quiser informar dados, siga acolhedora e ofereça o WhatsApp mesmo assim. Máximo de 4 linhas por resposta.`;

        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: systemPrompt,
          messages: await convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(50),
          tools: {
            registrar_lead: tool({
              description:
                "Registra o lead qualificado no painel da arquiteta. Use somente após ter nome, telefone e tipo de projeto.",
              inputSchema: z.object({
                nome: z.string().describe("Nome da pessoa"),
                telefone: z.string().describe("Telefone/WhatsApp informado"),
                tipo_projeto: z
                  .string()
                  .describe("residencial, comercial ou consultoria, com detalhes curtos"),
                orcamento: z.string().nullable().describe("Faixa de orçamento aproximada"),
                resumo: z.string().nullable().describe("Resumo curto da conversa"),
              }),
              execute: async ({ nome, telefone, tipo_projeto, orcamento, resumo }) => {
                const { error } = await supabaseAdmin.from("leads").insert({
                  name: nome,
                  phone: telefone,
                  project_type: tipo_projeto,
                  budget: orcamento,
                  message: resumo,
                  source: "assistente_ia",
                  conversation_id: conversationId,
                });
                if (error) {
                  console.error("Erro ao salvar lead da IA:", error);
                  return { ok: false };
                }
                if (conversationId) {
                  await supabaseAdmin
                    .from("ai_conversations")
                    .update({
                      visitor_name: nome,
                      project_type: tipo_projeto,
                      qualified: true,
                    })
                    .eq("id", conversationId);
                }
                return { ok: true, whatsapp: whatsapp ? `https://wa.me/${whatsapp}` : null };
              },
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            if (!conversationId || !responseMessage) return;
            const content = textOf(responseMessage);
            if (!content) return;
            const { error } = await supabaseAdmin
              .from("ai_messages")
              .insert({ conversation_id: conversationId, role: "assistant", content });
            if (error) console.error("Erro ao salvar mensagem da IA:", error);
          },
        });
      },
    },
  },
});
