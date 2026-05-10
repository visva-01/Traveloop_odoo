import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "@/lib/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "Reset password — Traveloop" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || pwd.length < 6) return setErr("Check your details.");
    setBusy(true);
    try {
      await resetPassword(email, pwd);
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-gradient-card p-8 shadow-elegant"
      >
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your security credentials.</p>
        
        {done ? (
          <div className="mt-6 text-center">
            <p className="text-sm">Your password has been updated.</p>
            <Button asChild className="mt-4"><Link to="/login">Sign in now</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="email">Account email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">New password</Label>
              <PasswordInput id="pwd" required value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Updating…" : "Update password"}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to login</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
