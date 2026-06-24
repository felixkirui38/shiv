"use client";

import { useEffect, useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { ExternalLink, Loader2, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/lib/brand";

const STAFF_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "CLAIMS_OFFICER",
  "MARKETING",
  "AGENT",
]);

const DEV_ADMIN_EMAIL = "admin@shivinsbro.co.ke";

interface AdminCmsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isStaffRole(role?: string | null) {
  return role ? STAFF_ROLES.has(role) : false;
}

export function AdminCmsPopup({ open, onOpenChange }: AdminCmsPopupProps) {
  const { data: session, status, update } = useSession();
  const [email, setEmail] = useState(DEV_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cmsReady, setCmsReady] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const role = session?.user?.role;
  const showCms = cmsReady || (status === "authenticated" && isStaffRole(role));

  useEffect(() => {
    if (!open) {
      setCmsReady(false);
      setError("");
      return;
    }
    if (status === "authenticated" && isStaffRole(session?.user?.role)) {
      setCmsReady(true);
      setIframeKey((k) => k + 1);
    }
  }, [open, status, session?.user?.role]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Configuration") {
          setError(
            "Sign-in failed. Ensure the database is running (npx prisma dev -d), then run npm run db:seed and restart the dev server."
          );
        } else if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Run npm run db:seed:admin if this is a fresh database.");
        } else {
          setError(`Sign-in failed: ${result.error}. Check the terminal for details.`);
        }
        return;
      }

      await update();
      let nextSession = await getSession();

      if (!isStaffRole(nextSession?.user?.role)) {
        await new Promise((r) => setTimeout(r, 250));
        nextSession = await getSession();
      }

      if (!isStaffRole(nextSession?.user?.role)) {
        if (nextSession?.user) {
          setError("This account does not have staff CMS access.");
        } else {
          setError("Sign-in could not start a session. Check AUTH_SECRET and database connection.");
        }
        return;
      }

      setCmsReady(true);
      setIframeKey((k) => k + 1);
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close CMS"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-popup-title"
        className="relative flex h-[min(92vh,880px)] w-[min(96vw,1200px)] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" showLink={false} />
            <div>
              <h2 id="cms-popup-title" className="font-heading text-sm font-semibold text-white">
                Shiv CMS
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Staff only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showCms && (
              <a
                href="/admin/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline-flex"
              >
                <ExternalLink className="size-3.5" />
                Full window
              </a>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-slate-400 hover:text-white"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-slate-950">
          {loading || (showCms && status === "loading") ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="mr-2 size-5 animate-spin" />
              {loading ? "Signing in…" : "Opening CMS…"}
            </div>
          ) : showCms ? (
            <iframe
              key={iframeKey}
              title="Shiv Insurance CMS"
              src="/admin/dashboard"
              className="h-full w-full border-0 bg-slate-950"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <form
                onSubmit={handleLogin}
                className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg"
              >
                <p className="mb-1 text-center font-heading text-lg font-semibold text-white">
                  Staff sign in
                </p>
                <p className="mb-6 text-center text-xs text-slate-400">
                  {brand.name} content management
                </p>

                {error && (
                  <p className="mb-4 rounded-md bg-red-950/50 px-3 py-2 text-center text-sm text-red-300">
                    {error}
                  </p>
                )}

                {status === "authenticated" && !isStaffRole(role) && (
                  <p className="mb-4 rounded-md bg-amber-950/50 px-3 py-2 text-center text-sm text-amber-200">
                    Customer accounts cannot access the CMS. Use a staff login.
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cms-email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="cms-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                      className="mt-1 border-slate-700 bg-slate-950 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cms-password" className="text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="cms-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="mt-1 border-slate-700 bg-slate-950 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Open CMS
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    Or{" "}
                    <a
                      href="/login?admin=1&callbackUrl=/admin/dashboard"
                      className="text-accent hover:underline"
                    >
                      sign in on the full login page
                    </a>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
