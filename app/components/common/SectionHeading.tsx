import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center space-y-3"
          : "flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      }
    >
      <div className={align === "center" ? "space-y-2" : "space-y-2 md:max-w-xl"}>
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-brand-dark">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-brand-muted leading-relaxed">{description}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-accent"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
