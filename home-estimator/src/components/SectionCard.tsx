import type { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function SectionCard({ title, eyebrow, action, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
