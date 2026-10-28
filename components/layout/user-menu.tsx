"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

interface UserMenuProps {
  name: string;
  email: string | null;
  role: string | null;
  userId: string;
  signOutAction: () => Promise<void>;
}

export function UserMenu({ name, email, role, userId, signOutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, startSignOut] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "ADMIN";
  const label = name || email || userId;
  const initials = (label.trim()[0] ?? "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSignOut(e: FormEvent) {
    e.preventDefault();
    startSignOut(async () => {
      await signOutAction();
    });
  }

  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{label}</p>
            {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
          </div>
          <div className="p-1">
            <Link href="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Profile
            </Link>
            {isAdmin && (
              <Link href="/admin" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Admin
              </Link>
            )}
            <form onSubmit={handleSignOut}>
              <button type="submit" role="menuitem" className={itemClass} disabled={pending}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
