import { prisma } from "@/lib/prisma";
import {
  buildCustomerContext,
  buildProductCatalogContext,
  toolComparePolicies,
  toolEstimatePremium,
  toolExplainClaims,
  toolRecommendCoverage,
  toolSuggestProducts,
} from "@/lib/ai-advisor/tools";
import { getAiAdvisorSettings, isAiAdvisorAvailable } from "@/lib/ai-advisor/config";
import {
  AI_ADVISOR_TOOLS,
  createChatCompletion,
  type OpenAiMessage,
} from "@/lib/ai-advisor/openai";

async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "suggest_products":
      return toolSuggestProducts(args as Parameters<typeof toolSuggestProducts>[0]);
    case "estimate_premium":
      return toolEstimatePremium(args as Parameters<typeof toolEstimatePremium>[0]);
    case "recommend_coverage":
      return toolRecommendCoverage(args as Parameters<typeof toolRecommendCoverage>[0]);
    case "explain_claims":
      return toolExplainClaims(args as Parameters<typeof toolExplainClaims>[0]);
    case "compare_policies":
      return toolComparePolicies(args as Parameters<typeof toolComparePolicies>[0]);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function buildSystemPrompt(
  catalog: Awaited<ReturnType<typeof buildProductCatalogContext>>,
  customer: Awaited<ReturnType<typeof buildCustomerContext>> | null,
  extra: string
) {
  const parts = [
    "You are Shiv Insurance's AI advisor for Kenya. Help customers with insurance products, premiums, coverage, claims, and policy comparisons.",
    "Use tools when you need live product data, premium estimates, coverage details, claims info, or comparisons.",
    "Be concise, professional, and friendly. Prices are in KES unless stated otherwise.",
    "Never invent products — only reference items from the catalog or tool results.",
    "For binding quotes or policy changes, direct users to the portal or quote pages.",
    "",
    "Product catalog snapshot:",
    JSON.stringify(catalog, null, 2),
  ];

  if (customer) {
    parts.push("", "Logged-in customer context (use for personalization):", JSON.stringify(customer, null, 2));
  }

  if (extra.trim()) {
    parts.push("", "Additional instructions:", extra.trim());
  }

  return parts.join("\n");
}

export async function runAiAdvisorChat(params: {
  message: string;
  conversationId?: string;
  sessionId: string;
  userId?: string;
}) {
  const settings = await getAiAdvisorSettings();
  if (!isAiAdvisorAvailable(settings)) {
    throw new Error("AI advisor is disabled");
  }

  if (!settings.allowGuests && !params.userId) {
    throw new Error("Please sign in to use the AI advisor");
  }

  const [catalog, customer] = await Promise.all([
    buildProductCatalogContext(),
    params.userId ? buildCustomerContext(params.userId) : Promise.resolve(null),
  ]);

  let conversation = params.conversationId
    ? await prisma.aiAdvisorConversation.findUnique({
        where: { id: params.conversationId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
      })
    : null;

  if (conversation && params.userId && !conversation.userId) {
    conversation = await prisma.aiAdvisorConversation.update({
      where: { id: conversation.id },
      data: { userId: params.userId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    });
  }

  if (!conversation) {
    const title = params.message.slice(0, 80);
    conversation = await prisma.aiAdvisorConversation.create({
      data: {
        sessionId: params.sessionId,
        userId: params.userId,
        title,
      },
      include: { messages: true },
    });
  }

  await prisma.aiAdvisorMessage.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: params.message,
    },
  });

  const history: OpenAiMessage[] = conversation.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const messages: OpenAiMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(catalog, customer, settings.systemPromptExtra),
    },
    ...history,
    { role: "user", content: params.message },
  ];

  let assistantContent = "";
  const toolResults: Array<{ tool: string; data: unknown }> = [];
  let iterations = 0;

  while (iterations < 4) {
    iterations += 1;
    const completion = await createChatCompletion({
      model: settings.model,
      messages,
      tools: AI_ADVISOR_TOOLS,
      maxTokens: settings.maxTokens,
    });

    if (completion.toolCalls.length === 0) {
      assistantContent = completion.content ?? "I'm sorry, I couldn't generate a response.";
      break;
    }

    messages.push({
      role: "assistant",
      content: completion.content,
      tool_calls: completion.toolCalls,
    });

    for (const call of completion.toolCalls) {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        parsed = {};
      }

      const result = await executeTool(call.function.name, parsed);
      toolResults.push({ tool: call.function.name, data: result });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  if (!assistantContent) {
    const final = await createChatCompletion({
      model: settings.model,
      messages,
      maxTokens: settings.maxTokens,
    });
    assistantContent = final.content ?? "Here's what I found based on your request.";
  }

  const saved = await prisma.aiAdvisorMessage.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: assistantContent,
      metadata: toolResults.length
        ? (JSON.parse(JSON.stringify({ tools: toolResults })) as object)
        : undefined,
    },
  });

  await prisma.aiAdvisorConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return {
    conversationId: conversation.id,
    message: {
      id: saved.id,
      role: "assistant" as const,
      content: assistantContent,
      createdAt: saved.createdAt.toISOString(),
      tools: toolResults,
    },
  };
}
