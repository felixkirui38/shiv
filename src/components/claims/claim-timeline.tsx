import { Mail, MessageCircle, MessageSquare, RefreshCw } from "lucide-react";
import type { ClaimTimelineEvent } from "@/lib/claims/types";

const ICONS = {
  status: RefreshCw,
  note: MessageSquare,
  communication: Mail,
};

export function ClaimTimeline({ events }: { events: ClaimTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline events yet.</p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {events.map((event) => {
        const Icon = event.type === "communication" && event.title.includes("WHATSAPP")
          ? MessageCircle
          : ICONS[event.type];
        return (
          <li key={event.id} className="relative">
            <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full bg-white ring-2 ring-slate-200">
              <Icon className="size-3 text-primary" />
            </span>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{event.title}</p>
                <time className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </time>
              </div>
              {event.actor && (
                <p className="mt-0.5 text-xs text-muted-foreground">by {event.actor}</p>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              )}
              {event.isInternal && (
                <span className="mt-2 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  Internal note
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
