import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { Car, Map, Heart, Bookmark, LayoutDashboard, LogIn, Plus } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RightWhip — Used cars, found simply",
  description: "Search, filter, and save used car listings.",
};

const navLinks = [
  { href: "/listings", label: "Browse", icon: Car },
  { href: "/map", label: "Map", icon: Map },
  { href: "/favourites", label: "Favourites", icon: Heart },
  { href: "/saved-searches", label: "Saved searches", icon: Bookmark },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("access_token"));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
          <nav className="max-w-6xl mx-auto flex items-center gap-1 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 mr-6 shrink-0">
              <div className="bg-brand text-white rounded-lg p-1.5">
                <Car size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                RightWhip
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1 flex-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard/new"
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Post a listing
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </header>

        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
