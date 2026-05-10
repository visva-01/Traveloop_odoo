import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isEmail, resetPassword } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Reset password — Traveloop" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!isEmail(email)) return setErr("Enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    try {
      await resetPassword(email, pwd);
      toast.success("Password updated. You can sign in now.");
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border bg-gradient-card p-8 shadow-elegant">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">Demo mode: set a new password directly.</p>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">New password</Label>
            <Input id="pwd" type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full">Update password</Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <Link to="/login" className="font-medium">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
