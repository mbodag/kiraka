"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  CircleUserRoundIcon,
  HelpCircleIcon,
  HomeIcon,
  Trash2Icon,
} from "lucide-react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    label: "My Kiraka",
    icon: HomeIcon,
    href: "/dashboard",
    color: "text-slate-500",
  },
  {
    label: "Account",
    icon: CircleUserRoundIcon,
    href: "/account",
    color: "text-slate-500",
  },
  {
    label: "Trash",
    icon: Trash2Icon,
    href: "/trash",
    color: "text-slate-500",
  },
  {
    label: "Support",
    icon: HelpCircleIcon,
    href: "/support",
    color: "text-slate-500",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image fill alt="logo" src="/favicon.ico" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            kiraka.ai
          </h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-4 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("w-6 h-6 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div></div>
      <div className="px-3 py-2 flex flex-col justify-end">
        <div className="flex flex-col w-full p-4 justify-start">
          <div className="flex items-center flex-1">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
