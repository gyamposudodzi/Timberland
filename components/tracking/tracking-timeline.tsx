import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  statusCode: ShipmentStatus;
  label: string;
  description: string | null;
  location: string | null;
  occurredAt: Date;
}

const DOT: Record<string, string> = {
  neutral: "bg-muted-foreground",
  active: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracking updates yet.</p>;
  }
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e, i) => {
        const tone = STATUS_META[e.statusCode]?.tone ?? "neutral";
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card",
                DOT[tone],
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-medium">{e.label}</p>
              <time className="text-xs text-muted-foreground" dateTime={e.occurredAt.toISOString()}>
                {formatDateTime(e.occurredAt)}
              </time>
            </div>
            {e.location && <p className="text-sm text-muted-foreground">{e.location}</p>}
            {e.description && <p className="mt-0.5 text-sm text-muted-foreground">{e.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
