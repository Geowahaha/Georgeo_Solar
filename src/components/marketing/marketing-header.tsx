import Link from "next/link";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/quote", label: "Order" },
  { href: "/login", label: "Account" },
];

export function MarketingHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="text-[15px] font-medium tracking-[0.02em] text-white hover:text-white/80"
        >
          GeorGeo Duck4 Solar
        </Link>
        <nav className="flex items-center gap-6 sm:gap-10">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium tracking-[0.04em] text-white/90 uppercase hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
