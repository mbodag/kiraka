"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
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
          <Image src="/Kiraka_Logo.png" alt="Kiraka Logo" layout="fill" objectFit="contain" />
        </div>
        <h1 className={cn("text-2xl font-bold text-white")}>
        {/* it was: <h1 className={cn("text-2xl font-bold text-white", font.className)}></h1> */}
          Kiraka.ai
        </h1>
      </Link>
      <div className="flex items-center justify-center text-white">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <div className="px-4 hover:border hover:border-white hover:rounded-lg hover:bg-white/10 font-medium cursor-pointer transition">
              {route.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex item-center gap-x-2">
        <div>
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <Button
              variant="outline"
              className="rounded-full border-none hover:bg-green-100"
            >
              Get Started
            </Button>
          </Link>
        </div>
        <div>
          <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
            <Button
              variant="outline"
              className="rounded-full border-none hover:bg-green-100"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
