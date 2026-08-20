export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = { sm: "text-lg", md: "text-2xl", lg: "text-5xl sm:text-7xl" }[size];
  const sub = { sm: "text-[7px]", md: "text-[9px]", lg: "text-[11px] sm:text-sm" }[size];

  return (
    <div className="inline-flex flex-col items-center leading-none select-none">
      <span className={`sign ${scale} text-gold tracking-[0.22em] pl-[0.22em]`}>MR</span>
      <span className={`sign ${scale}`}>
        <span className="text-cream">SMOKE</span>
        <span className="text-flame"> ET </span>
        <span className="text-cream">SLICE</span>
      </span>
      <span className={`strip ${sub} text-smoke mt-1`}>L&apos;amour à la première slice</span>
    </div>
  );
}

export function HalalBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-halal/50 bg-halal/10 px-2.5 py-1 accent text-[11px] text-halal ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Zm-1 13.4-3.2-3.2 1.4-1.4L11 12.6l4.8-4.8 1.4 1.4L11 15.4Z" />
      </svg>
      HALAL
    </span>
  );
}
