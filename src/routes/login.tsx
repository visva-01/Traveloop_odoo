import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { isEmail } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Traveloop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!isEmail(email)) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border bg-gradient-card p-8 shadow-elegant">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to continue planning.</p>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full shadow-glow">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/forgot" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
          <Link to="/signup" className="font-medium">Create account</Link>
        </div>
      </div>
    </div>
  );
}
