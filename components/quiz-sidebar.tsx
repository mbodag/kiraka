"use client";

import React from 'react';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const Sidebar = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white border-r border-gray-700">
      {/* Logo, company name, and horizontal line */}
      <div className="py-4 mb-2 w-full text-center">
        <Link href="/">
          <div className="inline-flex items-center justify-center cursor-pointer mr-8">
            <div className="relative w-8 h-8 mr-4 inline-block">
              <Image
                src="/Kiraka_Logo.png"
                alt="Kiraka Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="text-2xl font-bold">Kiraka.ai</span>
          </div>
        </Link>
        <hr className="border-t border-gray-700 mt-2 w-3/4 mx-auto" />{" "}
        {/* Horizontal line */}
      </div>

      {/* Spacer div */}
      <div className="flex-grow"></div>

      {/* User button at the bottom */}
      <div className="flex item-center m-2">
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
        <div>
          {user ? (
            <div className=" m-2">
              <div className="text-sm font-medium">{user.fullName}</div>
            </div>
          ) : (
            <div className="text-sm font-medium">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
