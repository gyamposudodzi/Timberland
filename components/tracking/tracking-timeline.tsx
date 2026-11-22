import { Check } from "lucide-react";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatDateTime, cn } from "@/lib/utils";

interface TimelineEvent {
  statusCode: ShipmentStatus;
  label: string;
  description: string | null;
  location: string | null;
  occurredAt: Date;
}

export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracking updates yet.</p>;
  }

  return (
    <ol className="relative space-y-6">
      {events.map((e, i) => {
        const isLatest = i === 0;
        const tone = STATUS_META[e.statusCode]?.tone ?? "neutral";
        const isWarningOrDanger = tone === "warning" || tone === "danger";

        return (
          <li key={i} className="relative flex gap-3.5">
            {i < events.length - 1 && (
              <span
                className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                isLatest && !isWarningOrDanger
                  ? "border-lime bg-lime text-forest"
                  : isLatest && isWarningOrDanger
                    ? "border-warning bg-[#FEF3C7] text-[#92400E]"
                    : "border-border bg-muted text-muted-foreground",
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-forest">{e.label}</p>
              <time
                className="mt-0.5 block text-xs text-muted-foreground"
                dateTime={e.occurredAt.toISOString()}
              >
                {formatDateTime(e.occurredAt)}
              </time>
              {e.location && (
                <p className="mt-0.5 text-xs text-muted-foreground">{e.location}</p>
              )}
              {e.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
