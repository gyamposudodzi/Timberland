import type { Metadata } from "next";
import { TrackForm } from "@/components/tracking/track-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Track a shipment",
  description: "Track any Timberland shipment by tracking number — no account required.",
};

export default function TrackPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Track a shipment</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your tracking number to see the latest status. You don’t need an account.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tracking number</CardTitle>
          <CardDescription>Codes look like TBTQ1HX8SKQ.</CardDescription>
        </CardHeader>
        <CardContent>
          <TrackForm />
        </CardContent>
      </Card>
    </div>
  );
}
