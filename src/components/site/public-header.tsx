import Link from "next/link";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Sun className="h-6 w-6 text-amber-400" aria-hidden />
          <span>Georgeo_Solar</span>
          <span className="hidden text-slate-500 sm:inline">· Duck4 Solar</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/projects">Projects</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/quote">Get quote</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/login">Customer login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
