"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRoleAction } from "@/server/admin.actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const ASSIGNABLE_ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

const ROLE_LABEL: Record<AssignableRole, string> = {
  CUSTOMER: "Customer",
  STAFF: "Staff",
  ADMIN: "Admin",
};

export function RoleSelect({ userId, role, isSelf }: { userId: string; role: AssignableRole; isSelf: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState<AssignableRole>(role);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  const dirty = value !== role;

  // Admins cannot demote themselves (mirrors the server-side lockout guard).
  if (isSelf) {
    return (
      <div className="flex items-center gap-2">
        <Select aria-label={`Role for ${userId}`} value={value} disabled className="h-9 w-36">
          <option value="ADMIN">Admin</option>
        </Select>
        <span className="text-xs text-muted-foreground">That&rsquo;s you</span>
      </div>
    );
  }

  function onSave() {
    setSaved(false);
    setFailed(false);
    start(async () => {
      const fd = new FormData();
      fd.set("userId", userId);
      fd.set("role", value);
      const res = await setUserRoleAction(fd);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setFailed(true);
        setValue(role); // revert on rejection (e.g. self-demotion guard)
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label={`Role for ${userId}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value as AssignableRole);
          setSaved(false);
          setFailed(false);
        }}
        className="h-9 w-36"
      >
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </Select>
      <Button type="button" size="sm" variant="outline" onClick={onSave} disabled={pending || !dirty}>
        {pending && <Spinner />} Save
      </Button>
      {saved && !dirty && <span className="text-xs text-primary">Saved</span>}
      {failed && <span className="text-xs text-destructive">Not allowed</span>}
    </div>
  );
}
