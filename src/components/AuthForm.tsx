"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { lang } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const messages: Record<string, { fr: string; en: string }> = {
    EMAIL_TAKEN: { fr: "Ce courriel a déjà un compte.", en: "That email already has an account." },
    INVALID_CREDENTIALS: { fr: "Courriel ou mot de passe incorrect.", en: "Wrong email or password." },
    INVALID_INPUT: {
      fr: "Vérifiez les champs — le mot de passe doit faire au moins 8 caractères.",
      en: "Check the fields — password must be at least 8 characters.",
    },
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, phone, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const m = messages[data.error as string];
        setError(m ? (lang === "fr" ? m.fr : m.en) : lang === "fr" ? "Une erreur est survenue." : "Something went wrong.");
        return;
      }
      router.push(data.user?.role === "ADMIN" ? "/admin" : "/account");
      router.refresh();
    } catch {
      setError(lang === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="display text-4xl">
        {isSignup ? (
          <>Créer un <span className="ember-text">compte</span></>
        ) : (
          <>Bon <span className="ember-text">retour</span></>
        )}
      </h1>
      <p className="mt-3 text-sm text-cream/65">
        {isSignup
          ? lang === "fr"
            ? "Sauvegardez vos adresses et retrouvez vos commandes."
            : "Save your addresses and find past orders."
          : lang === "fr"
            ? "Connectez-vous pour commander plus vite."
            : "Log in to order faster."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {isSignup && (
          <>
            <input
              className="field w-full px-4 py-3 text-sm"
              placeholder={lang === "fr" ? "Nom complet" : "Full name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
            <input
              className="field w-full px-4 py-3 text-sm"
              placeholder={lang === "fr" ? "Téléphone" : "Phone"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
            />
          </>
        )}
        <input
          className="field w-full px-4 py-3 text-sm"
          type="email"
          placeholder={lang === "fr" ? "Courriel" : "Email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="field w-full px-4 py-3 text-sm"
          type="password"
          placeholder={lang === "fr" ? "Mot de passe" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isSignup ? 8 : 1}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {error && <p className="rounded-lg bg-flame/15 px-3 py-2 text-sm text-flame">{error}</p>}

        <button disabled={busy} className="btn-ember w-full rounded-full py-3.5 text-sm">
          {busy ? "…" : isSignup ? (lang === "fr" ? "Créer le compte" : "Create account") : (lang === "fr" ? "Se connecter" : "Log in")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-smoke">
        {isSignup ? (
          <>
            {lang === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
            <Link href="/login" className="text-gold hover:underline">
              {lang === "fr" ? "Connexion" : "Log in"}
            </Link>
          </>
        ) : (
          <>
            {lang === "fr" ? "Pas encore de compte ?" : "No account yet?"}{" "}
            <Link href="/signup" className="text-gold hover:underline">
              {lang === "fr" ? "Créer un compte" : "Sign up"}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
