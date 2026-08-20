"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackLookup() {
  const [code, setCode] = useState("");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="display text-4xl">
        Suivre ma <span className="ember-text">commande</span>
      </h1>
      <p className="mt-3 text-sm text-cream/65">
        Entrez le numéro reçu à la confirmation, par exemple MSS-4F2K9.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clean = code.trim().toUpperCase();
          if (clean) router.push(`/track/${clean}`);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          className="field flex-1 px-4 py-3 text-sm uppercase"
          placeholder="MSS-XXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn-ember rounded-full px-6 text-sm">→</button>
      </form>
    </div>
  );
}
