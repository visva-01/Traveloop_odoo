import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth";
import { isEmail } from "@/lib/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Traveloop" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (!isEmail(email)) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await signup(name, email, password);
      toast.success("Account created. Let's plan!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border bg-gradient-card p-8 shadow-elegant">
        <h1 className="text-2xl font-bold">Start planning</h1>
        <p className="text-sm text-muted-foreground mt-1">It takes 30 seconds.</p>
        <motion.form variants={container} initial="hidden" animate="show" onSubmit={submit} className="space-y-4 mt-6">
          <motion.div variants={item} className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </motion.div>
          <motion.div variants={item} className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </motion.div>
          <motion.div variants={item} className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
            <p className="text-xs text-muted-foreground">At least 6 characters.</p>
          </motion.div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <motion.div variants={item}>
            <Button type="submit" disabled={busy} className="w-full shadow-glow">
              {busy ? "Creating…" : "Create account"}
            </Button>
          </motion.div>
        </motion.form>
        <div className="mt-4 text-sm text-center">
          Already a member? <Link to="/login" className="font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
