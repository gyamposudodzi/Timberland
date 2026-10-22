"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteShipmentAction } from "@/server/admin.actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DeleteShipmentButton({ shipmentId, trackingNumber }: { shipmentId: string; trackingNumber: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onDelete() {
    if (!window.confirm(`Permanently delete shipment ${trackingNumber}? This cannot be undone.`)) return;
    start(async () => {
      const fd = new FormData();
      fd.set("shipmentId", shipmentId);
      const res = await deleteShipmentAction(fd);
      if (res.ok) router.push("/ops");
      else window.alert(res.error ?? "Could not delete the shipment.");
    });
  }

  return (
    <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
      {pending ? <Spinner /> : <Trash2 className="h-4 w-4" />} Delete shipment
    </Button>
  );
}
