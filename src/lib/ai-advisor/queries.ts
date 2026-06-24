import { prisma } from "@/lib/prisma";

export async function listAiConversations(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 50);
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { sessionId: { contains: params.search, mode: "insensitive" as const } },
          {
            user: {
              OR: [
                { email: { contains: params.search, mode: "insensitive" as const } },
                { firstName: { contains: params.search, mode: "insensitive" as const } },
                { lastName: { contains: params.search, mode: "insensitive" as const } },
              ],
            },
          },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.aiAdvisorConversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.aiAdvisorConversation.count({ where }),
  ]);

  return {
    items: items.map((c) => ({
      id: c.id,
      title: c.title,
      sessionId: c.sessionId,
      user: c.user,
      messageCount: c._count.messages,
      lastMessage: c.messages[0] ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAiConversationDetail(id: string) {
  const conversation = await prisma.aiAdvisorConversation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    title: conversation.title,
    sessionId: conversation.sessionId,
    user: conversation.user,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      metadata: m.metadata,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function getConversationMessages(conversationId: string, sessionId: string) {
  const conversation = await prisma.aiAdvisorConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ sessionId }, { userId: { not: null } }],
    },
    include: {
      messages: {
        where: { role: { in: ["user", "assistant"] } },
        orderBy: { createdAt: "asc" },
        take: 50,
      },
    },
  });

  if (!conversation) return null;

  return conversation.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));
}
