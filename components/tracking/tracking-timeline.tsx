import { Check, Circle } from "lucide-react";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatDateTime, cn } from "@/lib/utils";

interface TimelineEvent {
  statusCode: ShipmentStatus;
  label: string;
  description: string | null;
  location: string | null;
  occurredAt: Date;
}

const CORE_JOURNEY: ShipmentStatus[] = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const FULL_ORDER: ShipmentStatus[] = [
  "CREATED",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "AT_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

interface JourneyStep {
  statusCode: ShipmentStatus;
  label: string;
  description: string | null;
  location: string | null;
  occurredAt: Date | null;
  state: "completed" | "current" | "pending" | "alert";
}

function buildJourneySteps(events: TimelineEvent[], currentStatus: ShipmentStatus): JourneyStep[] {
  const byStatus = new Map<ShipmentStatus, TimelineEvent>();
  for (const e of events) {
    if (!byStatus.has(e.statusCode)) {
      byStatus.set(e.statusCode, e);
    }
  }

  // Start with core milestones and include optional intermediate ones if recorded
  const sequence: ShipmentStatus[] = [...CORE_JOURNEY];
  if (byStatus.has("CONFIRMED") || currentStatus === "CONFIRMED") {
    sequence.splice(1, 0, "CONFIRMED");
  }
  if (byStatus.has("AT_HUB") || currentStatus === "AT_HUB") {
    const idx = sequence.indexOf("IN_TRANSIT");
    sequence.splice(idx + 1, 0, "AT_HUB");
  }

  const currentOrderIdx = FULL_ORDER.indexOf(currentStatus);

  const steps: JourneyStep[] = sequence.map((code) => {
    const ev = byStatus.get(code);
    const meta = STATUS_META[code];
    const stepOrderIdx = FULL_ORDER.indexOf(code);

    let state: JourneyStep["state"] = "pending";
    if (code === currentStatus) {
      state = "current";
    } else if (ev || (currentOrderIdx >= 0 && stepOrderIdx < currentOrderIdx)) {
      state = "completed";
    }

    return {
      statusCode: code,
      label: ev?.label ?? meta.label,
      description: ev?.description ?? null,
      location: ev?.location ?? null,
      occurredAt: ev?.occurredAt ?? null,
      state,
    };
  });

  // If shipment is in EXCEPTION, RETURNED, or CANCELLED, surface that event in place
  if (currentStatus === "EXCEPTION" || currentStatus === "RETURNED" || currentStatus === "CANCELLED") {
    const ev = byStatus.get(currentStatus);
    const meta = STATUS_META[currentStatus];
    const lastCompletedIdx = steps.reduce(
      (acc, s, idx) => (s.state === "completed" ? idx : acc),
      -1,
    );
    steps.splice(lastCompletedIdx + 1, 0, {
      statusCode: currentStatus,
      label: ev?.label ?? meta.label,
      description: ev?.description ?? meta.description,
      location: ev?.location ?? null,
      occurredAt: ev?.occurredAt ?? null,
      state: "alert",
    });
  }

  return steps;
}

export function TrackingTimeline({
  events,
  currentStatus,
}: {
  events: TimelineEvent[];
  currentStatus?: ShipmentStatus;
}) {
  const effectiveStatus = currentStatus ?? events[0]?.statusCode;
  if (!effectiveStatus && events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracking updates yet.</p>;
  }

  const steps = buildJourneySteps(events, effectiveStatus!);

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const isDone = step.state === "completed" || step.state === "current";

        return (
          <li key={`${step.statusCode}-${i}`} className={cn("relative flex gap-3.5", !isLast && "pb-6")}>
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[11.5px] top-7 bottom-0 w-px",
                  step.state === "completed" ? "bg-success/40" : "bg-border",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                step.state === "current"
                  ? "border-lime bg-lime text-forest shadow-xs"
                  : step.state === "completed"
                    ? "border-[#CDE3D0] bg-sage text-success"
                    : step.state === "alert"
                      ? "border-warning bg-[#FEF3C7] text-[#92400E]"
                      : "border-border bg-white text-muted-foreground/40",
              )}
            >
              {isDone || step.state === "alert" ? (
                <Check className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "text-sm leading-tight",
                  step.state === "pending"
                    ? "font-medium text-muted-foreground"
                    : "font-semibold text-forest",
                )}
              >
                {step.label}
              </p>

              {step.occurredAt ? (
                <time
                  className="mt-1 block text-xs text-muted-foreground"
                  dateTime={step.occurredAt.toISOString()}
                >
                  {formatDateTime(step.occurredAt)}
                </time>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {step.state === "pending" ? "Pending" : "Completed"}
                </p>
              )}

              {step.location && (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.location}</p>
              )}
              {step.description && (
                <p className="mt-1 text-xs text-forest/80">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
