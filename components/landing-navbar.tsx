"use client";

import { Montserrat } from "next/font/google";
import Image from "next/legacy/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
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

const textStyle = {
  fontSize: '1rem',
  fontWeight: '450',
  padding: '8px 16px',
};

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="relative flex items-center justify-between p-4 w-full bg-transparent">
      {/* Logo and title on the left */}
      <Link href="/" passHref>
          <div className="inline-flex text-white items-center justify-center cursor-pointer mr-8">
            <div className="relative w-8 h-8 mr-4 inline-block">
              <Image
                src="/Kiraka_Logo.png"
                alt="Kiraka Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="monospace-jetbrains-mono text-2xl font-bold">Kiraka.ai</span>
          </div>
        </Link>

      {/* Center navigation links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-6">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} passHref>
            <div style={textStyle} className="px-4 py-2 text-white bg-white/15 hover:bg-white/30 rounded-full transition-all cursor-pointer">
              {route.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Sign-in button on the right */}
      <Link href={isSignedIn ? "/instructions" : "/sign-in"} passHref>
        <Button
          // variant="outline"
          style={textStyle} className="text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all rounded-full px-6 py-2 cursor-pointer"
        >
          Sign In
        </Button>
      </Link>
    </nav>
  );
};