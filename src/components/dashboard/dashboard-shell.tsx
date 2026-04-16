import Link from "next/link";
import { LayoutDashboard, Map, Sun } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Leads", icon: LayoutDashboard },
  { href: "/dashboard/map", label: "Map", icon: Map },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-slate-800 bg-slate-950/90 p-4 md:block">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          <Sun className="h-6 w-6 text-amber-400" />
          Georgeo_Solar
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
