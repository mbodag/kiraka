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

const textStyle = {
  fontSize: '1rem', // Adjust this value as needed
  fontWeight: '450', // Set the font weight here
  padding: '8px 16px', // Example padding
};

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="relative flex items-center justify-between p-4 w-full bg-transparent">
      {/* Logo and title on the left */}
      <Link href="/" passHref>
        <div className="flex items-center cursor-pointer">
          <Image
            src="/Kiraka_Logo.png"
            alt="Kiraka Logo"
            width={30}
            height={30}
            objectFit="contain"
          />
          <span className="text-2xl font-bold text-white ml-4">Kiraka.ai</span>
        </div>
      </Link>

      {/* Center navigation links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-6">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} passHref>
            <div style={textStyle} className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer">
              {route.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Sign-in button on the right */}
      <Link href={isSignedIn ? "/instructions" : "/sign-in"} passHref>
        <Button
          // variant="outline"
          style={textStyle} className="text-white bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-800 transition-all rounded-full px-6 py-2 cursor-pointer"
        >
          Sign In
        </Button>
      </Link>
    </nav>
  );
};