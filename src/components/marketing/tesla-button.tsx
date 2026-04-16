import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

export function TeslaButton({ href, children, variant = "primary", className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[40px] min-w-[200px] items-center justify-center px-8 text-sm font-medium tracking-wide transition-colors",
        variant === "primary" &&
          "bg-white text-black hover:bg-white/90",
        variant === "outline" &&
          "border border-white bg-transparent text-white hover:bg-white hover:text-black",
        className,
      )}
    >
      {children}
    </Link>
  );
}
