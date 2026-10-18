import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex max-w-2xl flex-col items-center py-24 text-center">
      <Compass className="mb-4 h-12 w-12 text-primary" aria-hidden />
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
        <Link href="/track">
          <Button variant="outline">Track a shipment</Button>
        </Link>
      </div>
    </div>
  );
}
