import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

const NAV_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-40 bg-primary shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/home" className="text-xl font-extrabold tracking-tight text-white">
          LocalGuide
        </Link>

        <nav className="hidden gap-2 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LogoutButton />
      </div>

      <nav className="flex justify-center gap-2 pb-3 sm:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${active === item.href ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
