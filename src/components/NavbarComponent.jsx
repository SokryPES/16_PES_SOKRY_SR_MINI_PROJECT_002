"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "../store/cartStore";

const centerLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop", badge: "NEW" },
  { href: "/manage-products", label: "Manage Products" },
  { href: "/orders", label: "Orders" },
];

function CartBagIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}

function linkActive(pathname, label) {
  if (label === "Home") return pathname === "/";
  if (label === "Shop")
    return pathname === "/products" || pathname.startsWith("/products/");
  if (label === "Categories") return pathname === "/categories";
  if (label === "Orders") return pathname === "/orders";
  if (label === "Manage Products") return pathname === "/manage-products";
  return false;
}

function authLinkClass(pathname, path, filled = false) {
  const on = pathname === path;
  if (filled) {
    return on
      ? "rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm"
      : "rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-lime-300";
  }
  return on
    ? "rounded-full px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300"
    : "rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 hover:ring-1 hover:ring-gray-200";
}

export default function NavbarComponent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { data: session, status } = useSession();
  const totalQuantity = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    if (status === "loading") {
      console.log("Session status: loading");
      return;
    }

    if (status === "authenticated") {
      console.log("Session authenticated user:", session?.user);
      return;
    }

    console.log("No active session (unauthenticated)");
  }, [status, session]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }

    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);
  const cartLabel =
    totalQuantity > 0 ? `Shopping cart, ${totalQuantity} items` : "Shopping cart";

  const linkClass = (active) =>
    `relative flex items-center rounded-full px-3 py-2 text-sm font-medium transition ${
      active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
    }`;

  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/60 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 py-3 lg:py-4">
        <Link
          href="/"
          className="z-10 shrink-0 text-lg font-semibold tracking-tight text-gray-900 transition hover:text-lime-700"
        >
          PurelyStore
        </Link>

        <nav
          className="absolute left-1/2 hidden w-auto -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Main"
        >
          {centerLinks.map(({ href, label, badge }) => {
            const active = linkActive(pathname, label);
            return (
              <Link
                key={href + label}
                href={href}
                className={linkClass(active)}
              >
                {/* <Link key={href + label} href={href}> */}
                {badge && (
                  <span className="absolute -top-2 z-20 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-gray-900">
                    {badge}
                  </span>
                )}
                <span className={badge ? "inline-block leading-none" : ""}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="z-10 flex items-center gap-2 sm:gap-3">
          {!session?.user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={authLinkClass(pathname, "/login", false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={authLinkClass(pathname, "/register", true)}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className={`relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
                  pathname === "/profile"
                    ? "border-lime-500 bg-lime-400 text-gray-900"
                    : "border-gray-200 text-gray-700 hover:border-lime-300 hover:bg-lime-50"
                }`}
              >
                {session?.user?.email?.charAt(0).toUpperCase()}
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full rounded-lg px-3 py-2 cursor-pointer text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          
          <Link
            href="/cart"
            aria-label={cartLabel}
            title={cartLabel}
            className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
              pathname === "/cart"
                ? "border-lime-500 bg-lime-400 text-gray-900"
                : "border-gray-200 text-gray-700 hover:border-lime-300 hover:bg-lime-50"
            }`}
          >
            <CartBagIcon className="size-5" />
            <span
              className={`absolute -right-0.5 -top-0.5 flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-teal-900 px-1 text-[10px] font-semibold leading-none text-lime-300 tabular-nums transition-opacity ${
                totalQuantity > 0 ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden
            >
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          </Link>

          <Button
            isIconOnly
            variant="secondary"
            className="h-10 w-10 shrink-0 rounded-full border border-gray-200 text-gray-700 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onPress={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? "✕" : "☰"}
          </Button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-gray-100 bg-white py-3 md:hidden"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
            {centerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-lime-800 hover:bg-lime-50"
            >
              Register
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cart {totalQuantity > 0 ? `(${totalQuantity})` : ""}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
