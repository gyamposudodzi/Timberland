"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { estimateQuoteAction, type QuoteResult } from "@/server/quote.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

interface ServiceOption {
  code: string;
  name: string;
  slaDays: number;
}

export function QuoteCalculator({
  services,
  defaultService,
}: {
  services: ServiceOption[];
  defaultService?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<QuoteResult | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      serviceLevelCode: String(form.get("serviceLevelCode") ?? ""),
      originPostalCode: String(form.get("originPostalCode") ?? ""),
      destinationPostalCode: String(form.get("destinationPostalCode") ?? ""),
      weightKg: String(form.get("weightKg") ?? ""),
      pieces: String(form.get("pieces") ?? "1"),
    };
    startTransition(async () => {
      setResult(await estimateQuoteAction(input));
    });
  }

  const q = result?.ok ? result.quote : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Shipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="serviceLevelCode">Service</Label>
              <Select id="serviceLevelCode" name="serviceLevelCode" defaultValue={defaultService ?? services[0]?.code}>
                {services.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.slaDays === 0 ? "same day" : `${s.slaDays}d`})
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originPostalCode">Origin postcode</Label>
                <Input id="originPostalCode" name="originPostalCode" placeholder="11201" defaultValue="11201" />
              </div>
              <div>
                <Label htmlFor="destinationPostalCode">Destination postcode</Label>
                <Input id="destinationPostalCode" name="destinationPostalCode" placeholder="22301" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weightKg">Total weight (kg)</Label>
                <Input id="weightKg" name="weightKg" type="number" step="0.01" min="0.01" defaultValue="1" required />
              </div>
              <div>
                <Label htmlFor="pieces">Pieces</Label>
                <Input id="pieces" name="pieces" type="number" min="1" max="50" defaultValue="1" required />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />} Estimate price
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          {result && !result.ok && <Alert variant="error">{result.error}</Alert>}
          {!result && (
            <p className="text-sm text-muted-foreground">Fill in the form and select “Estimate price”.</p>
          )}
          {q && (
            <div className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Zone</span>
                <span className="font-medium">{q.zoneName}</span>
              </div>
              <Row label={`Base (zone)`} value={q.breakdown.zoneBase} currency={q.currency} />
              <Row
                label={`Weight (${q.breakdown.weightTotalKg.toFixed(2)} kg)`}
                value={q.breakdown.weightCharge}
                currency={q.currency}
              />
              <Row
                label={`Pieces (${q.breakdown.piecesTotal})`}
                value={q.breakdown.pieceCharge}
                currency={q.currency}
              />
              <div className="my-2 border-t border-border" />
              <Row label={`Subtotal`} value={q.breakdown.subtotalBeforeService} currency={q.currency} />
              <div className="flex items-baseline justify-between text-muted-foreground">
                <span>Service multiplier</span>
                <span>×{q.breakdown.serviceMultiplier}</span>
              </div>
              {q.breakdown.minPriceApplied && (
                <p className="text-xs text-warning">Minimum charge applied for this route.</p>
              )}
              <div className="my-2 border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(q.total, q.currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated delivery in {q.etaDays === 0 ? "same day" : `${q.etaDays} day${q.etaDays > 1 ? "s" : ""}`}.
              </p>
              <Link href="/signup">
                <Button className="mt-3 w-full">Book this shipment</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatCurrency(value, currency)}</span>
    </div>
  );
}
