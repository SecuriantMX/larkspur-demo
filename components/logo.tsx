import Link from "next/link";

// Wordmark set like the painted sign over the loading door, with the street number boxed beside it.
export function Logo({ name, href = "/", inverted = false }: { name: string; href?: string; inverted?: boolean }) {
  return (
    <Link href={href} className="group flex items-stretch gap-0 leading-none" aria-label={`${name} home`}>
      <span
        className={`flex items-center px-1.5 font-mono text-[0.625rem] font-medium ${
          inverted ? "bg-tape text-tape-ink" : "bg-ink text-paper"
        }`}
      >
        1720
      </span>
      <span
        className={`flex items-center border-2 px-2 py-1 font-stencil text-xl tracking-wide uppercase ${
          inverted ? "border-tape text-tape" : "border-ink text-ink"
        }`}
      >
        {name}
      </span>
    </Link>
  );
}
