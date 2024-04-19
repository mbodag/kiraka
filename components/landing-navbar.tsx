"use client";

import { Montserrat } from "next/font/google";
import Image from "next/legacy/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

const routes = [
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="p-4 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-8 mr-4">
          <Image
            src="/Kiraka_Logo.png"
            alt="Kiraka Logo"
            width={30}
            height={30}
            objectFit="contain"
          />
        </div>
        <h1 className={cn("monospace-jetbrains-mono text-2xl font-bold text-white")}>
          Kiraka.ai
        </h1>
      </Link>
      <div className="flex-1 flex items-center justify-center text-white space-x-6">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <div className="px-4 py-2 hover:bg-white/20 rounded-lg transition-all">
              {route.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex item-center gap-x-2">
        <div>
          <Link href={isSignedIn ? "/instructions" : "/sign-in"}>
            <Button
              variant="outline"
              className="text-white bg-green-500 hover:bg-green-600 transition-all rounded-full px-6 py-2"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
