import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth";
import { deleteAccount, isEmail, updateUser } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Traveloop" }] }),
  component: () => <RequireAuth><Profile /></RequireAuth>,
});

function Profile() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrencyState] = useState("USD");
  const [avatar, setAvatar] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    import("@/lib/store").then(({ getCurrency }) => {
      setCurrencyState(getCurrency());
    });
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name); 
      setEmail(user.email);
      setLanguage(user.language ?? "en"); 
      setAvatar(user.avatar ?? "");
      if (user.currency) {
        setCurrencyState(user.currency);
        import("@/lib/store").then(({ setCurrency }) => setCurrency(user.currency!));
      }
    }
  }, [user]);

  const onAvatar = (f?: File) => {
    if (!f) return;
    if (f.size > 1_000_000) return setErr("Avatar must be under 1MB.");
    const r = new FileReader();
    r.onload = () => setAvatar(r.result as string);
    r.readAsDataURL(f);
  };

  const save = async () => {
    setErr("");
    if (name.trim().length < 2) return setErr("Name too short.");
    if (!isEmail(email)) return setErr("Invalid email.");
    
    // Save to database
    await updateUser({ name, email, language, avatar, currency });
    
    // Also save to local storage for immediate UI reflection and guest-mode compatibility
    import("@/lib/store").then(({ setCurrency }) => {
      setCurrency(currency);
    });
    
    toast.success("Profile saved");
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Profile & settings</h1>

      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-bold text-xl overflow-hidden">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <Label htmlFor="av">Avatar</Label>
            <Input id="av" type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0])} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div>
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrencyState}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end"><Button onClick={save}><Save /> Save</Button></div>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all trips.</p>
        <Button
          variant="destructive" className="mt-4"
          onClick={async () => {
            if (confirm("Delete account? This cannot be undone.")) {
              await deleteAccount();
              toast.success("Account deleted");
              nav({ to: "/" });
            }
          }}
        >
          <Trash2 /> Delete account
        </Button>
      </div>
    </div>
  );
}
