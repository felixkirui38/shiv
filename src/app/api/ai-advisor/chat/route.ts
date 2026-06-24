import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { runAiAdvisorChat } from "@/lib/ai-advisor/service";
import { getConversationMessages } from "@/lib/ai-advisor/queries";
import { aiChatSchema } from "@/validations/ai-advisor";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const sessionId = searchParams.get("sessionId");

  if (!conversationId || !sessionId) {
    return apiError("conversationId and sessionId are required", 400);
  }

  const messages = await getConversationMessages(conversationId, sessionId);
  if (!messages) return apiError("Conversation not found", 404);

  return apiSuccess({ messages });
}

export async function POST(req: Request) {
  const limited = await checkRateLimit(req, RATE_LIMITS.aiChat);
  if (!limited.success) return rateLimitedResponse(limited);

  const body = await req.json();
  const parsed = aiChatSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const session = await auth();
  const userId = session?.user?.id;

  try {
    const result = await runAiAdvisorChat({
      message: parsed.data.message,
      conversationId: parsed.data.conversationId,
      sessionId: parsed.data.sessionId,
      userId,
    });
    return apiSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    const status = message.includes("disabled") || message.includes("sign in") ? 403 : 500;
    return apiError(message, status);
  }
}
