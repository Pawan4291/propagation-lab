import { NavLink } from "react-router-dom";
import { NetworkPicker } from "./NetworkPicker";
import { StatusPill } from "./StatusPill";

const links = [
  { to: "/", label: "Home" },
  { to: "/flexnode", label: "Flexnode Lab" },
  { to: "/monitor", label: "Monitor" },
  { to: "/deadline", label: "Deadline Lab" },
  { to: "/method", label: "Method" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <img src="/favicon.png" alt="" className="h-7 w-7 rounded-full border border-[var(--color-line)]" />
          <span className="text-[15px]">Propagation Lab</span>
        </NavLink>
        <nav className="order-3 flex w-full flex-wrap gap-1 text-sm sm:order-2 sm:ml-4 sm:w-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 font-medium transition-colors ${
                  isActive ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-graphite)] hover:bg-[var(--color-silver-hi)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <StatusPill />
          <NetworkPicker />
        </div>
      </div>
    </header>
  );
}
