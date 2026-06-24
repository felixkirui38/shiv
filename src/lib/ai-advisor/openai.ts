const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface OpenAiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: OpenAiToolCall[];
}

export interface OpenAiToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface OpenAiTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export async function createChatCompletion(params: {
  model: string;
  messages: OpenAiMessage[];
  tools?: OpenAiTool[];
  maxTokens: number;
}): Promise<{
  content: string | null;
  toolCalls: OpenAiToolCall[];
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      tools: params.tools,
      max_tokens: params.maxTokens,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices: Array<{
      message: {
        content: string | null;
        tool_calls?: OpenAiToolCall[];
      };
    }>;
  };

  const message = data.choices[0]?.message;
  return {
    content: message?.content ?? null,
    toolCalls: message?.tool_calls ?? [],
  };
}

export const AI_ADVISOR_TOOLS: OpenAiTool[] = [
  {
    type: "function",
    function: {
      name: "suggest_products",
      description: "Suggest Shiv Insurance products based on customer needs or category",
      parameters: {
        type: "object",
        properties: {
          needs: { type: "string", description: "Customer needs or keywords" },
          category: { type: "string", description: "Product category e.g. motor, health" },
          limit: { type: "number", description: "Max products to return" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "estimate_premium",
      description: "Estimate annual premium for a product slug from CMS",
      parameters: {
        type: "object",
        properties: {
          productSlug: { type: "string" },
          coverageAmount: { type: "number", description: "Coverage amount in KES" },
        },
        required: ["productSlug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend_coverage",
      description: "Recommend coverages and benefits for a product",
      parameters: {
        type: "object",
        properties: {
          productSlug: { type: "string" },
          profile: { type: "string", description: "Customer profile summary" },
        },
        required: ["productSlug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explain_claims",
      description: "Explain the claims process, statuses, and portal links",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Specific claim topic if any" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_policies",
      description: "Compare up to 3 insurance products by slug",
      parameters: {
        type: "object",
        properties: {
          slugs: {
            type: "array",
            items: { type: "string" },
            description: "Product slugs to compare",
          },
        },
        required: ["slugs"],
      },
    },
  },
];
